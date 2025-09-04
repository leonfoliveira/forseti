const fs = require("fs");

const glob = require("glob");

const sourceDir = process.argv[2];
const files = glob.sync(`${sourceDir}/*.json`);

const fileKeys = {};

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

for (const file of files) {
  const obj = JSON.parse(fs.readFileSync(file, "utf-8"));
  const fileName = file.split("/").pop().replace(".json", "");
  fileKeys[fileName] = new Set();
  readKeys(fileName, obj);
}

base = fileKeys["en-US"];
isValid = true;
for (const file in fileKeys) {
  if (fileKeys[file].size !== base.size) {
    console.log(`Missing keys for ${file}:`);
    console.table([...base].filter((key) => !fileKeys[file].has(key)));
    isValid = false;
  }
}

if (!isValid) {
  process.exit(1);
}
