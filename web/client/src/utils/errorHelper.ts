export const handleApiError = (err: unknown, t: (key: string) => string): string => {
  if (err instanceof Error) {
    if (err.message.startsWith('errors.')) {
      return t(err.message);
    }
    // Handle specific network errors if needed or fallback
    return t('errors.unknownError');
  }
  return t('errors.unknownError');
};
