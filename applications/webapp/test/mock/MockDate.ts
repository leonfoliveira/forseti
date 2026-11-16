export class MockDate {
  constructor(public date: Date) {
    this.date = date;
  }

  static now(): MockDate {
    return new MockDate(new Date());
  }

  past(hoursAgo: number = 1): MockDate {
    return new MockDate(
      new Date(this.date.getTime() - hoursAgo * 60 * 60 * 1000),
    );
  }

  future(hoursAhead: number = 1): MockDate {
    return new MockDate(
      new Date(this.date.getTime() + hoursAhead * 60 * 60 * 1000),
    );
  }

  toISOString(): string {
    return this.date.toISOString();
  }

  toDateTime(): string {
    return this.date.toISOString().slice(0, 16);
  }
}
