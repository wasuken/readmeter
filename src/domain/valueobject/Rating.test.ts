import { Rating } from "./Rating";

test("Ratingは1〜5の整数のみ有効", () => {
  // 正常系
  expect(() => new Rating(1)).not.toThrow();
  expect(() => new Rating(5)).not.toThrow();

  // 異常系
  expect(() => new Rating(0)).toThrow("Ratingは1〜5の整数");
  expect(() => new Rating(6)).toThrow("Ratingは1〜5の整数");
  expect(() => new Rating(3.5)).toThrow("Ratingは1〜5の整数");
});
