# YouTube Chat Rearranger

YouTubeのライブ・アーカイブ動画においてデフォルト表示の際にチャット欄を動画の下に配置を変更するChrome 拡張機能です．

自分の場合はチャット欄は別拡張機能で見るため，複窓にする際にチャット欄によって動画サイズが小さくなるしまうのを防ぐために個人用に開発しました．

> 🛠 本拡張機能は 2026年5月30日現在の YouTube UI で動作確認しています。
> 以降の UI 変更に伴う動作保証やメンテナンスは予定されていません。

## 機能概要

- 動画（#primary）の下に説明欄やコメント欄（#below）と横並びにする形でYouTubeチャット欄（#secondary）を表示
- アーカイブ動画ではチャットリプレイの表示ボタンを自動でクリックして表示
- 再生バーの UI も横幅に合わせてリサイズ
- デフォルト表示のみサポートしています（シアターモードはサポートしていません．）

## 構成ディレクトリ
```
.
├── src/
│ ├── content.js # エントリーポイント（初期化処理／イベント管理）
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

## 更新履歴
> 📦 現在の最新バージョン: **v1.2**

詳しい更新内容は [CHANGELOG.md](./CHANGELOG.md) を参照してください。

## ライセンス
This project is licensed under the [MIT License](./LICENSE).