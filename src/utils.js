// src/utils.js

/**
 * 現在のURLから YouTubeのvideoId を取得する
 * @returns {string|null}
 */
export function getVideoId() {
  const url = new URL(window.location.href);
  return url.searchParams.get('v') || window.location.pathname.split('/').pop();
}

/**
 * 指定セレクタのDOMが出現するまで待機
 * @param {string} selector - CSSセレクタ
 * @param {number} timeout - タイムアウト（ミリ秒）
 * @returns {Promise<Element>}
 */
export function waitForElement(selector, timeout = 5000) {
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
    console.warn(`[waitForElement] ${error}`);
  });
}
