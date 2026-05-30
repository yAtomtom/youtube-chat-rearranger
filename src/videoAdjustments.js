// videoAdjustments.js

import { waitForElementToAppear } from './utils.js';

// 拡張機能が書き込んだインライン style を記録する。
// revert 時にこのマップを根拠に removeProperty で除去する。
const trackedStyles = new Map(); // HTMLElement -> Set<cssPropertyName>

function applyStyle(el, styles) {
  if (!el) return;
  let props = trackedStyles.get(el);
  if (!props) {
    props = new Set();
    trackedStyles.set(el, props);
  }
  for (const [prop, value] of Object.entries(styles)) {
    el.style.setProperty(prop, value);
    props.add(prop);
  }
}

const VIDEO_THRESHOLD_RATIO = 0.9;

/**
 * プレイヤー周りの要素を画面幅にフィットさせる。
 * read（getBoundingClientRect）と write（style 書き込み）を二相に分けて
 * layout thrashing を抑える。
 */
function fixVideoSize() {
  const video = document.querySelector('video.video-stream.html5-main-video');
  const container = document.querySelector('.html5-video-player');
  const videoContainer = document.querySelector('.html5-video-container');
  const player = document.getElementById('player');

  // --- read phase ---
  const threshold = window.innerWidth * VIDEO_THRESHOLD_RATIO;
  const videoW = video?.getBoundingClientRect().width ?? Infinity;
  const containerW = container?.getBoundingClientRect().width ?? Infinity;
  const videoContainerW = videoContainer?.getBoundingClientRect().width ?? Infinity;
  const playerW = player?.getBoundingClientRect().width ?? Infinity;

  // --- write phase ---
  if (video && videoW < threshold) {
    applyStyle(video, {
      width: '100%',
      height: '100%',
      'object-fit': 'contain',
      left: '0',
      top: '0',
      transform: 'none',
    });
  }
  if (videoContainer && videoContainerW < threshold) {
    applyStyle(videoContainer, {
      width: '100%',
      height: '100%',
      position: 'relative',
    });
  }
  if (container && containerW < threshold) {
    applyStyle(container, {
      width: '100%',
      height: '100%',
    });
  }
  if (player && playerW < threshold) {
    applyStyle(player, {
      width: '100%',
      height: 'auto',
    });
  }

  fixChromeBottom();
}

/**
 * YouTube の再生バー周りを動画と同じ幅にフィットさせる。
 */
function fixChromeBottom() {
  const chromeBottom = document.querySelector('.ytp-chrome-bottom');
  const chromeControls = document.querySelector('.ytp-chrome-controls');
  const gradientBottom = document.querySelector('.ytp-gradient-bottom');
  const moviePlayer = document.getElementById('movie_player');

  if (moviePlayer) applyStyle(moviePlayer, { position: 'relative' });

  const sharedStyles = {
    width: '100%',
    left: '0',
    right: '0',
    bottom: '0',
    top: 'auto',
    'box-sizing': 'border-box',
    position: 'absolute',
    'z-index': '1000',
  };
  [chromeBottom, chromeControls, gradientBottom].forEach((el) => {
    if (el) applyStyle(el, sharedStyles);
  });
}

/**
 * 拡張機能が書き込んだインライン style をすべて除去する。
 * 拡張機能 OFF 切替時・SPA 遷移時に呼び出す。
 */
function revertVideoStyles() {
  for (const [el, props] of trackedStyles) {
    if (!el.isConnected) continue;
    for (const prop of props) {
      el.style.removeProperty(prop);
    }
  }
  trackedStyles.clear();
}

/**
 * #columns 内部の DOM 変化に追従して fixVideoSize を再実行する。
 * - 監視対象を #columns に絞ることで body 全体監視を回避
 * - requestAnimationFrame でフレーム単位にバッチング
 * - signal が abort されたら observer を切断
 */
async function observeLayoutChanges(signal) {
  let target;
  try {
    target = await waitForElementToAppear('#columns', { signal, timeout: 10000 });
  } catch {
    return;
  }
  if (signal?.aborted) return;

  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      fixVideoSize();
    });
  });
  observer.observe(target, { childList: true, subtree: true });
  signal?.addEventListener('abort', () => observer.disconnect(), { once: true });
}

/**
 * シーク時のサムネイル（storyboard）のサイズをプレイヤーに合わせる。
 */
function syncStoryboardSize() {
  const player = document.querySelector('div.style-scope.ytd-player');
  const preview = document.querySelector('.ytp-storyboard-framepreview');
  const previewImg = document.querySelector('.ytp-storyboard-framepreview-img');
  if (!player || !preview || !previewImg) return;

  const playerWidth = player.clientWidth;
  const playerHeight = player.clientHeight;
  preview.style.width = `${playerWidth}px`;
  preview.style.height = `${playerHeight}px`;

  const originalWidth = previewImg.clientWidth;
  const originalHeight = previewImg.clientHeight;
  if (!originalWidth || !originalHeight) return;

  const scaleX = playerWidth / originalWidth;
  const scaleY = playerHeight / originalHeight;
  previewImg.style.width = `${originalWidth}px`;
  previewImg.style.height = `${originalHeight}px`;
  previewImg.style.transformOrigin = 'top left';
  previewImg.style.transform = `scale(${scaleX}, ${scaleY})`;
}

/**
 * シークバー hover / window resize で storyboard サイズを追従させる。
 * AbortSignal でイベントリスナーをまとめて解除可能。
 */
function attachStoryboardTracking(signal) {
  let rafId = 0;
  const schedule = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      syncStoryboardSize();
    });
  };

  document.addEventListener(
    'mousemove',
    (e) => {
      if (e.target?.closest?.('.ytp-progress-bar')) schedule();
    },
    { signal, passive: true }
  );
  window.addEventListener('resize', schedule, { signal, passive: true });
  schedule();
}

export {
  fixVideoSize,
  revertVideoStyles,
  observeLayoutChanges,
  syncStoryboardSize,
  attachStoryboardTracking,
};
