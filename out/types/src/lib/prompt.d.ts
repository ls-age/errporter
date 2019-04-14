import { PromptType } from 'prompts';
export declare function enqueueInteractiveAction(action: () => Promise<any>): Promise<any>;
export declare function enqueuePrompt({ message, type }: {
    message: string;
    type?: PromptType;
}): Promise<any>;
export declare function promptList({ message }: {
    message: string;
}): Promise<string[]>;
