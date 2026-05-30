// layout.js

const ACTIVE_CLASS = 'ytcr-active';

/**
 * #columns に ytcr-active クラスを付与して CSS Grid を有効化する。
 * 実体のスタイルは layout.css にあり、manifest の content_scripts.css 経由でロードされる。
 */
function applyCustomLayout() {
  const columns = document.getElementById('columns');
  if (columns) columns.classList.add(ACTIVE_CLASS);
}

/**
 * クラスを外すだけで元のレイアウトに戻る。
 * （fixVideoSize が書き込んだインライン style の除去は revertVideoStyles 側で担当）
 */
function revertLayout() {
  const columns = document.getElementById('columns');
  if (columns) columns.classList.remove(ACTIVE_CLASS);
}

export { applyCustomLayout, revertLayout };
