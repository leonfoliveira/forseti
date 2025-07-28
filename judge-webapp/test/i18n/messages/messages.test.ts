import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import { glob } from "glob";
import * as fs from "node:fs";

const translationFilePath = "./src/i18n/messages/en.json";
const sourceGlob = "./src/app/**/*.{js,jsx,ts,tsx}";

function extractTranslationKeysFromCode(code: string) {
  const keys = new Set<string>();
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const tFunctionBases = new Map();

  traverse(ast, {
    VariableDeclarator(path) {
      const init = path.node.init;
      if (
        init?.type === "CallExpression" &&
        (init.callee as any).name === "useTranslations" &&
        init.arguments.length === 1 &&
        init.arguments[0].type === "StringLiteral"
      ) {
        const base = init.arguments[0].value;
        const varName = (path.node.id as any).name;
        tFunctionBases.set(varName, base);
      }
    },

    CallExpression(path) {
      const callee = path.node.callee;

      if (
        callee.type === "Identifier" &&
        callee.name === "t" &&
        path.node.arguments.length > 0 &&
        path.node.arguments[0].type === "StringLiteral"
      ) {
        const key = path.node.arguments[0].value;
        const funcName = callee.name;

        if (tFunctionBases.has(funcName)) {
          const base = tFunctionBases.get(funcName);
          keys.add(`${base}.${key}`);
        }
      }
    },
  });

  return keys;
}

function getAllKeysFromSourceFiles() {
  const allKeys = new Map<string, Set<string>>();
  const files = glob.sync(sourceGlob);

  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    try {
      const keys = extractTranslationKeysFromCode(content);
      allKeys.set(file, keys);
    } catch (ex) {
      console.error(`Failed to parse ${file}: ${(ex as Error).message}`);
    }
  });

  return allKeys;
}

function getTranslationKeys(filePath: string) {
  const messages = JSON.parse(fs.readFileSync(filePath, "utf8"));
  function extractKeys(obj: object | string, prefix = ""): Set<string> {
    if (typeof obj === "string") {
      return new Set([prefix]);
    }

    let keys = new Set<string>();
    for (const [key, value] of Object.entries(obj)) {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      keys = keys.union(extractKeys(value, newPrefix));
    }
    return keys;
  }
  return extractKeys(messages);
}

describe("messages", () => {
  const usedKeys = getAllKeysFromSourceFiles();
  const definedKeys = getTranslationKeys(translationFilePath);

  const table: { file: string; key: string }[] = [];
  for (const [file, keys] of usedKeys.entries()) {
    for (const key of keys) {
      if (!definedKeys.has(key)) {
        table.push({
          file,
          key,
        });
      }
    }
  }

  it("should have all translation keys defined in the messages file", () => {
    if (table.length > 0) {
      console.table(table);
    }
    expect(table).toHaveLength(0);
  });
});
