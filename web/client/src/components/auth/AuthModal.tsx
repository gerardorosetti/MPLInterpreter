import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

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
            <div className="relative w-full">
              <AnimatePresence mode="wait">
                {mode === 'login' ? (
                  <LoginForm 
                    key="login" 
                    onSuccess={onClose} 
                    onToggleMode={() => setMode('register')} 
                  />
                ) : (
                  <RegisterForm 
                    key="register" 
                    onSuccess={onClose} 
                    onToggleMode={() => setMode('login')} 
                  />
                )}
              </AnimatePresence>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={onClose}
              className="mt-6 text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Continuar como invitado</span>
            </motion.button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
