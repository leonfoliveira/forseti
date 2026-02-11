const fs = require("fs");

const glob = require("glob");

const sourceDir = process.argv[2];
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
function verify() {
  for (const file of files) {
    const obj = JSON.parse(fs.readFileSync(file, "utf-8"));
    const fileName = file.split("/").pop().replace(".json", "");
    fileKeys[fileName] = new Set();
    readKeys(fileName, obj);
  }

  const base = fileKeys["en-US"];
  let isValid = true;
  for (const file in fileKeys) {
    if (fileKeys[file].size !== base.size) {
      const missingKeys = [...base].filter((key) => !fileKeys[file].has(key));
      if (missingKeys.length > 0) {
        console.table(missingKeys);
        isValid = false;
      }
    }
  }

  if (!isValid) {
    process.exit(1);
  }
}

verify();
