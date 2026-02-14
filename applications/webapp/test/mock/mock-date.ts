export class MockDate {
  static past(hoursAgo: number = 1): Date {
    return new Date(new Date().getTime() - hoursAgo * 60 * 60 * 1000);
  }

  static future(hoursAhead: number = 1): Date {
    return new Date(new Date().getTime() + hoursAhead * 60 * 60 * 1000);
  }
}
