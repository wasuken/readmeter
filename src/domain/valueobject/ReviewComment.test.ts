import { ReviewComment } from "./ReviewComment";

test("ReviewCommentのバリデーション", () => {
  // 正常系
  expect(() => new ReviewComment("面白かった")).not.toThrow();
  expect(() => new ReviewComment("a".repeat(1000))).not.toThrow();

  // 異常系
  expect(() => new ReviewComment("")).toThrow("ReviewCommentは空にできない");
  expect(() => new ReviewComment("   ")).toThrow("ReviewCommentは空にできない");
  expect(() => new ReviewComment("a".repeat(1001))).toThrow(
    "ReviewCommentは1000文字以内",
  );
});
