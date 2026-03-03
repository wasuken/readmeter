import { ISBN } from "./ISBN";

test("ISBNは13桁の数値文字列のみ有効", () => {
  // 正常系
  expect(() => new ISBN("9784167158057")).not.toThrow();

  // 異常系
  expect(() => new ISBN("0")).toThrow("ISBNは13桁の数字");
  expect(() => new ISBN("6")).toThrow("ISBNは13桁の数字");
  // expect(() => new ISBN('0004167158057')).toThrow('ISBNは13桁の数字')
});
