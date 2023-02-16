interface Config {
    [key: string]: any;
}
declare class AFML {
    private config;
    private variables;
    private settings;
    constructor(settings?: {
        allowLog?: boolean;
        allowSecret?: boolean;
    });
    private parse;
    parseFile(filePath: string): Config;
}
export { AFML };
