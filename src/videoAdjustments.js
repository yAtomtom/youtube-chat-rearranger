// videoAdjustments.js

/**
 * プレイヤーやビデオ要素のサイズをウィンドウ幅に合わせて調整する
 */
function fixVideoSize() {
  const video = document.querySelector('video.video-stream.html5-main-video');
  const container = document.querySelector('.html5-video-player');
  const videoContainer = document.querySelector('.html5-video-container');
  const player = document.getElementById('player');

  const needsResize = (el) => {
    return el instanceof HTMLElement && el.getBoundingClientRect().width < window.innerWidth * 0.9;
  };

  if (video && needsResize(video)) {
    Object.assign(video.style, {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      left: '0',
      top: '0',
      transform: 'none',
    });
  }

  if (videoContainer && needsResize(videoContainer)) {
    Object.assign(videoContainer.style, {
      width: '100%',
      height: '100%',
      position: 'relative',
    });
  }

  if (container && needsResize(container)) {
    Object.assign(container.style, {
      width: '100%',
      height: '100%',
    });
  }

  if (player && needsResize(player)) {
    Object.assign(player.style, {
      width: '100%',
      height: 'auto',
    });
  }

  fixChromeBottom();
}

/**
 * YouTube の再生バー（コントロール UI）を <video> のサイズに合わせる
 */
function fixChromeBottom() {
  const chromeBottom = document.querySelector('.ytp-chrome-bottom');
  const chromeControls = document.querySelector('.ytp-chrome-controls');
  const gradientBottom = document.querySelector('.ytp-gradient-bottom');
  const moviePlayer = document.getElementById('movie_player');

  if (moviePlayer) {
    moviePlayer.style.position = 'relative';
  }

  [chromeBottom, chromeControls, gradientBottom].forEach((el) => {
    if (el) {
      Object.assign(el.style, {
        width: '100%',
        left: '0',
        right: '0',
        bottom: '0',
        top: 'auto',
        boxSizing: 'border-box',
        position: 'absolute',
        zIndex: '1000',
      });
    }
  });
}

/**
 * DOM変化に応じて video サイズを自動再調整
 */
function observeLayoutChanges() {
  const observer = new MutationObserver(() => fixVideoSize());
  observer.observe(document.body, { childList: true, subtree: true });
}

function forceFullSizeLayout() {
  syncStoryboardSize();
}

function syncStoryboardSize() {
  const player = document.querySelector('div.style-scope.ytd-player');
  const preview = document.querySelector('.ytp-storyboard-framepreview');
  const previewImg = document.querySelector('.ytp-storyboard-framepreview-img');
  if (!player || !preview || !previewImg) return;

  const playerWidth = player.clientWidth;
  const playerHeight = player.clientHeight;

  // preview はプレイヤーサイズにする
  preview.style.width = `${playerWidth}px`;
  preview.style.height = `${playerHeight}px`;

  // previewImg は元の1コマサイズのまま
  const originalWidth = previewImg.clientWidth;
  const originalHeight = previewImg.clientHeight;

  // 拡大率計算
  const scaleX = playerWidth / originalWidth;
  const scaleY = playerHeight / originalHeight;

  // transform で拡大縮小。background-position はそのまま
  previewImg.style.width = `${originalWidth}px`;
  previewImg.style.height = `${originalHeight}px`;
  previewImg.style.transformOrigin = 'top left';
  previewImg.style.transform = `scale(${scaleX}, ${scaleY})`;
}

export { fixVideoSize, observeLayoutChanges, forceFullSizeLayout };
