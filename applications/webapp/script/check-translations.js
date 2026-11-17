const fs = require("node:fs");
const path = require("node:path");

const LOCALES_DIR = "public/locales";
const REFERENCE_LANGUAGE = "en-us";

function flattenKeys(obj, prefix = "") {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? flattenKeys(value, fullKey)
      : [fullKey];
  });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function main() {
  const referenceDir = path.join(LOCALES_DIR, REFERENCE_LANGUAGE);

  if (!fs.existsSync(referenceDir)) {
    throw new Error(`Reference language not found: ${referenceDir}`);
  }

  const referenceFiles = fs
    .readdirSync(referenceDir)
    .filter((file) => file.endsWith(".json"));

  const languages = fs.readdirSync(LOCALES_DIR).filter((language) => {
    const languagePath = path.join(LOCALES_DIR, language);
    return (
      language !== REFERENCE_LANGUAGE && fs.statSync(languagePath).isDirectory()
    );
  });

  let hasErrors = false;

  for (const language of languages) {
    for (const file of referenceFiles) {
      const referenceFile = path.join(referenceDir, file);
      const languageFile = path.join(LOCALES_DIR, language, file);

      if (!fs.existsSync(languageFile)) {
        console.error(`[${language}] Missing namespace: ${file}`);
        hasErrors = true;
        continue;
      }

      const referenceKeys = new Set(flattenKeys(readJson(referenceFile)));
      const languageKeys = new Set(flattenKeys(readJson(languageFile)));

      const missing = [...referenceKeys].filter(
        (key) => !languageKeys.has(key),
      );

      const extra = [...languageKeys].filter((key) => !referenceKeys.has(key));

      if (missing.length || extra.length) {
        console.error(`\n[${language}] ${file}`);

        if (missing.length) {
          console.error("Missing keys:", missing);
          hasErrors = true;
        }

        if (extra.length) {
          console.error("Extra keys:", extra);
          hasErrors = true;
        }
      }
    }
  }

  if (hasErrors) {
    console.error("\nTranslation validation failed.");
    process.exitCode = 1;
    return;
  }

  console.log("All translations are consistent.");
}

main();
