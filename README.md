# YouTube Chat Rearranger

YouTubeのライブ・アーカイブ動画をページ幅まで表示するChrome 拡張機能です．
チャット欄は動画下で表示するため，別拡張機能でチャット欄を参照する場合でも使用可能です．

自分の場合は別拡張機能でチャットを見るため，解像度が十分あるディスプレイにて複窓する際にチャット欄によって動画サイズが小さくなってしまうのを防ぐために開発しました．

> 🛠 本拡張機能は 2025年7月1日現在の YouTube UI のみに対応しています。
> 以降の UI 変更に伴う動作保証やメンテナンスは予定されていません。

## 機能概要

- 動画（#primary）の下に説明欄やコメント欄（#below）と横並びにする形でYouTubeチャット欄（#secondary）を表示
- アーカイブ動画のチャット欄も自動で表示
- iframe が未設定のチャット欄に `src` を補完
- 再生バーの UI も横幅に合わせてリサイズ

## 構成ディレクトリ
```
.
├── src/
│ ├── content.js # メインスクリプト
│ ├── layout.js # レイアウト制御（DOM再配置）
│ ├── videoAdjustments.js # プレイヤー・再生バー調整
│ ├── chatHandler.js # チャット欄の表示・埋め込み制御
│ ├── utils.js # 共通ユーティリティ関数
│ └── streamStatus.js # アーカイブ/ライブの判定
├── content.bundle.js # ビルド出力（manifestに記載）
├── popup.html # UI (ON/OFF トグル)
├── popup.js # ストレージとUI連携
├── manifest.json # Chrome 拡張の定義ファイル
└── README.md
```

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
