import Papa from "papaparse";

import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";

export class TestCaseValidator {
  static async validateProblemList(
    problems: UpdateContestInputDTO["problems"],
  ): Promise<
    { problem: UpdateContestInputDTO["problems"][number]; isValid: boolean }[]
  > {
    return await Promise.all(
      problems.map(async (it) => ({
        problem: it,
        isValid:
          !it.newTestCases || (await this.validateTestCases(it.newTestCases!)),
      })),
    );
  }

  /**
   * Utility function to validate test cases file.
   * Rules:
   *  - Must be a CSV file
   *  - Must have at least one row
   *  - Each row must have exactly two columns
   */
  private static validateTestCases(testCases: File): Promise<boolean> {
    return new Promise((resolve) => {
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
        error() {
          resolve(false);
        },
      });
    });
  }
}
