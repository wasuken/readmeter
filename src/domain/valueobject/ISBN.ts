export class ISBN {
  constructor(public readonly value: string) {
    if (!value.match(/^\d{13}$/)) {
      throw new Error("ISBNは13桁の数字");
    }
  }
}
