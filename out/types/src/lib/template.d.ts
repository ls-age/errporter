export declare function parseArgs(raw: any): (string | number)[];
export declare type Resolver = (options: {
    args: (number | string)[];
}) => Promise<string> | string;
export interface ResolverMap {
    [name: string]: Resolver;
}
export declare const builtinResolvers: ResolverMap;
export default function renderTemplate(str: string, resolvers?: ResolverMap): Promise<any>;
