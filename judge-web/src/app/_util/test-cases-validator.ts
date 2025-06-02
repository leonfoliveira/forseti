import Papa from "papaparse";

export function validateTestCases(
  testCases: File | undefined,
): Promise<boolean> {
  return new Promise((resolve) => {
    if (!testCases) {
      return resolve(true);
    }

    Papa.parse(testCases, {
      complete(results) {
        const data = results.data as string[][];
        const errors = results.errors;

        if (errors.length > 0) {
          return resolve(false);
        }

        if (data.length === 0) {
          return resolve(false);
        }

        for (let i = 0; i < data.length; i++) {
          const line = data[i];

          if (line.length !== 2) {
            resolve(false);
            return;
          }
        }

        resolve(true);
      },
    });
  });
}
