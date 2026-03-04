import { User } from "./User";
import { UserName } from "../valueobject/UserName";

test("Userエンティティ生成", () => {
  const user = new User("u1", new UserName("Alice"));
  expect(user.id).toBe("u1");
  expect(user.name.value).toBe("Alice");
});
