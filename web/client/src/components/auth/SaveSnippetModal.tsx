import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Save, X, Loader2, Download, Cloud, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '@/services/api';
import { handleApiError } from '@/utils/errorHelper';

interface SaveSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: string;
  onDownload: () => void;
  onLogin: () => void;
}

export const SaveSnippetModal: React.FC<SaveSnippetModalProps> = ({
  isOpen,
  onClose,
  currentContent,
  onDownload,
  onLogin,
}) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(API_ENDPOINTS.SNIPPETS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content: currentContent,
          isPublic: false,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'errors.serverError');
      }

      onClose();
      setTitle('');
    } catch (err: unknown) {
      setError(handleApiError(err, t));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!user ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                  <Save className="w-5 h-5 text-blue-400" />
                  {t('snippets.saveOptions')}
                </h2>
                <p className="text-gray-400 text-sm mb-6">{t('snippets.guestSavePrompt')}</p>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={onDownload}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Download className="w-5 h-5 text-emerald-400 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-medium">{t('snippets.downloadLocally')}</h3>
                      <p className="text-sm text-gray-400">{t('snippets.downloadDesc')}</p>
                    </div>
                  </button>

                  <button
                    onClick={onLogin}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                      <LogIn className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-medium">{t('snippets.loginToSave')}</h3>
                      <p className="text-sm text-gray-400">{t('snippets.loginToSaveDesc')}</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-400" />
                  {t('snippets.saveToCloud')}
                </h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {t('snippets.snippetTitle')}
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Matrix Multiplication"
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex flex-col gap-3 mt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting || !title.trim()}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        t('snippets.saveToCloud')
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onDownload}
                      className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {t('snippets.downloadLocally')}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
