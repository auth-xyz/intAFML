"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAFML = void 0;
var fs_1 = __importDefault(require("fs"));
var AFMLDataType;
(function (AFMLDataType) {
    AFMLDataType["String"] = "String";
    AFMLDataType["Boolean"] = "Boolean";
    AFMLDataType["Number"] = "Number";
    AFMLDataType["Secret"] = "Secret";
})(AFMLDataType || (AFMLDataType = {}));
function parseAFML(filePath, options) {
    if (options === void 0) { options = { allowSecret: false }; }
    var config = {};
    var lines = fs_1.default.readFileSync(filePath, 'utf-8').split('\n');
    var currentSection = '';
    lines.forEach(function (line) {
        var _a;
        line = line.trim();
        if (line.startsWith('#') || line === '')
            return;
        var matchSection = line.match(/^\[(.*)\]$/);
        if (matchSection) {
            currentSection = matchSection[1];
            config[currentSection] = {};
            return;
        }
        var parts = line.split(/\s*;\s*/);
        var valueWithType = parts[0].trim();
        var dataType = (_a = parts[1]) === null || _a === void 0 ? void 0 : _a.trim();
        if (!valueWithType) {
            throw new Error("Line '".concat(line, "' does not contain a value"));
        }
        if (!AFMLDataType[dataType]) {
            throw new Error("Line '".concat(line, "' contains an invalid data type: ").concat(dataType));
        }
        var valueAndKey = valueWithType.split(':');
        var key = valueAndKey[0].trim();
        var value = valueAndKey[1].trim();
        if (dataType === AFMLDataType.Secret) {
            if (!options.allowSecret) {
                console.log("Secret variable detected: ".concat(key));
                value = "****";
            }
        }
        else {
            if (dataType === AFMLDataType.String) {
                var matchString = value.match(/^"(.*)"$/);
                if (matchString) {
                    value = matchString[1];
                }
                else {
                    throw new Error("Line '".concat(line, "' does not contain a valid string value"));
                }
            }
            else if (dataType === AFMLDataType.Boolean) {
                if (value === 'true' || value === 'false') {
                    value = value === 'true';
                }
                else {
                    throw new Error("Line '".concat(line, "' does not contain a valid boolean value"));
                }
            }
            else if (dataType === AFMLDataType.Number) {
                if (!isNaN(value)) {
                    value = Number(value);
                }
                else {
                    throw new Error("Line '".concat(line, "' does not contain a valid number value"));
                }
            }
        }
        config[currentSection][key] = value;
    });
    return config;
}
exports.parseAFML = parseAFML;
