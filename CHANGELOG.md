# Changelog
すべての notable な変更はこのファイルに記録されます。

このプロジェクトでは [Semantic Versioning](https://semver.org/lang/ja/) に従っています。

## [1.3] - 2026-07-01
### Fixed
- YouTube の split-scroll 機能導入に伴い、拡張適用時にチャット欄が動画の上に被る不具合を修正
  - レイアウト変更で split-scroll が有効化され `#secondary-inner` が固定配置でピン留めされるのが原因
  - `#columns.ytcr-active` スコープ内の CSS で `#secondary-inner` の固定配置を解除し、トリガーとなる `#secondary-split-scroll-spacer` を無効化（DOM 再配置はせず CSS のみで対応）

## [1.2] - 2026-05-30
### Fixed
- YouTube アップデートに伴いチャット欄に "Something went wrong" が表示される不具合を修正
  - チャット iframe を再配置せず、CSS Grid（`#primary` / `#primary-inner` への `display: contents`）でレイアウトを実現する方式に変更
  - チャット iframe の `src` を拡張側で上書きする処理を廃止し、YouTube 本体に任せる方式に変更
- アーカイブ動画でのチャット表示は「チャットのリプレイを表示」ボタンの自動クリックで対応

### Changed
- レイアウト適用を MutationObserver ベースに変更し、ページ表示直後の反映を高速化
- `manifest.json` の `run_at` を `document_end` に変更
- `#below` / `#secondary` の左右に余白を確保するため `#columns` に `padding: 0 24px` を追加

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
