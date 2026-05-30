// layout.js

const STYLE_ID = 'ytcr-style';
const ACTIVE_CLASS = 'ytcr-active';
const GRID_CSS = `
#columns.${ACTIVE_CLASS} {
  display: grid !important;
  grid-template-columns: 2fr 1fr;
  grid-template-areas: "player player" "below secondary";
  gap: 16px;
  width: 100% !important;
  max-width: 100% !important;
  padding-left: 24px !important;
  padding-right: 24px !important;
  box-sizing: border-box !important;
}
#columns.${ACTIVE_CLASS} > #primary,
#columns.${ACTIVE_CLASS} #primary-inner { display: contents !important; }
#columns.${ACTIVE_CLASS} #player    { grid-area: player; width: 100% !important; max-width: 100% !important; }
#columns.${ACTIVE_CLASS} #below     { grid-area: below; min-width: 0; width: auto !important; }
#columns.${ACTIVE_CLASS} > #secondary { grid-area: secondary; min-width: 0; width: auto !important; margin-left: 0 !important; }
`;

function ensureStyleInjected() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = GRID_CSS;
  document.head.appendChild(style);
}

/**
 * #columns を CSS Grid 化して player をフル幅・below と secondary を横並びにする。
 * DOM は一切移動させず、クラス付与だけで切り替える。
 */
function applyCustomLayout() {
  const columns = document.getElementById('columns');
  if (!columns) return;
  ensureStyleInjected();
  columns.classList.add(ACTIVE_CLASS);
}

/**
 * クラスを外すだけで元のレイアウトに戻る。
 */
function revertLayout() {
  const columns = document.getElementById('columns');
  if (columns) columns.classList.remove(ACTIVE_CLASS);
}

export { applyCustomLayout, revertLayout };
