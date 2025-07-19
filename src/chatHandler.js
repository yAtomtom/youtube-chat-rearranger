// chatHandler.js

import { getVideoId, waitForElement } from './utils.js';
import { isArchiveStream } from './streamStatus.js';

/**
 * チャット iframe に src を設定する（ライブ・アーカイブ両対応）
 */
export async function setupChatIframe() {
  const videoId = getVideoId();
  if (!videoId) {
    console.warn('[YTChatRearranger] Video ID not found');
    return;
  }

  if (isArchiveStream()) {
    await waitForElement('iframe#chatframe');
    const iframe = document.querySelector('iframe#chatframe');
    if (iframe && (!iframe.src || iframe.src.startsWith('about:blank'))) {
      iframe.src = await getChatSrcWithWait(videoId);
      // console.log('[YTChatRearranger] アーカイブチャットの src を設定:', iframe.src);
    }
  } else {
    await waitForElement('ytd-live-chat-frame iframe#chatframe');
    const iframe = document.querySelector('ytd-live-chat-frame iframe#chatframe');
    if (iframe) {
      const chatSrc = getLiveChatSrc(videoId);
      if (iframe.src !== chatSrc) {
        iframe.src = chatSrc;
        // console.log('[YTChatRearranger] ライブチャットの src を設定:', chatSrc);
      } else {
        // console.log('[YTChatRearranger] ライブチャットの src はすでに設定済み');
      }
    }
  }
}

/**
 * ライブチャットの iframe src を返す
 */
function getLiveChatSrc(videoId) {
  return `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${location.hostname}`;
}

/**
 * アーカイブチャットの iframe src を返す
 */
async function getChatSrcWithWait(videoId) {
  try {
    const ytData = await extractYtInitialDataFromScripts();
    const continuation = findContinuation(ytData);
    const playerOffsetMs = ytData?.videoDetails?.playerOffsetMs || 0;

    if (continuation) {
      return `https://www.youtube.com/live_chat_replay?continuation=${encodeURIComponent(continuation)}&dark_theme=true&authuser=0&playerOffsetMs=${playerOffsetMs}`;
    }

    // continuation が取れなければ fallback
    return `https://www.youtube.com/live_chat_replay?v=${videoId}&embed_domain=${location.hostname}`;
  } catch (e) {
    console.warn('[YTChatRearranger] ytInitialData 取得失敗:', e);
    return `https://www.youtube.com/live_chat_replay?v=${videoId}&embed_domain=${location.hostname}`;
  }
}

/**
 * YouTube の初期データスクリプトから JSON を抽出
 */
async function extractYtInitialDataFromScripts() {
  const scripts = [...document.querySelectorAll('script')];
  for (const script of scripts) {
    const text = script.textContent;
    if (text.includes('var ytInitialData =') || text.includes('window["ytInitialData"] =')) {
      try {
        const jsonText = text
          .split('ytInitialData =')[1]
          .split('};')[0] + '}';
        return JSON.parse(jsonText);
      } catch (e) {
        console.warn('[YTChatRearranger] ytInitialData パース失敗', e);
      }
    }
  }
  throw new Error('[YTChatRearranger] ytInitialData not found in scripts');
}

/**
 * ytInitialData ツリーから continuation を再帰的に探索
 */
function findContinuation(obj) {
  if (!obj || typeof obj !== 'object') return null;
  if (obj.continuation) return obj.continuation;

  for (const key in obj) {
    const result = findContinuation(obj[key]);
    if (result) return result;
  }
  return null;
}

export {
  getChatSrcWithWait,
  getLiveChatSrc,
  findContinuation,
  extractYtInitialDataFromScripts,
  waitForElement,
};