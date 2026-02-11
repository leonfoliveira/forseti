const fs = require("fs");

const glob = require("glob");

const sourceDir = process.argv[2] || "src/i18n/messages/";
const files = glob.sync(`${sourceDir}/*.json`);

const fileKeys = {};

/**
 * Recursively read keys from a nested object and store them in fileKeys.
 */
function readKeys(filename, obj, curr = []) {
  if (typeof obj === "string") {
    fileKeys[filename].add(curr.join("."));
  }

  if (typeof obj === "object") {
    Object.entries(obj).forEach(([key, value]) => {
      readKeys(filename, value, curr.concat(key));
    });
  }
}

/**
 * Verify that all translation files have the same keys as the base file (en-US).
 */
function verifyTranslations() {
  for (const file of files) {
    const obj = JSON.parse(fs.readFileSync(file, "utf-8"));
    const fileName = file.split("/").pop().replace(".json", "");
    fileKeys[fileName] = new Set();
    readKeys(fileName, obj);
  }

  const base = fileKeys["en-US"];
  for (const file in fileKeys) {
    if (fileKeys[file].size !== base.size) {
      const missingKeys = [...base].filter((key) => !fileKeys[file].has(key));
      if (missingKeys.length > 0) {
        console.error(`❌ ${file} is missing keys compared to en-US:`);
        console.table(missingKeys);
        process.exit(1);
      }
    }
  }

  console.log("✅ All translation files have the same keys as en-US!");
}

verifyTranslations();
