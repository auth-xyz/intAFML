declare const parseAFML: (filePath: string, basePath?: string, options?: {
    allowSecret: boolean;
}) => {
    [key: string]: any;
};
export { parseAFML };
