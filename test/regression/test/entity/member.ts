export type Member = {
  type: MemberType;
  name: string;
  login: string;
  password: string;
};

export enum MemberType {
  ROOT = "Root",
  ADMIN = "Admin",
  STAFF = "Staff",
  JUDGE = "Judge",
  CONTESTANT = "Contestant",
}
