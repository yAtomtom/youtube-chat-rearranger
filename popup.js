// popup.js
document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('toggle');

  try {
    const data = await chrome.storage.local.get('enabled');
    toggle.checked = data.enabled ?? true;
  } catch (e) {
    console.warn('[YTChatRearranger] storage.get failed:', e);
    toggle.checked = true; // 失敗時はデフォルト ON
  }

  toggle.addEventListener('change', async () => {
    try {
      await chrome.storage.local.set({ enabled: toggle.checked });
    } catch (e) {
      console.warn('[YTChatRearranger] storage.set failed:', e);
    }
  });
});
