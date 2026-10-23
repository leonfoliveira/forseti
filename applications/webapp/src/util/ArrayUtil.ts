export class ArrayUtil {
  static fromString(str: string, separator: string = ","): string[] {
    return str
      .split(separator)
      .map((item) => item.trim())
      .filter((item) => item);
  }

  static toString(arr: string[], separator: string = ","): string {
    return arr.join(separator);
  }
}
