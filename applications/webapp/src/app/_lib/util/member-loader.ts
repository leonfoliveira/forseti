import Papa from "papaparse";

import { SettingsFormType } from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import { MemberType } from "@/core/domain/enumerate/MemberType";

export class MemberLoader {
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
      });
    });
  }
}
