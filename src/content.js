// content.js (リファクタリング版)

import { applyCustomLayout, revertLayout } from './layout.js';
import { fixVideoSize } from './videoAdjustments.js';
import { getChatSrcWithWait, getLiveChatSrc, getVideoId } from './chatHandler.js';
import { isArchiveStream } from './streamStatus.js';

// 初期化
initializeLayout();
observeLayoutChanges();

/**
 * レイアウト初期化処理
 * 設定値を取得し、チャット iframe の src を設定後、レイアウトを適用または復元する。
 */
function initializeLayout() {
  chrome.storage.local.get('enabled', async (data) => {
    const isEnabled = data.enabled ?? true;
    if (isEnabled) {
      await ensureChatIframeSrc();
      waitForElements(() => {
        applyCustomLayout();
        fixVideoSize();
      });
    } else {
      waitForElements(revertLayout);
    }
  });
}

/**
 * 配信タイプに応じてチャット iframe の src を適切に設定する
 */
async function ensureChatIframeSrc() {
  const videoId = getVideoId();
  if (!videoId) return console.warn('[ChatFix] videoId 不明');

  if (isArchiveStream()) {
    await waitForElement('iframe#chatframe');
    const iframe = document.querySelector('iframe#chatframe');
    if (iframe && (!iframe.src || iframe.src.startsWith('about:blank')))
      iframe.src = await getChatSrcWithWait(videoId);
      console.log(`iframe.src: ${iframe.src}`)
  } else {
    await waitForElement('ytd-live-chat-frame iframe#chatframe');
    const iframe = document.querySelector('ytd-live-chat-frame iframe#chatframe');
    if (iframe && iframe.src !== getLiveChatSrc(videoId)) {
      iframe.src = getLiveChatSrc(videoId);
    }
  }
}

/**
 * 必要な要素が揃うまで待ち、callback を実行
 */
function waitForElements(callback) {
  const interval = setInterval(() => {
    const required = ['#player', '#below', '#secondary', '#columns']
      .map(s => document.querySelector(s))
      .every(Boolean);

    if (required) {
      clearInterval(interval);
      callback();
    }
  }, 500);
}

/**
 * 任意の DOM 要素が現れるまでポーリング
 */
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const interval = 100;
    let elapsed = 0;
    const check = () => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      elapsed += interval;
      if (elapsed >= timeout) return reject(`Timeout: ${selector}`);
      setTimeout(check, interval);
    };
    check();
  }).catch(console.warn);
}

/**
 * ストレージ設定が変更された場合にレイアウトを切り替える
 */
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    const isEnabled = changes.enabled.newValue;
    if (isEnabled) {
      console.log(`start layout`)
      waitForElements(applyCustomLayout) 
      ensureChatIframeSrc() // iframe.srcが空になることがあるので呼ぶ
    } else {
      revertLayout()
    };
  }
});

/**
 * DOM変化に応じて video サイズを自動再調整
 */
function observeLayoutChanges() {
  const observer = new MutationObserver(() => fixVideoSize());
  observer.observe(document.body, { childList: true, subtree: true });
}
