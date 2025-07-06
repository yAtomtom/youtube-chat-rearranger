// src/streamStatus.js

/**
 * 配信がアーカイブ（ライブ配信終了）かどうかを判定する関数
 * YouTubeのチャット欄の表示やボタン、URLパラメータをチェックして判定する
 * 
 * @returns {boolean} trueならアーカイブ（ライブ終了）、falseならライブ中
 */
function isArchiveStream() {
  const replayBtn = document.querySelector('#show-hide-button button');

  // ライブバッジ（ライブ中を示す）の存在チェック
  const liveBadge = document.querySelector('button.ytp-live-badge.ytp-live-badge-is-livehead');

  // チャット無効メッセージの存在チェック
  const chatDisabledMsgExists = [...document.querySelectorAll('ytd-live-chat-frame, ytd-live-chat-text-message-renderer')]
    .some(el => el.textContent.includes('このライブ ストリームではチャットは無効です。'));

  const url = new URL(window.location.href);

  // リプレイ表示ボタンがあればアーカイブと判定
  if (replayBtn) {
    const style = getComputedStyle(replayBtn);
    if (style.display !== 'none' && !replayBtn.hasAttribute('hidden')) {
      const text = replayBtn.textContent || '';
      if (text.includes('チャットのリプレイを表示')) {
        // console.log('チャットリプレイ表示ボタンを検出 → 配信済み（アーカイブ）');
        return true;
      }
    }
  }

  if (liveBadge) {
    // console.log('ライブバッジを検出 → ライブ配信中');
    return false;
  }

  if (chatDisabledMsgExists) {
    // console.log('チャット無効メッセージを検出 → 配信済みかチャットなし');
    return true;
  }

  if (url.searchParams.get('live') === '1') {
    // console.log('URL パラメータに live=1 → ライブ配信中');
    return false;
  }

  // console.log('判定できず → 配信済みまたはライブではない');
  return true;
}

export { isArchiveStream }
