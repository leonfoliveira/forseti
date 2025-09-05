const fs = require("fs");

const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const glob = require("glob");

/**
 * Extracts messages from a single file's content.
 * @param {string} code The file content.
 * @returns {object} The extracted messages.
 */
function extractMessagesFromFile(code) {
  const extractedMessages = {};

  try {
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        if (callee.type === "Identifier" && callee.name === "defineMessages") {
          const messageObject = path.node.arguments[0];

          if (messageObject && messageObject.type === "ObjectExpression") {
            messageObject.properties.forEach((property) => {
              if (property.type === "ObjectProperty") {
                const messageKey = property.key.value || property.key.name;
                const messageDetails = {};
                if (property.value.type === "ObjectExpression") {
                  property.value.properties.forEach((detailProp) => {
                    const detailKey =
                      detailProp.key.value || detailProp.key.name;
                    const detailValue = detailProp.value.value;
                    messageDetails[detailKey] = detailValue;
                  });
                }
                extractedMessages[messageDetails.id || messageKey] =
                  messageDetails.defaultMessage;
              }
            });
          }
        }
      },
    });
  } catch (error) {
    console.error(`Error parsing file:`, error);
  }

  return extractedMessages;
}

/**
 * Main function to traverse a directory, extract messages, and write to a JSON file.
 * @param {string} sourceDir The directory to start the search from.
 * @param {string} outputFilePath The path for the output JSON file.
 */
async function processMessages(sourceDir, outputFilePath) {
  const flatMessages = {};

  // Use glob to find all relevant files recursively.
  const files = glob.sync(`${sourceDir}/**/*.{js,jsx,ts,tsx}`);

  files.forEach((file) => {
    try {
      const code = fs.readFileSync(file, "utf-8");
      const messages = extractMessagesFromFile(code);
      // Merge messages from the current file into the main object.
      Object.assign(flatMessages, messages);
    } catch (err) {
      console.error(`Failed to process file ${file}:`, err);
    }
  });

  const nestedMessages = {};
  for (const key in flatMessages) {
    const parts = key.split(".");
    let current = nestedMessages;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = flatMessages[key];
      } else {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }

  try {
    const jsonOutput = JSON.stringify(nestedMessages, null, 2);
    fs.writeFileSync(outputFilePath, jsonOutput, "utf-8");
  } catch (err) {
    console.error("Error writing output file:", err);
  }
}

// Set your source directory (e.g., the 'src' folder) and output file path.
const sourceDirectory = process.argv[2];
const outputFile = process.argv[3];

// Run the script.
processMessages(sourceDirectory, outputFile);
