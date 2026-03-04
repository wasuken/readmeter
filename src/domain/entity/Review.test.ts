import { Review } from "./Review";
import { Rating } from "../valueobject/Rating";
import { ReviewComment } from "../valueobject/ReviewComment";

test("Reviewエンティティ生成", () => {
  const review = new Review(
    "r1",
    "book1",
    "user1",
    new Rating(5),
    new ReviewComment("最高の一冊"),
  );

  expect(review.id).toBe("r1");
  expect(review.bookId).toBe("book1");
  expect(review.userId).toBe("user1");
  expect(review.rating.value).toBe(5);
  expect(review.comment.value).toBe("最高の一冊");
});
