"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAFML = void 0;
// Import necessary modules
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Define the supported types in AFML
var AFMLTypes;
(function (AFMLTypes) {
    AFMLTypes["String"] = "String";
    AFMLTypes["Secret"] = "Secret";
    AFMLTypes["Number"] = "Number";
    AFMLTypes["Boolean"] = "Boolean";
    AFMLTypes["JSON"] = "JSON";
    AFMLTypes["Array"] = "Array";
})(AFMLTypes || (AFMLTypes = {}));
const parseValues = (value, type, allowSecret = true) => {
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
const resolvePath = (filePath, baseDir) => {
    // Check if the path starts with a custom alias
    if (filePath.startsWith("@")) {
        // Split the alias and the rest of the path
        const parts = filePath.split("/");
        const alias = parts.shift();
        const aliasPath = parts.join("/");
        // Read the tsconfig.json file
        const tsconfig = JSON.parse(fs_1.default.readFileSync(path_1.default.join(baseDir, "tsconfig.json"), "utf-8"));
        // Check if the alias is defined in the paths property
        if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths) {
            const aliasBase = tsconfig.compilerOptions.paths[alias][0];
            // Resolve the full path for the file
            return path_1.default.resolve(baseDir, aliasBase, aliasPath);
        }
        else {
            throw new Error(`[AFML] :: Alias "${alias}" not defined in tsconfig.json`);
        }
    }
    // Return the original path if it doesn't start with a custom alias
    return path_1.default.resolve(baseDir, filePath);
};
const parseAFML = (filePath, basePath = process.cwd(), options = { allowSecret: false }) => {
    // Resolve the path for the file
    const resolvedPath = resolvePath(filePath, basePath);
    // Read the content of the file
    const fileContent = fs_1.default.readFileSync(filePath, "utf-8");
    // Split the content by line
    const lines = fileContent.split("\n");
    // Keep track of the current section and its size limit
    let currentSection = null;
    let currentSectionSizeLimit = null;
    // Store the variables and their values
    const variables = {};
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
            if (currentSectionSizeLimit &&
                Object.keys(variables[currentSection]).length >= currentSectionSizeLimit) {
                throw new Error(`[AFML] :: Section :"${currentSection}" went above set limit: ${currentSectionSizeLimit}`);
            }
            // Extract the variable and its value
            const parts = trimmedLine.split(":").map((part) => part.trim());
            const variable = parts[0];
            const value = parts[1].split(" *")[0].trim();
            const type = parts[1].split(" *")[1]
                ? parts[1].split(" *")[1].trim()
                : AFMLTypes.String;
            // Parse the value based on its type
            let parsedValue;
            if (options.allowSecret || type !== AFMLTypes.Secret) {
                parsedValue = parseValues(value, type);
            }
            else {
                parsedValue = "*".repeat(value.length);
            }
            // Assign the parsed value to the variable in the current section
            variables[currentSection][variable] = parsedValue;
        }
    }
    return variables;
};
exports.parseAFML = parseAFML;
