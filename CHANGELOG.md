# Changelog
すべての notable な変更はこのファイルに記録されます。

このプロジェクトでは [Semantic Versioning](https://semver.org/lang/ja/) に従っています。

## [1.1] - 2025-08-17
### Added
- N/A

### Changed
- content.js を分割し、責務ごとにモジュール化
  - DOM 待機関数を utils.js に移動
  - 動画サイズ調整を videoAdjustments.js に移動
- `waitForElement` を `waitForElementToAppear` にリネーム

### Fixed
- 縦型動画の位置を調整
- シーク時のプレビューサイズを調整

## [1.0] - 2025-07-06
### Added
- 初期リリース
  - YouTube 動画ページのレイアウト調整
  - チャット欄の埋め込み制御
  - 設定 ON/OFF の popup UI
