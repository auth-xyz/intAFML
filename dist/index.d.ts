interface Config {
    [key: string]: any;
}
declare function parseAFML(filePath: string, options?: {
    allowSecret: boolean;
}): Config;
export { parseAFML };
