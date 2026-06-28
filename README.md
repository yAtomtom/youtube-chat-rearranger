# YouTube Chat Rearranger

YouTubeのライブ・アーカイブ動画において、デフォルト表示時にチャット欄を動画の下に配置する Chrome 拡張機能です。

自分の場合はチャット欄を別拡張機能で見るため、複窓にする際にチャット欄によって動画サイズが小さくなってしまうのを防ぐ目的で個人用に開発しました。

> 🛠 本拡張機能は 2026年5月30日現在の YouTube UI で動作確認しています。
> 個人用途のため、以降の UI 変更への追従は最小限の対応にとどまる可能性があります。

## スライド

- [紹介スライド](https://yatomtom.github.io/tech-talks/youtube-chat-rearranger/slide.html)（拡張機能の設計・実装方針）

## 機能概要

- 動画（#primary）の下に説明欄やコメント欄（#below）と横並びにする形でYouTubeチャット欄（#secondary）を表示
- アーカイブ動画ではチャットリプレイの表示ボタンを自動でクリックして表示
- 再生バーの UI も横幅に合わせてリサイズ
- デフォルト表示のみサポートしています（シアターモードはサポートしていません。）

## 構成ディレクトリ
```
.
├── src/
│ ├── content.js          # エントリーポイント（初期化／ライフサイクル管理）
│ ├── layout.js           # CSS Grid 用クラスの付与/解除
│ ├── videoAdjustments.js # プレイヤー・再生バー・storyboard 調整
│ ├── utils.js            # DOM 待機・SPA 遷移検知
│ └── streamStatus.js     # アーカイブ/ライブの判定
├── styles/
│ └── layout.css          # #columns の Grid レイアウト定義（manifest 経由でロード）
├── content.bundle.js      # ビルド出力（manifest に記載）
├── popup.html             # UI (ON/OFF トグル)
├── popup.js               # ストレージと UI 連携
├── manifest.json          # Chrome 拡張の定義ファイル
└── README.md
```

## 実装メモ
- レイアウトは `#columns` に `.ytcr-active` クラスを付与し、`layout.css` の CSS Grid（`display: contents` を含む）で実現。DOM を再配置しないため YouTube 側の "Something went wrong" 表示を避けられる。
- SPA 遷移は `yt-navigate-finish` イベントで検知し、`AbortController` で MutationObserver / event listener をまとめて破棄→再構築する。
- `#columns` 配下の MutationObserver は `requestAnimationFrame` でデバウンスしている。

## ビルド手順

このプロジェクトは ESModules + ESBuild を使用して構成ファイルをバンドルしています。

### 必要環境

- Node.js 16 以上
- npm
- [esbuild](https://esbuild.github.io/)（開発依存）

### セットアップ

```bash
npm install
```

### ビルド
```bash
npm run build
```
ビルド結果は `content.bundle.js` に出力され、`manifest.json` で読み込まれます。

## Chrome 拡張の読み込み
1. chrome://extensions/ にアクセス
2. 「デベロッパーモード」を ON
3. 「パッケージ化されていない拡張機能を読み込む」からプロジェクトフォルダを選択

## 更新履歴
> 📦 現在の最新バージョン: **v1.2**

詳しい更新内容は [CHANGELOG.md](./CHANGELOG.md) を参照してください。

## ライセンス
This project is licensed under the [MIT License](./LICENSE).