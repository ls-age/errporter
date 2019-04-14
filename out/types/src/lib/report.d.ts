import { ResolverMap } from './template';
export declare function getTemplate(options: {
    template?: string;
    package?: string;
}): Promise<{
    path: string;
    template: string;
}>;
export interface ReportOptions {
    title?: string;
    template?: string;
    package?: string;
    repo?: string;
    resolvers?: ResolverMap;
    open?: boolean;
}
export declare function report(options: ReportOptions): Promise<string>;
