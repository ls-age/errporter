import { prompt, PromptType } from 'prompts';

function promptSingleValue({ message, type = 'text' }) {
  return prompt({ message, type, name: 'value' }).then(({ value }) => value);
}

let lastInteractiveAction: Promise<any>;
export function enqueueInteractiveAction(action: () => Promise<any>) {
  const previous = lastInteractiveAction;
  lastInteractiveAction = new Promise(async (resolve, reject) => {
    await previous;
    return action().then(resolve, reject);
  });
  return lastInteractiveAction;
}

export function enqueuePrompt({ message, type = 'text' }: { message: string; type?: PromptType }) {
  return enqueueInteractiveAction(
    () => promptSingleValue({ type, message })
  );
}

export function promptList({ message }: { message: string }): Promise<string[]> {
  return enqueueInteractiveAction(() => {
    const getNext = async (current: string[] = []) => {
      const value = await promptSingleValue({ message: current.length ? ' - ' : `${message}
  (Type an empty line to end)
   - ` });

      return value ? getNext(current.concat(value)) : current;
    };

    return getNext();
  });
}
