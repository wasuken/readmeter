export class Rating {
  constructor(public readonly value: number) {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new Error("Ratingは1〜5の整数");
    }
  }
}
