# CHANGELOG

開発者向けリリースノート。実装の意図・設計判断・破壊的変更を記録する。
**Part4以降は各Partの実装完了時にこのファイルを更新すること。**

---

## [Part5] - 2026-03-05

### Added

- `src/app/page.tsx` - 簡易UI（Client Component）
  - 本の追加フォーム（id / title / isbn）
  - 本棚をUnread / Reading / Completedでグループ表示
  - Unread: 「読み始める」ボタン → `PATCH /api/books/:id/start`
  - Reading: 評価入力（1〜5、省略可）＋「読了にする」ボタン → `PATCH /api/books/:id/complete`
  - 全ステータス: 削除ボタン → `DELETE /api/books/:id`
  - APIエラー時はフォーム下にエラーメッセージを表示

### Design Decisions

- **Client Componentを選んだ理由**
  - ボタン操作ごとにstateを更新して再描画する必要があるため
  - Server Component + Server Actionの構成は今回の学習目的（テスト設計）と外れるため避けた
- **fetchBooks() で毎回再取得する方針**
  - 楽観的更新（Optimistic Update）はしない
  - サーバーの状態を正として再取得するシンプルな方針
- **ratingInputs を `Record<string, string>` で管理**
  - 複数の本が同時にReadingでも入力値が干渉しないようにbookIdをkeyにする
- **フロントエンドにビジネスロジックを持たせない**
  - ボタンの出し分けはUX上の都合（Unreadに「読了にする」ボタンを出さない等）
  - バリデーションはすべてAPIに委ねる。curlで直接叩いても同じルールが適用される

### Notes

- テストは変更なし（15件、全パス）
- フロントエンド層のテストはE2E（Playwright等）で担保する方針を維持

---

## [Part4] - 2026-03-05

### Added

- `src/errors/AppError.ts` - カスタム例外クラス
  - `NotFoundError extends Error` - リソース未発見（404）
  - `DomainError extends Error` - ビジネスルール違反（422）用に定義（現時点では未使用）
- `src/lib/handleError.ts` - Route Handler共通エラーハンドラ
  - `instanceof` チェックで例外クラスをHTTPステータスにマッピング
  - 優先順位: `NotFoundError(404)` → `DomainError(422)` → `Error(400)` → その他(500)
- `src/app/api/books/[id]/start/route.ts` - `PATCH /api/books/:id/start`
  - 積読 → 読中のステータス変更
- `src/app/api/books/[id]/complete/route.ts` - `PATCH /api/books/:id/complete`
  - 読中 → 読了のステータス変更
  - body: `{ "rating": number }` (optional)
  - 空ボディ対応: `req.json().catch(() => ({}))`
- `src/app/api/books/[id]/route.ts` - `DELETE /api/books/:id`
  - 削除成功時は `204 No Content`（`new NextResponse(null, { status: 204 })`）

### Changed

- `src/service/BookShelfService.ts`
  - `throw new Error(...)` を `throw new NotFoundError(...)` に置き換え
  - 既存テストはそのまま通る（メッセージ文字列は変更なし）
- `src/service/BookShelfService.test.ts`
  - `toBeInstanceOf(NotFoundError)` の検証テストを2件追加（計15件）

### Design Decisions

- **`DomainError` は現時点で未使用のまま定義だけ置く**
  - 将来「積読→読了の遷移エラーを422にしたい」要件が出た時点で `Book.changeStatus` が投げるように変える
  - 今は必要ないのでYAGNIの原則に従い実装しない
- **状態遷移違反（`Book.changeStatus` が投げる `Error`）は400として扱う**
  - リクエスト起因のエラーとして統一
  - `DomainError(422)` に変えたい場合は `Book.changeStatus` を修正するだけでよい構造
- **`handleError` を共通ヘルパーに切り出した理由**
  - Route Handlerが3本に増え、エラー処理の重複を避けるため
  - Route HandlerはDIの組み立てとHTTP変換のみに集中させる方針を維持

### Notes

- **Next.js 15以降、Dynamic Route の `params` は `Promise`**
  - `const { id } = await params;` が必要
  - 参考: https://nextjs.org/docs/app/api-reference/file-conventions/route
- **RFC 9110 に基づく422の使いどころ**
  - リクエスト形式は正しいが業務上処理できない場合に使う
  - 参考: https://www.rfc-editor.org/rfc/rfc9110#section-15.5.21

---

## [Part3] - 2026-01-10

### Added

- `prisma/schema.prisma` - Bookモデル定義（SQLite）
  - `status` は enum ではなく `String` で持つ（SQLite の enum 非サポートのため）
  - `User` / `Review` はまだスキーマに含めない
- `src/lib/prisma.ts` - PrismaClient シングルトン管理
  - Next.js HMR による接続枯渇を防ぐため `globalThis` にインスタンスを保持
  - 参考: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
