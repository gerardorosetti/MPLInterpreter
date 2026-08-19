/**
 * @file api.ts
 * @description Core API service for communicating with the MPL backend.
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const API_ENDPOINTS = {
  RUN: `${API_URL}/run`,
  SAMPLES: `${API_URL}/samples`,
  AUTH_LOGIN: `${API_URL}/auth/login`,
  AUTH_REGISTER: `${API_URL}/auth/register`,
  AUTH_ME: `${API_URL}/auth/me`,
  SNIPPETS: `${API_URL}/snippets`,
};

/**
 * Interface representing the response from code execution.
 */
export interface ExecutionResponse {
  /** The standard output produced by the execution */
  stdout: string;
  /** The standard error produced by the execution */
  stderr: string;
  /** Any system-level errors that occurred */
  error: string | null;
}

/**
 * API Service for backend communication.
 * Separates data fetching logic from React components.
 */
export const ApiService = {
  /**
   * Executes MPL code on the backend.
   * @param code - The raw MPL source code to execute.
   * @returns A promise resolving to the execution response.
   */
  async executeCode(code: string): Promise<ExecutionResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.RUN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Execute code API error:', error);
      throw error;
    }
  },

  /**
   * Fetches the list of available sample MPL files.
   * @returns A promise resolving to an array of filenames.
   */
  async getSamples(): Promise<string[]> {
    try {
      const response = await fetch(API_ENDPOINTS.SAMPLES);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.samples || [];
    } catch (error) {
      console.error('Get samples API error:', error);
      return [];
    }
  },

  /**
   * Fetches the content of a specific sample file.
   * @param filename - The name of the sample file to load.
   * @returns A promise resolving to the file content as a string.
   */
  async getSampleContent(filename: string): Promise<string> {
    try {
      const response = await fetch(`${API_ENDPOINTS.SAMPLES}/${filename}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.content || '';
    } catch (error) {
      console.error('Get sample content API error:', error);
      return '';
    }
  },
};
