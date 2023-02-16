import * as fs from "fs";
interface Config {
  [key: string]: any;
}

interface Variable {
  name: string;
  value: any;
  type: string;
}

interface VariableType {
  type: string;
  parse: (value: string, allowSecret?: boolean) => any;
}

const variableTypes: VariableType[] = [
  { type: "String", parse: (value) => value },
  { type: "Number", parse: (value) => parseInt(value, 10) },
  { type: "Boolean", parse: (value) => value === "true" },
  {
    type: "Secret",
    parse: (value: string, allowSecret: boolean = false) =>
      allowSecret ? value : "*".repeat(value.length),
  },
  { type: "Null", parse: (value) => null },
];

class AFML {
  private config: Config = {};
  private variables: Variable[] = [];
  private settings: { allowSecret: boolean } = { allowSecret: false };

  constructor(settings?: { allowSecret: boolean }) {
    if (settings) {
      this.settings = settings;
    }
  }

  private parse(data: string): Config {
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

      const variableType = variableTypes.find(
        (t) => t.type.toLowerCase() === type
      );
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

    return this.config;
  }

  public parseFile(filePath: string): Config {
    const data = fs.readFileSync(filePath, "utf-8");
    return this.parse(data);
  }
}

export {
  AFML
}