export class DateTimeUtil {
  /**
   * Converts ISO datetime string to datetime-local format (YYYY-MM-DDTHH:MM)
   * Input: '2026-02-09T22:58:05.016521Z' (UTC)
   * Output: '2026-02-09T19:58' (local time, assuming UTC-3)
   */
  static toDatetimeLocal(isoString: string): string {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Converts datetime-local format to ISO string
   * Input: '2026-02-09T19:58' (local time)
   * Output: '2026-02-09T22:58:00.000Z' (UTC)
   */
  static fromDatetimeLocal(datetimeLocal: string): string {
    const date = new Date(datetimeLocal);
    return date.toISOString();
  }
}
