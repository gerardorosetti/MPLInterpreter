import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCodeExecution } from './useCodeExecution';
import { ApiService } from '@/services/api';

// Mock the API service
vi.mock('@/services/api', () => ({
  ApiService: {
    executeCode: vi.fn(),
  },
}));

describe('useCodeExecution hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default states', () => {
    const { result } = renderHook(() => useCodeExecution());
    expect(result.current.output).toBe('');
    expect(result.current.isLoading).toBe(false);
  });

  it('should set loading state and output when executing successfully', async () => {
    const mockExecute = vi.mocked(ApiService.executeCode).mockResolvedValue({
      stdout: 'Success output',
      stderr: '',
      error: null,
    });

    const { result } = renderHook(() => useCodeExecution());

    await act(async () => {
      await result.current.execute('print(2);');
    });

    expect(mockExecute).toHaveBeenCalledWith('print(2);');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.output).toContain('Success output');
  });

  it('should handle API errors gracefully', async () => {
    const mockExecute = vi
      .mocked(ApiService.executeCode)
      .mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useCodeExecution());

    await act(async () => {
      await result.current.execute('print(2);');
    });

    expect(mockExecute).toHaveBeenCalledWith('print(2);');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.output).toContain('errors.unknownError');
  });

  it('should clear output when clearOutput is called', async () => {
    const { result } = renderHook(() => useCodeExecution());

    act(() => {
      result.current.setOutput('Test output');
    });

    expect(result.current.output).toBe('Test output');

    act(() => {
      result.current.clearOutput();
    });

    expect(result.current.output).toBe('');
  });
});
