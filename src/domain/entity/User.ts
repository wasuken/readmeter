import { UserName } from "../valueobject/UserName";

export class User {
  constructor(
    public readonly id: string,
    public readonly name: UserName,
  ) {}
}
