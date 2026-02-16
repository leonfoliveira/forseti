import Papa from "papaparse";

import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import { MemberType } from "@/core/domain/enumerate/MemberType";

/**
 * Utility class for loading members from a CSV file.
 * The CSV file should have the following format:
 * name,type,login,password
 * Each line represents a member with the specified attributes.
 * The type attribute should be one of the values defined in the MemberType enumeration, except for MemberType.ROOT.
 */
export class MemberLoader {
  /**
   * Load members from a CSV file and return them as an array of member objects.
   *
   * @param file The CSV file to load members from.
   * @returns A promise that resolves to an array of member objects.
   * @throws An error if the CSV file contains errors or fails to parse.
   */
  static async loadFromCsv(file: File): Promise<SettingsFormType["members"]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete(results) {
          const data = results.data as string[][];
          const errors = results.errors;

          if (errors.length > 0) {
            return reject(new Error("CSV file contains errors"));
          }

          const members: SettingsFormType["members"] = [];

          for (let i = 0; i < data.length; i++) {
            const line = data[i];

            let [name, type, login, password] = line;

            if (!name) {
              name = "";
            }

            if (
              !Object.keys(MemberType)
                .filter((it) => it !== MemberType.ROOT)
                .includes(type as MemberType)
            ) {
              type = "";
            }

            if (!login) {
              login = "";
            }

            if (!password) {
              password = "";
            }

            members.push({ name, type: type as MemberType, login, password });
          }

          resolve(members);
        },
        error() {
          reject(new Error("Failed to parse CSV file"));
        },
        skipEmptyLines: true,
      });
    });
  }
}
