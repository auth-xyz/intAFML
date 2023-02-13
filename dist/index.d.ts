interface Config {
    [key: string]: any;
}
declare class ConfigParser {
    private config;
    private variables;
    private settings;
    constructor(settings?: {
        allowSecret: boolean;
    });
    parse(data: string): Config;
    parseFile(filePath: string): Config;
}
export { ConfigParser };
