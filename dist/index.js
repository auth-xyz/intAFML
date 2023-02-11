"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAFML = void 0;
const fs_1 = __importDefault(require("fs"));
var AFMLDataType;
(function (AFMLDataType) {
    AFMLDataType["String"] = "String";
    AFMLDataType["Boolean"] = "Boolean";
    AFMLDataType["Number"] = "Number";
    AFMLDataType["Secret"] = "Secret";
})(AFMLDataType || (AFMLDataType = {}));
function parseAFML(filePath, options = { allowSecret: false }) {
    let config = {};
    let lines = fs_1.default.readFileSync(filePath, 'utf-8').split('\n');
    let currentSection = '';
    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith('#') || line === '')
            return;
        let matchSection = line.match(/^\[(.*)\]$/);
        if (matchSection) {
            currentSection = matchSection[1];
            config[currentSection] = {};
            return;
        }
        let parts = line.split(/\s*;\s*/);
        let valueWithType = parts[0].trim();
        let dataType = parts[1]?.trim();
        if (!valueWithType) {
            throw new Error(`Line '${line}' does not contain a value`);
        }
        if (!AFMLDataType[dataType]) {
            throw new Error(`Line '${line}' contains an invalid data type: ${dataType}`);
        }
        let valueAndKey = valueWithType.split(':');
        let key = valueAndKey[0].trim();
        let value = valueAndKey[1].trim();
        if (dataType === AFMLDataType.Secret) {
            if (!options.allowSecret) {
                console.log(`Secret variable detected: ${key}`);
                value = "****";
            }
        }
        else {
            if (dataType === AFMLDataType.String) {
                let matchString = value.match(/^"(.*)"$/);
                if (matchString) {
                    value = matchString[1];
                }
                else {
                    throw new Error(`Line '${line}' does not contain a valid string value`);
                }
            }
            else if (dataType === AFMLDataType.Boolean) {
                if (value === 'true' || value === 'false') {
                    value = value === 'true';
                }
                else {
                    throw new Error(`Line '${line}' does not contain a valid boolean value`);
                }
            }
            else if (dataType === AFMLDataType.Number) {
                if (!isNaN(value)) {
                    value = Number(value);
                }
                else {
                    throw new Error(`Line '${line}' does not contain a valid number value`);
                }
            }
        }
        config[currentSection][key] = value;
    });
    return config;
}
exports.parseAFML = parseAFML;
