# ポケモンカード価格比較サイト MVP

ポケモンカード（英語・日本語版を含む）の市場価格をリアルタイムまたは準リアルタイムで把握し、履歴グラフを閲覧・比較できる Web サービスです。

## 🎯 主な機能

### ✅ 実装済み (MVP)
- **カード検索**: Pokemon TCG APIを使用したカード名・セット名での検索
- **カード詳細ページ**: 高解像度画像、基本情報、現在価格の表示
- **価格情報**: TCGPlayer・CardMarketからの価格データ
- **価格推移グラフ**: Chart.jsを使用したインタラクティブなグラフ
- **ウォッチリスト**: ローカルストレージベースのお気に入り機能
- **レスポンシブUI**: PC・スマホ両対応

### 🔄 今後の拡張予定
- Pokemon Price Tracker APIとの完全統合
- 価格アラート機能（メール通知）
- ユーザー認証とクラウド同期
- グレーディング（PSA/BGS）別価格表示
- 通貨切替（USD/JPY/EUR）

## 🚀 クイックスタート

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env`ファイルで以下を設定（オプション）:

```bash
# Pokemon TCG API (無料、レート制限緩和のため推奨)
POKEMON_TCG_API_KEY="your_api_key_here"

# Pokemon Price Tracker API (有料、履歴データ用)
POKEMON_PRICE_TRACKER_API_KEY="your_api_key_here"
```

**APIキー取得方法:**
- [Pokemon TCG API](https://dev.pokemontcg.io/) - 無料登録でAPI制限緩和
- [Pokemon Price Tracker](https://www.pokemonpricetracker.com/api) - 月額$9.99から

### 3. データベースの初期化
```bash
npm run db:generate
npm run db:push
```

### 4. 開発サーバーの起動
```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## 📱 使用方法

### カード検索
1. トップページの検索バーにカード名を入力
2. 「ピカチュウ」「リザードン」「ポケモンカード151」などで検索
3. 検索結果からカードを選択して詳細ページへ

### カード詳細ページ
- カード画像をクリックで拡大表示
- 複数サイトの価格を一覧表示
- 価格推移グラフで過去のトレンドを確認
- ウォッチリストに追加でお気に入り管理

### ウォッチリスト
- ナビゲーションの「ウォッチリスト」から一覧表示
- カード削除や全削除も可能
- 追加したカード数がナビゲーションに表示

## 🏗️ 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Lucide React
- **データベース**: SQLite (Prisma ORM)
- **グラフ**: Chart.js, React Chart.js 2
- **状態管理**: Zustand (一部使用)
- **API**: Pokemon TCG API, Pokemon Price Tracker API

## 📊 データベース構造

```
Card (カード情報)
├── name, setName, setNumber
├── rarity, cardType, series
├── imageUrl, japanName
└── priceRecords[] (価格履歴)

PriceRecord (価格記録)
├── price, currency, condition
├── inStock, productUrl
├── scrapedAt (取得日時)
└── source (データソース)

Source (価格データソース)
├── name (TCGPlayer, CardMarket等)
├── baseUrl, isActive
└── rateLimitMs (レート制限)
```

## 🔧 スクリプト

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# リント実行
npm run lint

# データベース操作
npm run db:generate  # Prisma クライアント生成
npm run db:push      # スキーマをDBに反映
npm run db:studio    # Prisma Studio起動
```

## 🤝 価格データ更新

価格データは以下の方法で更新されます:

1. **リアルタイム検索**: ユーザーが検索する度にPokemon TCG APIから最新価格を取得
2. **バックグラウンド更新**: `/api/jobs/update-prices`エンドポイントでバッチ更新
3. **手動更新**: 開発者がAPIを直接呼び出し

## 📝 ライセンス・注意事項

- Pokemon TCG API: MIT ライセンス（ポケモン画像は非公式利用）
- カード画像の商用利用はポケモン社との個別確認が必要
- 本アプリケーションは学習・個人利用目的で開発されています

## 🚀 デプロイ

### Vercel (推奨)
```bash
npm run build
# Vercelにプロジェクトをデプロイ
```

### 環境変数の設定
デプロイ時は以下の環境変数を設定してください:
- `DATABASE_URL`: PostgreSQL接続文字列 (本番環境)
- `POKEMON_TCG_API_KEY`: Pokemon TCG API キー
- `POKEMON_PRICE_TRACKER_API_KEY`: Pokemon Price Tracker API キー

---

🎮 **Happy Pokemon Card Hunting!** 🎮
