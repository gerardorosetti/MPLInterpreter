/**
 * @file LandingPage.tsx
 * @description Module handling LandingPage.tsx functionality for the MPL Interactive IDE.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Terminal, Cloud, Zap, ArrowRight, Code2, Globe, Sun, Moon, LogOut } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { AppLanguage, AuthMode, AppTheme, LocalStorageKey } from '@/constants/enums';
import { useAuth } from '@/contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.LOGIN);
  const [theme, setTheme] = useState<AppTheme>(
    document.documentElement.classList.contains(AppTheme.DARK) ? AppTheme.DARK : AppTheme.LIGHT
  );

  React.useEffect(() => {
    if (theme === AppTheme.DARK) {
      document.documentElement.classList.add(AppTheme.DARK);
      localStorage.setItem(LocalStorageKey.THEME, AppTheme.DARK);
    } else {
      document.documentElement.classList.remove(AppTheme.DARK);
      localStorage.setItem(LocalStorageKey.THEME, AppTheme.LIGHT);
    }
  }, [theme]);

  // Ensure language matches localStorage
  React.useEffect(() => {
    const savedLang = localStorage.getItem(LocalStorageKey.LANGUAGE);
    if (savedLang && i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === AppTheme.DARK ? AppTheme.LIGHT : AppTheme.DARK));

  const toggleLanguage = () => {
    const newLang = i18n.language === AppLanguage.EN ? AppLanguage.ES : AppLanguage.EN;
    i18n.changeLanguage(newLang);
    localStorage.setItem(LocalStorageKey.LANGUAGE, newLang);
  };

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleGuest = () => {
    navigate('/workspace');
  };

  React.useEffect(() => {
    if (user && isAuthModalOpen) {
      setIsAuthModalOpen(false);
      navigate('/workspace');
    }
  }, [user, isAuthModalOpen, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative font-sans">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-xl font-bold tracking-tight">MPL ULA</span>
        </div>
        <div className="flex gap-2 md:gap-4 items-center">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors"
            title="Toggle Theme"
          >
            {theme === AppTheme.DARK ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted/50 text-sm font-medium transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden md:inline">{i18n.language.toUpperCase()}</span>
          </button>
          <div className="w-px h-6 bg-border mx-1"></div>
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/workspace')}
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all active:scale-95"
              >
                {t('landing.goToWorkspace')}
              </button>
              <button
                onClick={logout}
                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title={t('auth.logout')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => openAuth(AuthMode.LOGIN)}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('auth.signIn')}
              </button>
              <button
                onClick={() => openAuth(AuthMode.REGISTER)}
                className="px-3 md:px-4 py-2 text-sm font-medium bg-foreground/10 hover:bg-foreground/20 border border-foreground/10 rounded-lg transition-all active:scale-95"
              >
                {t('auth.createAccount')}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 text-sm font-medium mb-8"
            >
              <Zap className="w-4 h-4" />
              <span>{t('landing.badge')}</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground"
            >
              {t('landing.title1')} <br />
              {t('landing.title2')}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl"
            >
              {t('landing.description')}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <button
                  onClick={() => navigate('/workspace')}
                  className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_40px_8px_rgba(37,99,235,0.2)]"
                >
                  <span>{t('landing.goToWorkspace')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => openAuth(AuthMode.REGISTER)}
                    className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_40px_8px_rgba(37,99,235,0.2)]"
                  >
                    <span>{t('landing.startCoding')}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={handleGuest}
                    className="px-8 py-4 bg-muted/30 hover:bg-muted/50 border border-border text-foreground font-medium rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {t('auth.continueAsGuest')}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1, type: 'spring' as const, bounce: 0.4 }}
            className="relative lg:h-[500px]"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl" />
            <div className="relative h-full bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <div className="ml-4 px-2 py-1 bg-muted/50 rounded-md text-xs text-muted-foreground font-mono">
                  main.mpl
                </div>
              </div>
              <div className="flex-1 font-mono text-sm leading-loose">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-purple-400"
                >
                  <span className="text-pink-400">vector</span> v = [1, 2, 3];
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-purple-400"
                >
                  <span className="text-pink-400">matrix</span> m = {'{'} [1, 0], [0, 1] {'}'};
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                  className="text-gray-300 mt-4"
                >
                  display(v);
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5"
                >
                  <div className="text-gray-500 text-xs mb-2">Output</div>
                  <div className="text-green-400">[1, 2, 3]</div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features */}
      <section className="relative z-10 border-t border-border bg-muted/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-card/50 border border-border hover:bg-card transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                <Code2 className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('landing.liveExecution')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.liveExecutionDesc')}
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-card/50 border border-border hover:bg-card transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                <Cloud className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('landing.cloudSnippets')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.cloudSnippetsDesc')}
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-card/50 border border-border hover:bg-card transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6">
                <Terminal className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('landing.interactiveDocs')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('landing.interactiveDocsDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
};
