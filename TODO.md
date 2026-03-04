# TODO

残タスク管理。**実装完了したら [ ] を [x] に変え、CHANGELOGに追記すること。**

---

## Part4

### エンドポイント

- [ ] `PATCH /api/books/:id/start` - 積読 → 読中
  - `src/app/api/books/[id]/start/route.ts`
- [ ] `PATCH /api/books/:id/complete` - 読中 → 読了
  - `src/app/api/books/[id]/complete/route.ts`
  - body: `{ "rating": number }` (optional)
- [ ] `DELETE /api/books/:id` - 本を削除
  - `src/app/api/books/[id]/route.ts`

### エラーハンドリング

- [ ] エラー種別ごとにHTTPステータスを整理
  - 400: バリデーションエラー（ISBNが不正など）
  - 404: リソースが存在しない（Book not found）
  - 409 or 422: 状態遷移違反（積読→読了など）
  - 500: その他
- [ ] カスタム例外クラスの導入検討
  - `NotFoundError extends Error`
  - `DomainError extends Error`
  - Route Handlerでinstanceofチェックしてステータスを振り分ける

### 注意点（実装前に必読）

- Next.js 15以降、Dynamic Route の `params` は `Promise`
  - `const { id } = await params;` が必要
  - 参考: https://nextjs.org/docs/app/api-reference/file-conventions/route#context-optional

---

## Part5以降（未確定）

### フロントエンド

- [ ] `src/app/page.tsx` に簡易UI実装
  - 本の一覧表示
  - 本の追加フォーム（id / title / isbn 入力）
  - ステータス変更ボタン（読中にする / 読了にする）
  - 削除ボタン

### DB拡張

- [ ] `User` テーブルをスキーマに追加
- [ ] `Review` テーブルをスキーマに追加
- [ ] `UserRepository` interface 定義
- [ ] `ReviewRepository` interface 定義
- [ ] `PrismaUserRepository` 実装
- [ ] `PrismaReviewRepository` 実装

### サービス拡張

- [ ] `ReviewService` 実装
  - `addReview(bookId, userId, rating, comment)`
  - 読了していない本へのレビューはエラー（ドメインルール）
- [ ] `ReviewService` のテスト（Mock利用）

### API拡張

- [ ] `GET  /api/books/:id` - 本の詳細取得
- [ ] `GET  /api/books/:id/reviews` - 本のレビュー一覧
- [ ] `POST /api/books/:id/reviews` - レビュー追加
- [ ] `GET  /api/users/:id` - ユーザー詳細

### 品質・運用

- [ ] `npm run ci` をCIで自動実行（GitHub Actions等）
- [ ] E2Eテスト検討（Playwright等）
  - Route Handler層のテストカバレッジをE2Eで担保
- [ ] `DATABASE_URL` の環境変数管理（`.env.local` vs CI secrets）

---

## 完了済み

### Part1 ✅

- [x] `ReadingStatus` ValueObject
- [x] `Rating` ValueObject
- [x] `ISBN` ValueObject
- [x] `ReadingStatusPolicy`
- [x] `Book` エンティティ
- [x] 各種テスト（5件）

### Part2 ✅

- [x] `UserName` ValueObject
- [x] `ReviewComment` ValueObject
- [x] `User` エンティティ
- [x] `Review` エンティティ
- [x] `BookRepository` interface
- [x] `BookShelfService`
- [x] `BookShelfService` テスト（9件）

### Part3 ✅

- [x] Prisma セットアップ（SQLite）
- [x] `prisma/schema.prisma` - Book モデル定義
- [x] `src/lib/prisma.ts` - PrismaClient シングルトン
- [x] `PrismaBookRepository` 実装
- [x] `GET /api/books` Route Handler
- [x] `POST /api/books` Route Handler
