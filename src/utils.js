// src/utils.js

/**
 * 現在のURLから YouTubeのvideoId を取得する
 * @returns {string|null}
 */
function getVideoId() {
  const url = new URL(window.location.href);
  return url.searchParams.get('v') || window.location.pathname.split('/').pop();
}

/**
 * 指定セレクタのDOMが出現するまで待機
 * @param {string} selector - CSSセレクタ
 * @param {number} timeout - タイムアウト（ミリ秒）
 * @returns {Promise<Element>}
 */
function waitForElementToAppear(selector, timeout = 5000) {
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
  }).catch((error) => {
    console.warn(`[YTChatRearranger] ${error}`);
  });
}

function onPageChange(callback) {
  let lastUrl = location.href;

  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      callback();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  const originalPush = history.pushState;
  const originalReplace = history.replaceState;

  history.pushState = function (...args) {
    originalPush.apply(this, args);
    window.dispatchEvent(new Event('yt-navigate'));
  };
  history.replaceState = function (...args) {
    originalReplace.apply(this, args);
    window.dispatchEvent(new Event('yt-navigate'));
  };

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('yt-navigate'));
  });

  window.addEventListener('yt-navigate', () => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      callback();
    }
  });
}

export { getVideoId, waitForElementToAppear, onPageChange };
