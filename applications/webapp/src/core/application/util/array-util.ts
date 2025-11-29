export class ArrayUtil {
  static associateBy<T>(array: T[], keyFn: (item: T) => unknown) {
    return array.reduce(
      (acc, item) => {
        const key = `${keyFn(item)}`;
        acc[key] = item;
        return acc;
      },
      {} as Record<string, T>,
    );
  }

  static groupBy<T>(array: T[], keyFn: (item: T) => unknown) {
    return array.reduce(
      (acc, item) => {
        const key = `${keyFn(item)}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      {} as Record<string, T[]>,
    );
  }
}
