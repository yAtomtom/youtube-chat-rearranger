// content.js (リファクタリング版)

import { applyCustomLayout, revertLayout } from './layout.js';
import { fixVideoSize, forceFullSizeLayout, observeLayoutChanges } from './videoAdjustments.js';
import { isArchiveStream } from './streamStatus.js';
import { onPageChange, waitForElementToAppear } from './utils.js';

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

  chrome.storage.local.get('enabled', (data) => {
    const isEnabled = data.enabled ?? true;
    // レイアウトは #columns が現れた瞬間に適用する（チャット処理は並列実行）
    waitForColumns(() => {
      if (isEnabled) {
        applyCustomLayout();
        fixVideoSize();
      } else {
        revertLayout();
      }
    });
    ensureChatIframeSrc();
  });
}

/**
 * チャット iframe の表示を確保する。
 * iframe.src は YouTube 本体に任せる（拡張側で上書きすると最新の YouTube では
 * "Something went wrong" になる）。アーカイブで「チャットのリプレイを表示」ボタンが
 * 表示中の場合は自動でクリックして YouTube に正規 URL を読み込ませる。
 */
async function ensureChatIframeSrc() {
  await waitForElementToAppear('ytd-live-chat-frame iframe#chatframe');
  if (!isArchiveStream()) return;
  await autoShowChatReplay();
}

/**
 * 「チャットのリプレイを表示」ボタンが表示されたら 1 回だけクリックする。
 * 表示されない (= 既に表示中 / チャット無効) 場合はそのまま諦める。
 */
async function autoShowChatReplay(maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    const btn = document.querySelector('ytd-live-chat-frame #show-hide-button button');
    if (btn && !btn.closest('#show-hide-button')?.hasAttribute('hidden')) {
      const text = btn.textContent || '';
      if (text.includes('チャットのリプレイを表示') || text.toLowerCase().includes('show chat replay')) {
        btn.click();
        return;
      }
    }
    await new Promise(r => setTimeout(r, 250));
  }
}

/**
 * #columns が DOM に追加された瞬間に callback を実行する。
 * MutationObserver ベースなのでポーリングより速い。既にあれば即時実行。
 */
function waitForColumns(callback) {
  if (document.getElementById('columns')) {
    callback();
    return;
  }
  const observer = new MutationObserver(() => {
    if (document.getElementById('columns')) {
      observer.disconnect();
      callback();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

/**
 * ストレージ設定が変更された場合にレイアウトを切り替える
 */
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    const isEnabled = changes.enabled.newValue;
    if (isEnabled) {
      waitForColumns(applyCustomLayout);
    } else {
      revertLayout();
    }
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
