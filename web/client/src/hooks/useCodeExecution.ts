/**
 * @file useCodeExecution.ts
 * @description Custom hook to manage code execution state and logic.
 */

import { useState } from 'react';
import { ApiService } from '@/services/api';
import { useTranslation } from 'react-i18next';
import { handleApiError } from '@/utils/errorHelper';

/**
 * Hook to execute MPL code and manage loading/error states.
 */
export const useCodeExecution = () => {
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  /**
   * Executes the given MPL code.
   * @param code - The MPL source code to execute.
   */
  const execute = async (code: string) => {
    setIsLoading(true);
    setOutput(`${t('app.executing', 'Executing...')}\n`);
    try {
      const result = await ApiService.executeCode(code);
      let finalOutput = '';
      if (result.error) finalOutput += `Error: ${result.error}\n`;
      if (result.stderr) finalOutput += `Stderr: ${result.stderr}\n`;
      if (result.stdout) finalOutput += result.stdout;
      setOutput(finalOutput || t('app.noOutput', 'No output.'));
    } catch (error: unknown) {
      setOutput(handleApiError(error, t));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clears the current output.
   */
  const clearOutput = () => setOutput('');

  return {
    output,
    isLoading,
    execute,
    clearOutput,
    setOutput,
  };
};
