// videoAdjustments.js

/**
 * プレイヤーやビデオ要素のサイズをウィンドウ幅に合わせて調整する
 */
function fixVideoSize() {
  const video = document.querySelector('video.video-stream.html5-main-video');
  const container = document.querySelector('.html5-video-player');
  const videoContainer = document.querySelector('.html5-video-container');
  const player = document.getElementById('player');

  const needsResize = (el) => {
    return el instanceof HTMLElement && el.getBoundingClientRect().width < window.innerWidth * 0.9;
  };

  if (video && needsResize(video)) {
    Object.assign(video.style, {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      left: '0',
      top: '0',
      transform: 'none',
    });
  }

  if (videoContainer && needsResize(videoContainer)) {
    Object.assign(videoContainer.style, {
      width: '100%',
      height: '100%',
      position: 'relative',
    });
  }

  if (container && needsResize(container)) {
    Object.assign(container.style, {
      width: '100%',
      height: '100%',
    });
  }

  if (player && needsResize(player)) {
    Object.assign(player.style, {
      width: '100%',
      height: 'auto',
    });
  }

  fixChromeBottom();
}

/**
 * YouTube の再生バー（コントロール UI）を <video> のサイズに合わせる
 */
function fixChromeBottom() {
  const chromeBottom = document.querySelector('.ytp-chrome-bottom');
  const chromeControls = document.querySelector('.ytp-chrome-controls');
  const gradientBottom = document.querySelector('.ytp-gradient-bottom');
  const moviePlayer = document.getElementById('movie_player');

  if (moviePlayer) {
    moviePlayer.style.position = 'relative';
  }

  [chromeBottom, chromeControls, gradientBottom].forEach((el) => {
    if (el) {
      Object.assign(el.style, {
        width: '100%',
        left: '0',
        right: '0',
        bottom: '0',
        top: 'auto',
        boxSizing: 'border-box',
        position: 'absolute',
        zIndex: '1000',
      });
    }
  });
}

export { fixVideoSize };
