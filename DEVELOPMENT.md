# DEVELOPMENT.md

## 設計方針

テスト前提の設計。以下の原則を守る。

- フレームワーク非依存のロジックだけをテストする
- DB・APIなど外界と接する場所はテストしない
- テストが書けない場所にはロジックを書かない

DIを使ってRepositoryをInterfaceで差し替え可能にすることで、ServiceのテストからDBを排除する。

---

## 技術スタック

- Next.js（App Router）
- SQLite + Prisma
- vitest

---

## ディレクトリ構成

```
src/
  domain/
    entity/        # 概念そのもの。副作用なし
    valueobject/   # 値の制約を持つクラス
    policy/        # ビジネスルールを切り出したクラス
  service/         # 複数クラスをまたぐフロー。DIでRepository受け取る
  repository/      # DBとのアダプタ。副作用をここに閉じ込める
  test/
    setup.ts
```

---

## 各層の役割

| 層 | 役割 | テスト |
|---|---|---|
| entity | 概念・状態遷移ロジック | ✅ 書く |
| valueobject | 値のバリデーション | ✅ 書く |
| policy | ビジネスルール | ✅ 書く |
| service | フロー制御 | ✅ 書く（MockでDI） |
| repository | DB接続 | ❌ 書かない |

---

## 実装済み

```
src/domain/valueobject/
  ReadingStatus.ts   # Unread / Reading / Completed
  Rating.ts          # 1〜5の整数のみ有効
  ISBN.ts            # 13桁の数字文字列のみ有効

src/domain/policy/
  ReadingStatusPolicy.ts
    # 積読→読中→読了の順番のみ許可
    # 読了→読中の巻き戻しはOK
    # 積読→読了の直接遷移はNG

src/domain/entity/
  Book.ts
    # changeStatus(to): PolicyでValidationして状態変更
    # addRating(rating): 読了済みのみ評価可能
```

---

## 次やること（Part2）

1. `User` Entity追加
2. `Review` Entity追加
3. `BookRepository` Interface定義
4. `BookShelfService` 実装（DIでRepository受け取る）
5. `MockBookRepository` 実装してServiceのテストを書く

### DIのイメージ

```typescript
// Interface定義（repository層）
interface BookRepository {
    save(book: Book): Promise<void>
    findById(id: string): Promise<Book>
    findAll(): Promise<Book[]>
}

// Serviceはinterfaceだけ知っている
class BookShelfService {
    constructor(private repo: BookRepository) {}
}

// テスト時はMockを差し込む
const mockRepo: BookRepository = {
    save: async () => {},
    findById: async () => new Book(...),
    findAll: async () => [],
}
const service = new BookShelfService(mockRepo)
```

---

## テストの実行

```bash
npm run test          # vitest（型チェックなし）
npx tsc --noEmit      # 型チェックのみ
npm run ci            # 両方
```

## このプロジェクトについて

学習目的のハンズオンプロジェクト。

- テスト前提の設計を体で覚えることが目的
- 実装しながら記事化していく（ブログ連載）
- 生成AIに設計ヒントをもらいながら、コードは自分で書く

### 記事

- Part1: 設計方針 + ValueObject + Policy + Entity
- Part2: （執筆中）
