// layout.js

/**
 * YouTubeのプレイヤー下に #below と #secondary を横並びで配置するカスタムレイアウトを適用する
 */
function applyCustomLayout() {
  const player = document.getElementById('player');
  const below = document.getElementById('below');
  const secondary = document.getElementById('secondary');

  if (!player || !below || !secondary) return;
  if (document.getElementById('layout-below')) return;

  // プレイヤー横幅調整
  player.style.width = '100%';
  player.style.maxWidth = '100%';

  // 新しいレイアウト用ラッパー
  const layout = document.createElement('div');
  layout.id = 'layout-below';
  layout.style.display = 'flex';
  layout.style.flexDirection = 'row';
  layout.style.width = '100%';
  layout.style.gap = '16px';

  // layout に below, secondary を移動
  layout.appendChild(below);
  layout.appendChild(secondary);

  // layout を player の直後に挿入
  const parent = player.parentNode;
  if (player.nextSibling) {
    parent.insertBefore(layout, player.nextSibling);
  } else {
    parent.appendChild(layout);
  }

  // 比率調整
  below.style.flex = '2';
  secondary.style.flex = '1';
}

/**
 * 元の縦並びレイアウトに戻す
 */
function revertLayout() {
  const layout = document.getElementById('layout-below');
  const player = document.getElementById('player');
  const below = document.getElementById('below');
  const secondary = document.getElementById('secondary');
  const columns = document.getElementById('columns');

  if (!player || !below || !secondary || !columns) return;

  // layout ラッパー削除
  if (layout) layout.remove();

  const parent = player.parentNode;
  if (parent && player.nextSibling !== below) {
    parent.insertBefore(below, player.nextSibling);
  }

  columns.appendChild(secondary);

  // スタイルを初期状態に戻す
  [player, below, secondary].forEach(el => {
    if (el instanceof HTMLElement) {
      el.style.width = '';
      el.style.maxWidth = '';
      el.style.flex = '';
      el.style.display = '';
    }
  });
}

export { applyCustomLayout, revertLayout };
