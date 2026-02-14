const fs = require("fs");
const path = require("path");

const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const glob = require("glob");

/**
 * Converts camelCase to kebab-case
 * @param {string} str The camelCase string
 * @returns {string} The kebab-case string
 */
function camelToKebab(str) {
  return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

/**
 * Generates the expected message ID based on file path and message key
 * @param {string} filePath The file path
 * @param {string} sourceDir The source directory
 * @param {string} messageKey The message key
 * @returns {string} The expected message ID
 */
function generateExpectedId(filePath, sourceDir, messageKey) {
  // Get relative path from source directory
  const relativePath = path.relative(sourceDir, filePath);

  // Remove file extension
  const pathWithoutExt = relativePath.replace(/\.(js|jsx|ts|tsx)$/, "");

  // Replace path separators with dots
  const pathPart = pathWithoutExt.replace(/[/\\]/g, ".");

  // Convert message key to kebab-case
  const kebabKey = camelToKebab(messageKey);

  return `${pathPart}.${kebabKey}`;
}

/**
 * Extracts messages and their file info from a single file's content.
 * @param {string} code The file content.
 * @param {string} filePath The file path.
 * @param {string} sourceDir The source directory.
 * @returns {Array} Array of message violations.
 */
function checkMessagesInFile(code, filePath, sourceDir) {
  const violations = [];

  try {
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    traverse(ast, {
      CallExpression(astPath) {
        const callee = astPath.node.callee;
        if (callee.type === "Identifier" && callee.name === "defineMessages") {
          const messageObject = astPath.node.arguments[0];

          if (messageObject && messageObject.type === "ObjectExpression") {
            messageObject.properties.forEach((property) => {
              if (property.type === "ObjectProperty") {
                const messageKey = property.key.value || property.key.name;
                let messageId = null;

                if (property.value.type === "ObjectExpression") {
                  property.value.properties.forEach((detailProp) => {
                    const detailKey =
                      detailProp.key.value || detailProp.key.name;
                    if (detailKey === "id") {
                      messageId = detailProp.value.value;
                    }
                  });
                }

                if (messageId && messageKey) {
                  const expectedId = generateExpectedId(
                    filePath,
                    sourceDir,
                    messageKey,
                  );

                  if (messageId !== expectedId) {
                    violations.push({
                      path: path.relative(process.cwd(), filePath),
                      messageKey,
                      currentId: messageId,
                      expectedId: expectedId,
                    });
                  }
                }
              }
            });
          }
        }
      },
    });
  } catch (error) {
    console.error(`Error parsing file ${filePath}:`, error.message);
  }

  return violations;
}

/**
 * Main function to traverse a directory and check message ID patterns.
 * @param {string} sourceDir The directory to start the search from.
 */
async function verifyIds(sourceDir) {
  const allViolations = [];

  // Use glob to find all relevant files recursively.
  const files = glob.sync(`${sourceDir}/**/*.{js,jsx,ts,tsx}`);

  files.forEach((file) => {
    try {
      const code = fs.readFileSync(file, "utf-8");
      const violations = checkMessagesInFile(code, file, sourceDir);
      allViolations.push(...violations);
    } catch (err) {
      console.error(`Failed to process file ${file}:`, err);
    }
  });

  // Print results
  if (allViolations.length === 0) {
    console.log("✅ All message IDs follow the correct pattern!");
  } else {
    console.log(
      `❌ Found ${allViolations.length} message(s) that don't follow the pattern:\n`,
    );

    // Print table
    console.table(
      allViolations.map((v) => ({
        Path: v.path,
        "Message Key": v.messageKey,
        "Current ID": v.currentId,
        "Expected ID": v.expectedId,
      })),
    );
  }

  return allViolations.length;
}

// Get source directory from command line arguments
const sourceDirectory = process.argv[2] || "src";

// Run the script
verifyIds(sourceDirectory).then((violationCount) => {
  process.exit(violationCount > 0 ? 1 : 0);
});
