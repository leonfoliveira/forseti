export type Member = {
  type: MemberType;
  name: string;
  login: string;
  password: string;
};

export enum MemberType {
  ROOT = "Root",
  ADMIN = "Admin",
  JUDGE = "Judge",
  STAFF = "Staff",
  CONTESTANT = "Contestant",
}
