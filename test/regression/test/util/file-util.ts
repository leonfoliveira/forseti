import path from "node:path";

export class FileUtil {
  static loadFile(name: string): string {
    return path.join(__dirname, "..", "files", name);
  }
}
