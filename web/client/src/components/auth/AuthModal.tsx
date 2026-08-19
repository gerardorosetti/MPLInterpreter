import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthMode } from '@/constants/enums';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { X, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = AuthMode.LOGIN,
}) => {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

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

          <div className="relative z-10 w-full max-w-md flex flex-col items-center">
            {/* Forms wrapper for height transitions */}
            <div className="flex w-full p-1 bg-white/5 border border-white/10 rounded-xl mb-8">
              {(Object.values(AuthMode) as AuthMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`relative flex-1 py-2 text-sm font-medium transition-colors z-10 ${
                    mode === m ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {mode === m && (
                    <motion.div
                      layoutId="authTabIndicator"
                      className="absolute inset-0 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {m === AuthMode.LOGIN ? t('auth.signIn') : t('auth.createAccount')}
                </button>
              ))}
            </div>

            <div className="relative w-full">
              <AnimatePresence mode="wait">
                {mode === AuthMode.LOGIN ? (
                  <LoginForm
                    key="login"
                    onSuccess={onClose}
                    onToggleMode={() => setMode(AuthMode.REGISTER)}
                  />
                ) : (
                  <RegisterForm
                    key="register"
                    onSuccess={onClose}
                    onToggleMode={() => setMode(AuthMode.LOGIN)}
                  />
                )}
              </AnimatePresence>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={onClose}
              className="mt-6 group relative overflow-hidden px-6 py-3 w-full max-w-sm rounded-xl font-medium text-white shadow-sm border border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">{t('auth.continueAsGuest')}</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <button
              onClick={onClose}
              className="mt-4 p-2 text-gray-500 hover:text-white transition-colors absolute -top-12 right-0 md:-right-12"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
