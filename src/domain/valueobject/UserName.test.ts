import { UserName } from "./UserName";

test("UserNameのバリデーション", () => {
  // 正常系
  expect(() => new UserName("Alice")).not.toThrow();
  expect(() => new UserName("a".repeat(50))).not.toThrow();

  // 異常系
  expect(() => new UserName("")).toThrow("UserNameは空にできない");
  expect(() => new UserName("   ")).toThrow("UserNameは空にできない");
  expect(() => new UserName("a".repeat(51))).toThrow("UserNameは50文字以内");
});
