export class UserName {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("UserNameは空にできない");
    }
    if (value.length > 50) {
      throw new Error("UserNameは50文字以内");
    }
  }
}
