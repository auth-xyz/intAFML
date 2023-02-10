import fs from 'fs';

interface Config {
  [key: string]: any;
}

enum AFMLDataType {
  String = 'String',
  Boolean = 'Boolean',
  Number = 'Number',
  Secret = 'Secret',
}

function parseAFML(filePath: string, options: { allowSecret: boolean } = { allowSecret: false }): Config {
  let config: Config = {};
  let lines = fs.readFileSync(filePath, 'utf-8').split('\n');

  let currentSection = '';

  lines.forEach(line => {
    line = line.trim();

    if (line.startsWith('#') || line === '') return;

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

    if (!AFMLDataType[dataType as keyof typeof AFMLDataType]) {
      throw new Error(`Line '${line}' contains an invalid data type: ${dataType}`);
    }

    let valueAndKey = valueWithType.split(':');
    let key = valueAndKey[0].trim();
    let value: any = valueAndKey[1].trim();

    if (dataType === AFMLDataType.Secret) {
      if (!options.allowSecret) {
        console.log(`Secret variable detected: ${key}`);
        value = "****";
      }
    } else {
      if (dataType === AFMLDataType.String) {
        let matchString = value.match(/^"(.*)"$/);
        if (matchString) {
          value = matchString[1];
        } else {
          throw new Error(`Line '${line}' does not contain a valid string value`);
        }
      } else if (dataType === AFMLDataType.Boolean) {
        if (value === 'true' || value === 'false') {
          value = value === 'true';
        } else {
          throw new Error(`Line '${line}' does not contain a valid boolean value`);
        }
      } else if (dataType === AFMLDataType.Number) {
        if (!isNaN(value)) {
          value = Number(value);
        } else {
          throw new Error(`Line '${line}' does not contain a valid number value`);
        }
      }
    }

    config[currentSection][key] = value;
  });

  return config;
}

export { 
  parseAFML
}