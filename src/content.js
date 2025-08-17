// content.js (リファクタリング版)

import { applyCustomLayout, revertLayout } from './layout.js';
import { fixVideoSize, forceFullSizeLayout, observeLayoutChanges } from './videoAdjustments.js';
import { getChatSrcWithWait, getLiveChatSrc } from './chatHandler.js';
import { isArchiveStream } from './streamStatus.js';
import { getVideoId, onPageChange, waitForElementToAppear } from './utils.js';

let initializedUrl = null;

// 初期化
initializeLayout();
observeLayoutChanges();
setupPlayerObserver();

// ページ遷移にも対応
onPageChange(() => {
  // console.log('[YTChatRearranger] Page changed');
  initializeLayout();
});

/**
 * YouTube の動画ページが開かれたときに初期化処理を実行する。
 * - チャット iframe の修正
 * - レイアウトの適用または復元
 */
function initializeLayout() {
  const currentUrl = location.href;
  if (initializedUrl === currentUrl) return;
  initializedUrl = currentUrl;

  chrome.storage.local.get('enabled', async (data) => {
    const isEnabled = data.enabled ?? true;
    await ensureChatIframeSrc();
    if (isEnabled) {
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
  if (!videoId) return console.log('[YTChatRearranger] unknown videoId');

  if (isArchiveStream()) {
    await waitForElementToAppear('iframe#chatframe');
    const iframe = document.querySelector('iframe#chatframe');
    if (iframe && (!iframe.src || iframe.src.startsWith('about:blank')))
      iframe.src = await getChatSrcWithWait(videoId);
  } else {
    await waitForElementToAppear('ytd-live-chat-frame iframe#chatframe');
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
 * ストレージ設定が変更された場合にレイアウトを切り替える
 */
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    const isEnabled = changes.enabled.newValue;
    if (isEnabled) {
      waitForElements(applyCustomLayout) 
      ensureChatIframeSrc() // iframe.srcが空になることがあるので呼ぶ
    } else {
      revertLayout()
      ensureChatIframeSrc() // iframe.srcが空になることがあるので呼ぶ
    };
  }
});

/**
 * プレイヤーが現れたタイミングでフルサイズレイアウトを強制適用
 */
function setupPlayerObserver() {
  const observer = new MutationObserver(() => {
    if (document.querySelector('#player') && document.querySelector('#secondary')) {
      forceFullSizeLayout();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('load', forceFullSizeLayout);
}
