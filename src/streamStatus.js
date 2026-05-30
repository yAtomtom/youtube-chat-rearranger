// src/streamStatus.js

const REPLAY_BUTTON_LABELS = [
  'チャットのリプレイを表示',
  'show chat replay',
];

const CHAT_DISABLED_MESSAGES = [
  'このライブ ストリームではチャットは無効です。',
  'Chat is disabled for this live stream',
];

function textMatchesAny(text, candidates) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return candidates.some(
    (c) => text.includes(c) || lower.includes(c.toLowerCase())
  );
}

/**
 * 配信がアーカイブ（ライブ終了済み）かどうかを判定する。
 * 優先度:
 *   1. 「チャットのリプレイを表示」ボタンが表示中ならアーカイブ
 *   2. ライブバッジが存在すればライブ
 *   3. 「チャット無効」メッセージが存在すればアーカイブ
 *   4. URL に live=1 があればライブ
 *   5. それ以外はアーカイブ扱い（保守的フォールバック）
 *
 * @returns {boolean}
 */
function isArchiveStream() {
  const replayBtn = document.querySelector('#show-hide-button button');
  const liveBadge = document.querySelector(
    'button.ytp-live-badge.ytp-live-badge-is-livehead'
  );

  if (
    replayBtn &&
    replayBtn.offsetParent !== null &&
    !replayBtn.hasAttribute('hidden') &&
    textMatchesAny(replayBtn.textContent, REPLAY_BUTTON_LABELS)
  ) {
    return true;
  }

  if (liveBadge) return false;

  const chatDisabled = [
    ...document.querySelectorAll(
      'ytd-live-chat-frame, ytd-live-chat-text-message-renderer'
    ),
  ].some((el) => textMatchesAny(el.textContent, CHAT_DISABLED_MESSAGES));
  if (chatDisabled) return true;

  if (new URL(location.href).searchParams.get('live') === '1') return false;

  return true;
}

export { isArchiveStream };
