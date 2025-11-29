# クレーム対応報告書作成ツール

AI（Gemini）を活用して、クレーム対応の経緯整理・原因分析・対策立案をサポートするWebアプリケーションです。

## 機能

### 1. ログ貼り付け・経緯自動書き出し
LINE・メール・電話のやり取りを貼り付けると、AIが自動的に時系列で経緯を整理します。

### 2. 原因分析（AIサポート）
経緯データを元に、AIが考えられる原因を提案します。手入力も可能です。

### 3. 対策立案（AIサポート）
原因を踏まえて、AIが具体的な対策案を提案します。手入力も可能です。

### 4. ビジュアル対策シート生成
入力データを元に、見やすいビジュアルレポートを自動生成します。

### 5. PDF/Excelエクスポート
作成した報告書をA4サイズのPDFまたはExcelファイルとしてダウンロードできます。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **AI**: Google Gemini API
- **PDF生成**: jsPDF + html2canvas
- **Excel生成**: xlsx

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定（オプション）

`.env.local`ファイルを作成し、Gemini APIキーを設定：

```env
GEMINI_API_KEY=your_api_key_here
```

※ デフォルトのAPIキーが設定されていますが、本番環境では独自のキーを使用してください。

### 3. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアクセスできます。

## 使い方

1. **報告日・報告者を入力**
2. **ログを貼り付け** → 「経緯を自動書き出し」ボタンをクリック
3. **原因を入力**（AIヒントボタンで参考にできます）
4. **対策を入力**（AIヒントボタンで参考にできます）
5. **「ビジュアル対策シート生成」ボタン**をクリック
6. **「PDF出力」または「Excel出力」**ボタンでダウンロード

## ビルド

```bash
npm run build
```

## デプロイ

Vercelへのデプロイが最も簡単です：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Ghouse-development/omoushide)

## ライセンス

MIT
