declare const parseAFML: (filePath: string, options?: {
    allowSecret: boolean;
}) => {
    [key: string]: any;
};
export { parseAFML };
