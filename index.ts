// Import necessary modules
import fs from "fs";
import path from "path";

// Define the supported types in AFML
enum AFMLTypes {
  String = "String",
  Secret = "Secret",
  Number = "Number",
  Boolean = "Boolean",
  JSON = "JSON",
  Array = "Array",
}

const parseValues = (value: string, type: any, allowSecret = true): any => {
  switch (type) {
    case AFMLTypes.String:
      return value;
    case AFMLTypes.Secret:
      return allowSecret ? value : "*".repeat(value.length);
    case AFMLTypes.Number:
      return parseFloat(value);
    case AFMLTypes.Boolean:
      return value === "true";
    case AFMLTypes.JSON:
      return JSON.parse(value);
    case AFMLTypes.Array:
      return value.split(",").map((item) => item.trim());
    default:
      throw new Error(`[AFML] :: Unsupported type annotation: ${type}`);
  }
};


const parseAFML = (
  filePath: string,
  options: { allowSecret: boolean } = { allowSecret: false }
) => {
  // Read the content of the file
  const fileContent = fs.readFileSync(filePath, "utf-8");

  // Split the content by line
  const lines = fileContent.split("\n");

  // Keep track of the current section and its size limit
  let currentSection: string | null = null;
  let currentSectionSizeLimit: number | null = null;

  // Store the variables and their values
  const variables: { [key: string]: any } = {};

  // Parse each line
  for (const line of lines) {
    // Trim the line and remove any comments
    const trimmedLine = line.trim().split("#")[0];

    // Skip empty lines
    if (!trimmedLine) {
      continue;
    }

    // Check if the line starts a new section
    if (trimmedLine.startsWith("[")) {
      // Extract the section name and size limit
      const sectionParts = trimmedLine
        .slice(1, -1)
        .split("(")
        .map((part) => part.trim());
      const sectionName = sectionParts[0];
      const sectionSizeLimit = sectionParts[1]
        ? parseInt(sectionParts[1].slice(0, -1))
        : null;

      // Update the current section and size limit
      currentSection = sectionName;
      currentSectionSizeLimit = sectionSizeLimit;

      // Initialize the section in the variables object
      variables[sectionName] = {};

      continue;
    }

    // Check if the line defines a variable
    if (currentSection) {
      // Check if the size limit of the current section has been reached
      if (
        currentSectionSizeLimit &&
        Object.keys(variables[currentSection]).length >= currentSectionSizeLimit
      ) {
        throw new Error(
          `[AFML] :: Section :"${currentSection}" went above set limit: ${currentSectionSizeLimit}`
        );
      }

      // Extract the variable and its value
      const parts = trimmedLine.split(":").map((part) => part.trim());
      const variable = parts[0];
      const value = parts[1].split(" *")[0].trim();
      const type = parts[1].split(" *")[1]
        ? (parts[1].split(" *")[1].trim() as AFMLTypes)
        : AFMLTypes.String;

      // Parse the value based on its type
      let parsedValue: any;
      if (options.allowSecret || type !== AFMLTypes.Secret) {
        parsedValue = parseValues(value, type);
      } else {
        parsedValue = "*".repeat(value.length);
      }

      // Assign the parsed value to the variable in the current section
      variables[currentSection][variable] = parsedValue;
    }
  }

  return variables;
};


export {
  parseAFML
}