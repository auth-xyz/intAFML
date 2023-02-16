"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AFML = void 0;
const fs = __importStar(require("fs"));
const variableTypes = [
    { type: "string", parse: (value) => value },
    { type: "number", parse: (value) => parseInt(value, 10) },
    { type: "boolean", parse: (value) => value === "true" },
    {
        type: "secret",
        parse: (value, allowSecret = false) => allowSecret ? value : "*".repeat(value.length),
    },
    { type: "null", parse: (value) => null },
];
class AFML {
    config = {};
    variables = [];
    settings = {
        allowLog: false,
        allowSecret: false,
    };
    constructor(settings) {
        if (settings) {
            this.settings = { ...this.settings, ...settings };
        }
    }
    parse(data) {
        const lines = data.split("\n");
        let currentSection = "";
        const sectionRegex = new RegExp(/\[([^\]]+)\]/);
        for (const line of lines) {
            const sectionMatch = line.match(sectionRegex);
            if (sectionMatch) {
                currentSection = sectionMatch[1].trim();
                this.config[currentSection] = {};
                continue;
            }
            if (line.startsWith("#")) {
                continue;
            }
            const parts = line.split(" : ");
            if (parts.length !== 2) {
                continue;
            }
            const name = parts[0].trim();
            const rawValue = parts[1]
                .split(" *")[0]
                .trim()
                .replace(/^"(.*)"$/, "$1");
            const type = parts[1].split(" *")[1].trim();
            const variableType = variableTypes.find((t) => t.type.toLowerCase() === type);
            if (!variableType) {
                continue;
            }
            const value = variableType.parse(rawValue, this.settings.allowSecret);
            this.variables.push({
                name,
                value,
                type: variableType.type,
            });
            this.config[currentSection][name] = value;
        }
        for (const sectionName in this.config) {
            const section = this.config[sectionName];
            if (sectionName.endsWith(" :: (")) {
                const limitStart = sectionName.lastIndexOf("(");
                const limitEnd = sectionName.lastIndexOf(")");
                if (limitStart !== -1 && limitEnd !== -1 && limitEnd > limitStart) {
                    const limit = parseInt(sectionName.slice(limitStart + 1, limitEnd), 10);
                    const content = Object.assign({}, section);
                    delete content[`:: (${limit})`];
                    this.config[sectionName.slice(0, limitStart - 1)] = {
                        limit,
                        content,
                    };
                    delete this.config[sectionName];
                }
            }
        }
        return this.config;
    }
    parseFile(filePath) {
        const data = fs.readFileSync(filePath, "utf-8");
        const config = this.parse(data);
        if (this.config.allowLog) {
            console.log(config);
        }
        return config;
    }
}
exports.AFML = AFML;
