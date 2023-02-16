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

interface Section {
  limit?: number;
  content: Config;
}

interface AFMLOptions {
  allowSecret: boolean;
  allowOut?: boolean;
}

const variableTypes: VariableType[] = [
  { type: "string", parse: (value) => value },
  { type: "number", parse: (value) => parseInt(value, 10) },
  { type: "boolean", parse: (value) => value === "true" },
  {
    type: "secret",
    parse: (value: string, allowSecret: boolean = false) =>
      allowSecret ? value : "*".repeat(value.length),
  },
  { type: "null", parse: (value) => null },
];

class AFML {
  private config: Config = {};
  private variables: Variable[] = [];
  private settings: { allowLog: boolean; allowSecret: boolean } = {
    allowLog: false,
    allowSecret: false,
  };

  constructor(settings?: { allowLog?: boolean; allowSecret?: boolean }) {
    if (settings) {
      this.settings = { ...this.settings, ...settings };
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

    for (const sectionName in this.config) {
      const section = this.config[sectionName];
      if (sectionName.endsWith(" :: (")) {
        const limitStart = sectionName.lastIndexOf("(");
        const limitEnd = sectionName.lastIndexOf(")");
        if (limitStart !== -1 && limitEnd !== -1 && limitEnd > limitStart) {
          const limit = parseInt(
            sectionName.slice(limitStart + 1, limitEnd),
            10
          );
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
  public parseFile(filePath: string): Config {
    const data = fs.readFileSync(filePath, "utf-8");
    const config = this.parse(data);

    if (this.config.allowLog) {
      console.log(config);
    }

    return config;
  }
}
export { AFML };