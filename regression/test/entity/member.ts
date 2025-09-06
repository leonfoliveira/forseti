export class Member {
  constructor(
    public readonly type: MemberType,
    public readonly name: string,
    public readonly login: string,
    public readonly password: string,
  ) {}
}

export enum MemberType {
  ROOT = "Root",
  ADMIN = "Admin",
  JUDGE = "Judge",
  CONTESTANT = "Contestant",
}
