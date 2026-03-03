import { ISBN } from "../valueobject/ISBN";
import { Rating } from "../valueobject/Rating";
import { ReadingStatus } from "../valueobject/ReadingStatus";
import { ReadingStatusPolicy } from "../policy/ReadingStatusPolicy";

export class Book {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly isbn: ISBN,
    public status: ReadingStatus,
    public rating: Rating | null = null,
  ) {}

  changeStatus(to: ReadingStatus): void {
    if (!ReadingStatusPolicy.canTransition(this.status, to)) {
      throw new Error(`${this.status}から${to}への変更は不可`);
    }
    this.status = to;
  }

  addRating(rating: Rating): void {
    if (this.status !== ReadingStatus.Completed) {
      throw new Error("読了していない本には評価できない");
    }
    this.rating = rating;
  }
}
