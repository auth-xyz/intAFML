# intAFML - Interpreter for AFML
intAFML is a TypeScript based interpreter for AFML (Another Fucking Markup Language) configuration files. It provides type information for your configuration files, allowing you to ensure that your files are secure and easy to maintain.

## Features
- Support for the following types: String, Number, Boolean, and Secret
- Familiar syntax similar to TOML
- Strong typing and error-checking with TypeScript
- Option to reveal values given the type Secret in the output

## Installation
You can install intAFML using npm:

```bash
npm install afml@latest
```

## Usage
The main export of intAFML is a function called `parseAFML`, which accepts two arguments:
- `path`: a string representing the path of the AFML configuration file
- `options`: an options object with the following properties:
- `allowSecret` (default: `false`): a boolean value indicating whether values given the type Secret should be revealed in the output

```typescript
import { ConfigParser } from "afml";
const afml = new ConfigParser();

afml.parseFile("/path/to/afml");

```

##### Examples:

- Consider the following example AFML configuration file:

```yaml
# config.afml

[login] #Unlimited assets inside a section
username : "Auth" *string
password : "1234" *secret
age : 19  *number
cool: true *boolean

[app (2)] #Limited amount of assets inside a section, if any more assets are added it'll throw an error
test : "something" *string
test2 : "Something2" *string 
```


Parsing this file with allowSecret set to false (the default value) would result in the following output:


```ts
login: { "username": "Auth", "password": "*****", "age": 19, "cool": true }

```

Setting allowSecret to true would reveal the secret value:


```ts
login: { "username": "Auth", "password": "1234" "age": 19, "cool": true }
```

#### Contributing

Contributions are welcome! If you find a bug or have an idea for a new feature, please open an issue or submit a pull request.
