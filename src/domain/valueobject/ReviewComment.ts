export class ReviewComment {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("ReviewCommentは空にできない");
    }
    if (value.length > 1000) {
      throw new Error("ReviewCommentは1000文字以内");
    }
  }
}
