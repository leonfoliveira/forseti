import path from "node:path";
import fs from "node:fs";

export class FileUtil {
  static loadFile(name: string, type: string): File {
    const content = fs.readFileSync(
      path.join(__dirname, ".", "files", name),
      "utf-8",
    );
    const file = new File([content], name, { type: type });
    return file;
  }
}
