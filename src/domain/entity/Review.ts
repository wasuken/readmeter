import { Rating } from "../valueobject/Rating";
import { ReviewComment } from "../valueobject/ReviewComment";

export class Review {
  constructor(
    public readonly id: string,
    public readonly bookId: string,
    public readonly userId: string,
    public readonly rating: Rating,
    public readonly comment: ReviewComment,
  ) {}
}
