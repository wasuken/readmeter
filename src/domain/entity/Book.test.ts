import { Book } from "./Book";
import { ReadingStatus } from "../valueobject/ReadingStatus";
import { Rating } from "../valueobject/Rating";
import { ISBN } from '../valueobject/ISBN';

test("Book", () => {
  const book = new Book(
    "1",
    "test title",
    new ISBN("1234567891234"),
    ReadingStatus.Unread,
    null,
  );
  // 正常系
  // 積読から読中に変更できる
  expect(() => book.changeStatus(ReadingStatus.Reading)).not.toThrow();
  // 読了した本に評価できる
  expect(() => {
    book.changeStatus(ReadingStatus.Completed);
    book.addRating(new Rating(1));
  }).not.toThrow();

  // 異常系
  // 積読から読了は直接できない
  const book2 = new Book(
    "1",
    "test title",
    new ISBN("1234567891234"),
    ReadingStatus.Unread,
    null,
  );
  expect(() => book2.changeStatus(ReadingStatus.Completed)).toThrow(
    "UnreadからCompletedへの変更は不可",
  );
  // 読了していない本に評価できない
  expect(() => book2.addRating(new Rating(1))).toThrow(
    "読了していない本には評価できない",
  );
});
