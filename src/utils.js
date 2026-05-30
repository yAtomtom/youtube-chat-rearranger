// src/utils.js

/**
 * 指定セレクタの要素が DOM に出現するのを待つ。
 * - エラーは呼び出し側に伝搬させる（catch で握り潰さない）
 * - AbortSignal でキャンセル可能
 * - 内部は MutationObserver ベース。ポーリングよりレイテンシが小さい。
 *
 * @param {string} selector
 * @param {{ timeout?: number, signal?: AbortSignal }} [options]
 * @returns {Promise<Element>}
 */
function waitForElementToAppear(selector, { timeout = 5000, signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException(`Aborted waiting for ${selector}`, 'AbortError'));
      return;
    }
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        cleanup();
        resolve(el);
      }
    });

    const onAbort = () => {
      cleanup();
      reject(new DOMException(`Aborted waiting for ${selector}`, 'AbortError'));
    };
    const onTimeout = () => {
      cleanup();
      reject(new Error(`Timeout waiting for ${selector}`));
    };
    const cleanup = () => {
      observer.disconnect();
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    };

    observer.observe(document.documentElement, { childList: true, subtree: true });
    const timer = setTimeout(onTimeout, timeout);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * YouTube の SPA 遷移を検知する。
 * YouTube が発火する 'yt-navigate-finish' イベントを購読することで、
 * history API のモンキーパッチを避ける。
 *
 * @param {() => void} callback
 * @param {{ signal?: AbortSignal }} [options]
 */
function onPageChange(callback, { signal } = {}) {
  let lastUrl = location.href;
  const handler = () => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    callback();
  };
  window.addEventListener('yt-navigate-finish', handler, { signal });
  window.addEventListener('popstate', handler, { signal });
}

export { waitForElementToAppear, onPageChange };
