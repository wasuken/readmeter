# DEVELOPMENT.md

## このプロジェクトについて

学習目的のハンズオンプロジェクト。

- テスト前提の設計を体で覚えることが目的
- 実装しながら記事化していく（ブログ連載）
- 生成AIに設計ヒントをもらいながら、コードは自分で書く

### 記事

- Part1: 設計方針 + ValueObject + Policy + Entity
- Part2: User / Review Entity + BookRepository Interface + BookShelfService + DI・Mock テスト
- Part3: （執筆中）

---

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

| 層          | 役割                   | テスト              |
| ----------- | ---------------------- | ------------------- |
| entity      | 概念・状態遷移ロジック | ✅ 書く             |
| valueobject | 値のバリデーション     | ✅ 書く             |
| policy      | ビジネスルール         | ✅ 書く             |
| service     | フロー制御             | ✅ 書く（MockでDI） |
| repository  | DB接続                 | ❌ 書かない         |

---

## 実装済み

### domain/valueobject/

```
ReadingStatus.ts   # Unread / Reading / Completed
Rating.ts          # 1〜5の整数のみ有効
ISBN.ts            # 13桁の数字文字列のみ有効
UserName.ts        # 1〜50文字、空白不可
ReviewComment.ts   # 1〜1000文字、空白不可
```

### domain/policy/

```
ReadingStatusPolicy.ts
  # 積読→読中→読了の順番のみ許可
  # 読了→読中の巻き戻しはOK
  # 積読→読了の直接遷移はNG
```

### domain/entity/

```
Book.ts
  # changeStatus(to): PolicyでValidationして状態変更
  # addRating(rating): 読了済みのみ評価可能

User.ts
  # id + UserName を持つ
  # 現時点でビジネスロジックなし

Review.ts
  # bookId + userId + Rating + ReviewComment
  # Book/UserはIDだけで参照（オブジェクト参照を持たない）
```

### repository/

```
BookRepository.ts   # Interface定義のみ（実装なし）
  # save(book): Promise<void>
  # findById(id): Promise<Book | null>
  # findAll(): Promise<Book[]>
  # delete(id): Promise<void>
```

### service/

```
BookShelfService.ts
  # constructor(private readonly repo: BookRepository)
  # addBook(id, title, isbnValue): Promise<Book>
  # startReading(id): Promise<Book>
  # completeReading(id, ratingValue?): Promise<Book>
  # getAll(): Promise<Book[]>
  # removeBook(id): Promise<void>
```

---

## テスト状況

累計 13 テスト、全パス。

```
✓ src/service/BookShelfService.test.ts        (9 tests)
✓ src/domain/valueobject/ReviewComment.test.ts (1 test)
✓ src/domain/entity/Review.test.ts             (1 test)
✓ src/domain/valueobject/UserName.test.ts      (1 test)
✓ src/domain/entity/User.test.ts               (1 test)
```

MockはBookShelfService.test.ts内にクロージャで定義（`Map`ベース）。
テスト専用実装を本番コードディレクトリに置かないための判断。

---

## DIのイメージ（現状と将来）

```typescript
// Interface定義（repository層）
interface BookRepository {
  save(book: Book): Promise<void>
  findById(id: string): Promise<Book | null>
  findAll(): Promise<Book[]>
  delete(id: string): Promise<void>
}

// Serviceはinterfaceだけ知っている
class BookShelfService {
  constructor(private repo: BookRepository) {}
}

// テスト時はMockを差し込む（現状）
const mockRepo: BookRepository = {
  save: async () => {},
  findById: async () => new Book(...),
  findAll: async () => [],
  delete: async () => {},
}
const service = new BookShelfService(mockRepo)

// 本番時はPrisma実装を差し込む（Part3で作る）
const prismaRepo = new PrismaBookRepository()
const service = new BookShelfService(prismaRepo)
```

---

## 次やること（Part3）

1. Prisma セットアップ（SQLite）
2. スキーマ定義（Book テーブルから）
3. `PrismaBookRepository` 実装（`BookRepository` Interface を満たす）
4. Next.js App Router で Route Handler 作成（`/api/books`）
5. 動作確認（curl or ブラウザ）

### 注意点

- repository 層はテストしない（設計方針）
- Service 層は既存テストが通り続けることを確認しながら進める
- Prisma の `Book` モデルとドメインの `Book` クラスはマッピングが必要（変換ロジックをどこに置くか検討）

---

## テストの実行

```bash
npm run test          # vitest（型チェックなし）
npx tsc --noEmit      # 型チェックのみ
npm run ci            # 両方
```