- `src/repository/PrismaBookRepository.ts` - `BookRepository` interface の本番実装
  - `toDomain` / `toRecord` を `private` に閉じ込め、変換ロジックを外部に漏らさない
  - `save` は `upsert` で INSERT / UPDATE を吸収（Service層が新規/更新を意識しない設計）
- `src/app/api/books/route.ts` - Route Handler
  - `GET /api/books` - 全件取得
  - `POST /api/books` - 本を追加（`{ id, title, isbn }`）
  - DI の組み立てはここだけに集中させる（`buildService()` 関数）

### Design Decisions

- **Repository層にテストを書かない方針を継続**
  - ロジックを持たせない設計にしたため、テストの費用対効果が低い
  - DB接続が必要なテストはE2Eで担保する方針
- **Route HandlerはDIの組み立てとHTTP変換のみ**
  - バリデーション・状態遷移ロジックは一切書かない
  - `BookShelfService` / ドメイン層に委ねる

### Notes

- `@prisma/client` は `dependencies`、`prisma` は `devDependencies` に追加が必要
  - `package.json` にはデフォルトで含まれていないため、初回セットアップ時に要インストール
  - `npm install @prisma/client && npm install --save-dev prisma`

---

## [Part2] - 2026-01-10

### Added

- `src/domain/entity/User.ts` - Userエンティティ
  - `id: string` + `UserName` ValueObject を持つ
  - 現時点でビジネスロジックなし
- `src/domain/entity/Review.ts` - Reviewエンティティ
  - `bookId` / `userId` はIDのみで参照（オブジェクト参照を持たない設計）
  - `Rating` + `ReviewComment` を持つ
- `src/domain/valueobject/UserName.ts` - UserName ValueObject
  - 1〜50文字、空白のみ不可
- `src/domain/valueobject/ReviewComment.ts` - ReviewComment ValueObject
  - 1〜1000文字、空白のみ不可
- `src/repository/BookRepository.ts` - BookRepository interface
  - `save / findById / findAll / delete` の4メソッド
  - 実装なし（interface定義のみ）
- `src/service/BookShelfService.ts` - BookShelfService
  - constructor で `BookRepository` を受け取る（DI）
  - `addBook / startReading / completeReading / getAll / removeBook`

### Added Tests

- `src/domain/entity/User.test.ts` (1件)
- `src/domain/entity/Review.test.ts` (1件)
- `src/domain/valueobject/UserName.test.ts` (1件)
- `src/domain/valueobject/ReviewComment.test.ts` (1件)
- `src/service/BookShelfService.test.ts` (9件)
  - MockはMapベースのインメモリ実装をテストファイル内クロージャで定義
  - テスト専用実装を本番コードディレクトリに置かない判断

### Design Decisions

- **ReviewはBook/UserをIDだけで参照**
  - オブジェクトグラフの肥大化を防ぐ
  - 集約境界を明確にする意図
- **MockをBookShelfService.test.ts内に閉じ込める**
  - `src/` 配下にテスト用実装ファイルを置かない
  - テストファイル内クロージャで完結させる

---

## [Part1] - 2026-01-10

### Added

- `src/domain/valueobject/ReadingStatus.ts` - ReadingStatus
  - `Unread / Reading / Completed` の3値
  - `as const` + type alias パターン
- `src/domain/valueobject/Rating.ts` - Rating ValueObject
  - 1〜5の整数のみ有効
- `src/domain/valueobject/ISBN.ts` - ISBN ValueObject
  - 13桁の数字文字列のみ有効（正規表現: `/^\d{13}$/`）
- `src/domain/policy/ReadingStatusPolicy.ts` - ReadingStatusPolicy
  - 許可する遷移: `Unread→Reading`, `Reading→Completed`, `Completed→Reading`
  - 禁止: `Unread→Completed`（積読から直接読了は不可）
- `src/domain/entity/Book.ts` - Bookエンティティ
  - `changeStatus(to)` - PolicyでValidationして状態変更
  - `addRating(rating)` - 読了済みのみ評価可能

### Added Tests

- `src/domain/valueobject/ReadingStatus.test.ts` (1件)
- `src/domain/valueobject/Rating.test.ts` (1件)
- `src/domain/valueobject/ISBN.test.ts` (1件)
- `src/domain/policy/ReadingStatusPolicy.test.ts` (1件)
- `src/domain/entity/Book.test.ts` (1件)

### Project Setup

- Next.js (App Router) + TypeScript
- vitest + @testing-library/react
- Tailwind CSS v4
- ESLint (eslint-config-next)
- `npm run ci` = `tsc --noEmit && vitest run && eslint`

### Design Decisions

- **フレームワーク非依存のロジックだけをテストする**
- **DB・APIなど外界と接する場所はテストしない**
- **テストが書けない場所にはロジックを書かない**
