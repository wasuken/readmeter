import { BookShelfService } from "./BookShelfService";
import { BookRepository } from "../repository/BookRepository";
import { Book } from "../domain/entity/Book";
import { ISBN } from "../domain/valueobject/ISBN";
import { ReadingStatus } from "../domain/valueobject/ReadingStatus";

// インメモリのMock実装
function createMockRepo(): BookRepository {
  const store = new Map<string, Book>();
  return {
    save: async (book) => {
      store.set(book.id, book);
    },
    findById: async (id) => store.get(id) ?? null,
    findAll: async () => Array.from(store.values()),
    delete: async (id) => {
      store.delete(id);
    },
  };
}

test("本を追加できる", async () => {
  const service = new BookShelfService(createMockRepo());
  const book = await service.addBook("1", "Clean Code", "9784048860000");

  expect(book.title).toBe("Clean Code");
  expect(book.isbn.value).toBe("9784048860000");
  expect(book.status).toBe(ReadingStatus.Unread);
});

test("積読→読中に変更できる", async () => {
  const service = new BookShelfService(createMockRepo());
  await service.addBook("1", "Clean Code", "9784048860000");
  const book = await service.startReading("1");

  expect(book.status).toBe(ReadingStatus.Reading);
});

test("読中→読了に変更できる（評価あり）", async () => {
  const service = new BookShelfService(createMockRepo());
  await service.addBook("1", "Clean Code", "9784048860000");
  await service.startReading("1");
  const book = await service.completeReading("1", 5);

  expect(book.status).toBe(ReadingStatus.Completed);
  expect(book.rating?.value).toBe(5);
});

test("読中→読了に変更できる（評価なし）", async () => {
  const service = new BookShelfService(createMockRepo());
  await service.addBook("1", "Clean Code", "9784048860000");
  await service.startReading("1");
  const book = await service.completeReading("1");

  expect(book.status).toBe(ReadingStatus.Completed);
  expect(book.rating).toBeNull();
});

test("積読から直接読了はエラー", async () => {
  const service = new BookShelfService(createMockRepo());
  await service.addBook("1", "Clean Code", "9784048860000");

  await expect(service.completeReading("1")).rejects.toThrow(
    "UnreadからCompletedへの変更は不可",
  );
});

test("存在しない本のstartReadingはエラー", async () => {
  const service = new BookShelfService(createMockRepo());

  await expect(service.startReading("not-exist")).rejects.toThrow(
    "Book not found: not-exist",
  );
});

test("全件取得できる", async () => {
  const service = new BookShelfService(createMockRepo());
  await service.addBook("1", "Clean Code", "9784048860000");
  await service.addBook("2", "DDD", "9784048930000");

  const books = await service.getAll();
  expect(books).toHaveLength(2);
});

test("本を削除できる", async () => {
  const service = new BookShelfService(createMockRepo());
  await service.addBook("1", "Clean Code", "9784048860000");
  await service.removeBook("1");

  const books = await service.getAll();
  expect(books).toHaveLength(0);
});

test("存在しない本の削除はエラー", async () => {
  const service = new BookShelfService(createMockRepo());

  await expect(service.removeBook("not-exist")).rejects.toThrow(
    "Book not found: not-exist",
  );
});
