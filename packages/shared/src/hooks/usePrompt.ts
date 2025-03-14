import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCallback } from 'react';
import type { ButtonProps } from '../components/buttons/Button';
import type { ModalSize } from '../components/modals/common/types';
import { generateQueryKey, RequestKey } from '../lib/query';

export const PROMPT_KEY = generateQueryKey(RequestKey.Prompt, null);

export type PromptButtonProps = Omit<ButtonProps<'button'>, 'onClick'> & {
  title?: string;
};

export type PromptOptions = {
  title: string;
  icon?: ReactNode;
  description?: string | ReactNode;
  okButton?: PromptButtonProps;
  cancelButton?: PromptButtonProps;
  content?: ReactNode;
  promptSize?: ModalSize.XSmall | ModalSize.Small;
  className?: {
    modal?: string;
    title?: string;
    description?: string;
    buttons?: string;
  };
  shouldCloseOnOverlayClick?: boolean;
};

type Prompt = {
  options: PromptOptions | null;
  onSuccess: () => void;
  onFail: () => void;
};

type UsePromptRet = {
  showPrompt: (options: PromptOptions) => Promise<boolean>;
  prompt: Prompt;
};

export function usePrompt(): UsePromptRet {
  const client = useQueryClient();
  const { data: prompt } = useQuery({
    queryKey: PROMPT_KEY,
    queryFn: () => client.getQueryData<Prompt>(PROMPT_KEY) || null,
  });

  const setPrompt = useCallback(
    (data: Prompt) => client.setQueryData(PROMPT_KEY, data),
    [client],
  );

  const showPrompt = useCallback(
    (promptOptions: PromptOptions): Promise<boolean> =>
      new Promise((resolve) => {
        const closeWith = (result: boolean) => {
          resolve(result);
          setPrompt(null);
        };
        const newPrompt: Prompt = {
          options: promptOptions,
          onFail: () => closeWith(false),
          onSuccess: () => closeWith(true),
        };
        setPrompt(newPrompt);
      }),
    [setPrompt],
  );

  return { showPrompt, prompt };
}
