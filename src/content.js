// content.js (エントリーポイント)

import { applyCustomLayout, revertLayout } from './layout.js';
import {
  fixVideoSize,
  revertVideoStyles,
  observeLayoutChanges,
  attachStoryboardTracking,
  syncStoryboardSize,
} from './videoAdjustments.js';
import { isArchiveStream } from './streamStatus.js';
import { onPageChange, waitForElementToAppear } from './utils.js';

const REPLAY_BUTTON_LABELS = ['チャットのリプレイを表示', 'show chat replay'];

let initializedUrl = null;
let lifecycle = new AbortController();

// 起動
initializeLayout();
attachLifecycleListeners(lifecycle.signal);

// SPA 遷移時は observer / listener を一斉に作り直す
onPageChange(() => {
  lifecycle.abort();
  lifecycle = new AbortController();
  initializedUrl = null;
  initializeLayout();
  attachLifecycleListeners(lifecycle.signal);
});

// ストレージ変更（ポップアップの ON/OFF）に追従
chrome.storage.onChanged.addListener((changes) => {
  if (!changes.enabled) return;
  if (changes.enabled.newValue) {
    waitForColumns(() => {
      applyCustomLayout();
      fixVideoSize();
      syncStoryboardSize();
    }, lifecycle.signal);
  } else {
    revertLayout();
    revertVideoStyles();
  }
});

function attachLifecycleListeners(signal) {
  observeLayoutChanges(signal);
  attachStoryboardTracking(signal);
}

/**
 * 動画ページが開かれたときに以下を行う:
 * - レイアウトを適用 or 復元
 * - アーカイブの場合は「チャットのリプレイを表示」ボタンを自動クリック
 */
function initializeLayout() {
  const currentUrl = location.href;
  if (initializedUrl === currentUrl) return;
  initializedUrl = currentUrl;

  chrome.storage.local.get('enabled', (data) => {
    const isEnabled = data.enabled ?? true;
    waitForColumns(() => {
      if (isEnabled) {
        applyCustomLayout();
        fixVideoSize();
        syncStoryboardSize();
      } else {
        revertLayout();
        revertVideoStyles();
      }
    }, lifecycle.signal);
    ensureChatIframeSrc().catch(() => {});
  });
}

/**
 * チャット iframe が出現したら、アーカイブの場合に
 * 「チャットのリプレイを表示」ボタンを自動クリック。
 * iframe の src は YouTube 本体に任せる（拡張で上書きすると "Something went wrong" になる）。
 */
async function ensureChatIframeSrc() {
  try {
    await waitForElementToAppear('ytd-live-chat-frame iframe#chatframe', {
      signal: lifecycle.signal,
      timeout: 10000,
    });
  } catch {
    return;
  }
  if (!isArchiveStream()) return;
  await autoShowChatReplay();
}

async function autoShowChatReplay(maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    if (lifecycle.signal.aborted) return;
    const btn = document.querySelector(
      'ytd-live-chat-frame #show-hide-button button'
    );
    const text = btn?.textContent ?? '';
    const lower = text.toLowerCase();
    const visible =
      btn && !btn.closest('#show-hide-button')?.hasAttribute('hidden');
    if (
      visible &&
      REPLAY_BUTTON_LABELS.some(
        (label) => text.includes(label) || lower.includes(label.toLowerCase())
      )
    ) {
      btn.click();
      return;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
}

/**
 * #columns の出現を待ち、出たら callback を実行する。
 * MutationObserver ベース。タイムアウト・abort 対応あり。
 */
function waitForColumns(callback, signal, timeout = 10000) {
  if (document.getElementById('columns')) {
    callback();
    return;
  }
  const observer = new MutationObserver(() => {
    if (document.getElementById('columns')) {
      cleanup();
      callback();
    }
  });
  const cleanup = () => {
    observer.disconnect();
    clearTimeout(timer);
    signal?.removeEventListener('abort', cleanup);
  };
  observer.observe(document.documentElement, { childList: true, subtree: true });
  const timer = setTimeout(cleanup, timeout);
  signal?.addEventListener('abort', cleanup, { once: true });
}
