// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle');

  // 初期状態を読み込み
  chrome.storage.local.get('enabled', (data) => {
    toggle.checked = data.enabled ?? true; // 初期値は true
  });

  // 切り替え時に保存
  toggle.addEventListener('change', () => {
    chrome.storage.local.set({ enabled: toggle.checked });
  });
});