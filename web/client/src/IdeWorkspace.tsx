/**
 * @file IdeWorkspace.tsx
 * @description Main workspace for the MPL Interactive IDE.
 * It manages the split layout, code editor, and tabbed panes (Output, Documentation, Live REPL).
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Editor, { Monaco } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Play,
  FileCode2,
  Code2,
  BookOpen,
  Terminal as TermIcon,
  FileOutput,
  Download,
  Menu,
  Sun,
  Moon,
  Save,
  Upload,
  LogOut,
  Cloud,
  Home,
  Globe,
  X,
} from 'lucide-react';

import { PaneType, AppLanguage, AuthMode, LocalStorageKey } from '@/constants/enums';
import { useCodeExecution } from '@/hooks/useCodeExecution';
import { ApiService } from '@/services/api';
import Terminal from '@/components/Terminal';
import Documentation from '@/components/Documentation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { SaveSnippetModal } from '@/components/auth/SaveSnippetModal';
import { MySnippetsModal } from '@/components/auth/MySnippetsModal';

/**
 * Main App Component
 */
const IdeWorkspace: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Custom Hooks
  const { output, isLoading, execute, setOutput } = useCodeExecution();

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Files State
  const [files, setFiles] = useState<{ id: string; name: string; content: string }[]>([
    { id: '1', name: 'main.mpl', content: 'v = [1, 2, 3];\ndisplay(v);\n' },
  ]);
  const [activeFileId, setActiveFileId] = useState<string>('1');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);

  const [activePane, setActivePane] = useState<PaneType>(PaneType.OUTPUT);
  const [samples, setSamples] = useState<string[]>([]);
  const [isSamplesOpen, setIsSamplesOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'editor' | 'tools'>('editor');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.LOGIN);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isMySnippetsOpen, setIsMySnippetsOpen] = useState(false);

  const [isSamplesAccordionOpen, setIsSamplesAccordionOpen] = useState(false);

  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const samplesMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // User Menu
      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }

      // Samples Menu
      if (
        isSamplesOpen &&
        samplesMenuRef.current &&
        !samplesMenuRef.current.contains(event.target as Node)
      ) {
        setIsSamplesOpen(false);
      }

      // Mobile Menu is now full screen overlay, clicking the backdrop closes it natively,
      // so we don't need to listen to document mousedown for mobile menu anymore.
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, isSamplesOpen]);

  // Fetch samples on mount
  useEffect(() => {
    ApiService.getSamples().then(setSamples);
  }, []);

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.languages.register({ id: 'mpl' });
    monaco.languages.setMonarchTokensProvider('mpl', {
      tokenizer: {
        root: [
          [
            /\b(print|tridiagonal|matrixLu|realEigenvalues|bisectionRoot|integral|number|vector|matrix)\b/,
            'keyword',
          ],
          [/[a-zA-Z_]\w*/, 'identifier'],
          [/[0-9]+(\.[0-9]+)?/, 'number'],
          [/[\{\}\[\]\(\)]/, 'delimiter'],
          [/[+\-*\/^=,]/, 'operator'],
        ],
      },
    });
    monaco.languages.registerCompletionItemProvider('mpl', {
      provideCompletionItems: () => {
        const suggestions = [
          {
            label: 'display',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'display(${1:value});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          },
          {
            label: 'number',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'number ',
          },
          {
            label: 'vector',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: '${1:name} = [${2:1, 2, 3}];',
          },
          {
            label: 'matrix',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: '${1:name} = { [${2:1, 0}], [${3:0, 1}] };',
          },
        ];
        return { suggestions };
      },
    });
    monaco.editor.defineTheme('mpl-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'C678DD', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'E5C07B' },
        { token: 'number', foreground: 'D19A66' },
        { token: 'operator', foreground: '56B6C2' },
        { token: 'delimiter', foreground: 'ABB2BF' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.lineHighlightBackground': '#2c313a',
      },
    });
  };

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const updateCode = (newCode: string) => {
    setFiles(files.map((f) => (f.id === activeFileId ? { ...f, content: newCode } : f)));
  };

  const runCode = () => execute(activeFile.content);

  const loadSample = async (filename: string) => {
    setIsSamplesOpen(false);
    const content = await ApiService.getSampleContent(filename);
    const newFile = { id: Date.now().toString(), name: filename, content };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setOutput('');
    setActivePane(PaneType.OUTPUT);
    setMobileView('tools');
    setIsMobileMenuOpen(false);
  };

  const downloadScript = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToCloud = () => {
    setIsSaveModalOpen(true);
  };

  const handleLoadCloudSnippet = (title: string, content: string) => {
    const newFile = { id: Date.now().toString(), name: `${title}.mpl`, content };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newFile = { id: Date.now().toString(), name: file.name, content };
      setFiles((prev) => [...prev, newFile]);
      setActiveFileId(newFile.id);
    };
    reader.readAsText(file);
    // Reset input so the same file can be loaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (files.length === 1) return; // Prevent closing last tab
    const newFiles = files.filter((f) => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id) setActiveFileId(newFiles[0].id);
  };

  const renameTab = (id: string, newName: string) => {
    if (!newName.trim()) return;
    setFiles(files.map((f) => (f.id === id ? { ...f, name: newName.trim() } : f)));
    setEditingFileId(null);
  };

  const addNewTab = () => {
    const newFile = {
      id: Date.now().toString(),
      name: `untitled-${files.length}.mpl`,
      content: '',
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === AppLanguage.EN ? AppLanguage.ES : AppLanguage.EN;
    i18n.changeLanguage(newLang);
    localStorage.setItem(LocalStorageKey.LANGUAGE, newLang);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      {/* HEADER */}
      <header className="relative z-10 h-16 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4 hover:opacity-80 transition-opacity">
            <Code2 className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold text-foreground">MPL</h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Workspace
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => navigate('/')}
            className="hidden md:flex p-2 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors"
            title={t('app.home')}
          >
            <Home className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTheme}
            className="hidden md:flex p-2 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleLanguage}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted/50 text-sm font-medium transition-colors"
          >
            <Globe className="w-4 h-4" />
            {i18n.language.toUpperCase()}
          </button>

          <div className="relative hidden md:block" ref={samplesMenuRef}>
            <button
              onClick={() => setIsSamplesOpen(!isSamplesOpen)}
              className="flex items-center gap-2 px-4 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md text-sm font-medium transition-colors"
            >
              <FileCode2 className="w-4 h-4" />
              {t('app.loadSample')}
            </button>

            <AnimatePresence>
              {isSamplesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-64 max-h-96 bg-popover border border-border rounded-lg shadow-xl overflow-y-auto z-50"
                >
                  {samples.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadSample(s)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <FileCode2 className="w-4 h-4 text-muted-foreground" />
                      {s.replace('.mpl', '')}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Auth Section */}
          <div className="hidden md:flex items-center gap-2 border-l border-border pl-4 ml-2">
            {!user ? (
              <>
                <button
                  onClick={() => {
                    setAuthMode(AuthMode.LOGIN);
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-sm font-medium hover:bg-muted/50 rounded-md transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setAuthMode(AuthMode.REGISTER);
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium hover:ring-2 hover:ring-blue-400 transition-all"
                >
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase()}
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-border/50 bg-muted/20">
                        <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="py-2 flex flex-col items-center">
                        <button
                          onClick={() => {
                            navigate('/');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2 text-foreground"
                        >
                          <Home className="w-4 h-4 text-muted-foreground" />
                          {t('app.home')}
                        </button>
                        <button
                          onClick={() => {
                            setIsMySnippetsOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2 text-foreground"
                        >
                          <FileCode2 className="w-4 h-4 text-muted-foreground" />
                          {t('snippets.mySnippets')}
                        </button>
                        <button
                          onClick={() => {
                            handleSaveToCloud();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2 text-foreground"
                        >
                          <Cloud className="w-4 h-4 text-muted-foreground" />
                          {t('snippets.saveToCloud')}
                        </button>
                        <button
                          onClick={() => {
                            downloadScript();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2 text-foreground"
                        >
                          <Download className="w-4 h-4 text-muted-foreground" />
                          {t('app.download')}
                        </button>
                        <div className="w-full h-px bg-border my-1"></div>
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-sm hover:bg-red-500/10 text-red-500 transition-colors flex items-center justify-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('auth.logout')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-border mx-2 hidden md:block"></div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".mpl,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 hover:bg-muted/50 text-muted-foreground rounded-md text-sm font-medium transition-colors"
            title="Load from local file"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden lg:inline">{t('app.load')}</span>
          </button>

          <button
            onClick={handleSaveToCloud}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md text-sm font-medium transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span className="hidden lg:inline">Save</span>
          </button>

          <button
            onClick={() => {
              runCode();
              setMobileView('tools');
            }}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm font-semibold transition-all active:scale-95 shadow-sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {t('app.runCode')}
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Slide-Over Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-card border-l border-border shadow-2xl z-50 flex flex-col md:hidden overflow-y-auto"
            >
              {/* Header & Close */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/10">
                <span className="font-bold tracking-tight text-lg">{t('app.menu')}</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md bg-muted/50 text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Area */}
              <div className="p-4 border-b border-border bg-card">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-inner">
                      {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{user.name || 'User'}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                      <TermIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('auth.continueAsGuest', 'Guest Mode')}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col gap-6">
                {/* General Settings */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {t('app.general')}
                  </span>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
                    <div className="flex items-center gap-3">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t('app.home')}</span>
                    </div>
                    <button
                      onClick={() => navigate('/')}
                      className="px-3 py-1 text-xs font-medium bg-muted/50 rounded-md"
                    >
                      {t('app.go')}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? (
                        <Moon className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Sun className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">{t('app.theme')}</span>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="px-3 py-1 text-xs font-medium bg-muted/50 rounded-md"
                    >
                      {t('app.toggle')}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t('app.language')}</span>
                    </div>
                    <button
                      onClick={toggleLanguage}
                      className="px-3 py-1 text-xs font-medium bg-muted/50 rounded-md uppercase"
                    >
                      {i18n.language}
                    </button>
                  </div>
                </div>

                {/* User Actions */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {t('app.actions')}
                  </span>
                  {user ? (
                    <>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsMySnippetsOpen(true);
                        }}
                        className="flex items-center gap-3 w-full p-3 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border/50 text-left"
                      >
                        <FileCode2 className="w-4 h-4 text-blue-400" />
                        <span className="flex-1">{t('snippets.mySnippets')}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleSaveToCloud();
                        }}
                        className="flex items-center gap-3 w-full p-3 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border/50 text-left"
                      >
                        <Cloud className="w-4 h-4 text-purple-400" />
                        <span className="flex-1">{t('snippets.saveToCloud')}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          downloadScript();
                        }}
                        className="flex items-center gap-3 w-full p-3 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border/50 text-left"
                      >
                        <Download className="w-4 h-4 text-green-400" />
                        <span className="flex-1">{t('app.download')}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-3 w-full p-3 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20 text-left mt-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="flex-1">{t('auth.logout')}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setAuthMode(AuthMode.LOGIN);
                          setIsAuthModalOpen(true);
                        }}
                        className="flex items-center gap-3 w-full p-3 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border/50 text-left"
                      >
                        <LogOut className="w-4 h-4 text-blue-400 rotate-180" />
                        <span className="flex-1">{t('auth.signIn')}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setAuthMode(AuthMode.REGISTER);
                          setIsAuthModalOpen(true);
                        }}
                        className="flex items-center gap-3 w-full p-3 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border/50 text-left"
                      >
                        <Plus className="w-4 h-4 text-purple-400" />
                        <span className="flex-1">{t('auth.createAccount')}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          downloadScript();
                        }}
                        className="flex items-center gap-3 w-full p-3 text-sm text-foreground hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border/50 text-left"
                      >
                        <Download className="w-4 h-4 text-green-400" />
                        <span className="flex-1">{t('app.download')}</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Samples Accordion */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {t('app.resources')}
                  </span>
                  <div className="flex flex-col rounded-lg bg-muted/10 border border-border overflow-hidden">
                    <button
                      onClick={() => setIsSamplesAccordionOpen(!isSamplesAccordionOpen)}
                      className="flex items-center justify-between p-3 text-sm font-medium hover:bg-muted/30 transition-colors w-full text-left"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-yellow-500" />
                        {t('app.samples')}
                      </div>
                      <Plus
                        className={`w-4 h-4 transition-transform duration-300 ${isSamplesAccordionOpen ? 'rotate-45' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isSamplesAccordionOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-1 p-2 bg-black/10">
                            {samples.map((s, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  loadSample(s);
                                  setIsMobileMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-colors"
                              >
                                {s.replace('.mpl', '')}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />

      <SaveSnippetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentContent={activeFile.content}
        onDownload={() => {
          downloadScript();
          setIsSaveModalOpen(false);
        }}
        onLogin={() => {
          setIsSaveModalOpen(false);
          setAuthMode(AuthMode.LOGIN);
          setIsAuthModalOpen(true);
        }}
      />

      <MySnippetsModal
        isOpen={isMySnippetsOpen}
        onClose={() => setIsMySnippetsOpen(false)}
        onLoadSnippet={handleLoadCloudSnippet}
      />

      {/* MAIN CONTENT - Responsive Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANE - Editor */}
        <div
          className={`flex-1 flex-col h-full md:border-r border-border min-h-0 ${mobileView === 'editor' ? 'flex' : 'hidden md:flex'}`}
        >
          {/* File Tabs */}
          <div className="h-10 border-b border-border bg-muted/20 flex items-center px-2 shrink-0 overflow-x-auto overflow-y-hidden gap-1">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`group flex items-center h-full px-3 text-sm cursor-pointer border-r border-border/50 transition-colors ${activeFileId === file.id ? 'bg-background border-b-2 border-b-primary text-foreground' : 'text-muted-foreground hover:bg-muted/40'}`}
              >
                <FileCode2 className="w-3.5 h-3.5 mr-2" />
                {editingFileId === file.id ? (
                  <input
                    autoFocus
                    defaultValue={file.name}
                    onBlur={(e) => renameTab(file.id, e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && renameTab(file.id, e.currentTarget.value)
                    }
                    className="bg-transparent border-none outline-none w-24 text-sm text-foreground"
                  />
                ) : (
                  <span
                    onDoubleClick={() => setEditingFileId(file.id)}
                    className="select-none min-w-[3rem]"
                  >
                    {file.name}
                  </span>
                )}
                <button
                  onClick={(e) => closeTab(e, file.id)}
                  className={`ml-2 p-0.5 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/20 transition-opacity ${files.length === 1 ? 'hidden' : ''}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={addNewTab}
              className="p-1.5 ml-1 text-muted-foreground hover:bg-muted/50 rounded-md transition-colors"
              title="New File"
            >
              <Plus className="w-4 h-4" />
            </button>

            <div className="flex-1"></div>

            <button
              onClick={downloadScript}
              className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors mr-2 shrink-0"
              title={t('app.download')}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="mpl"
              theme={theme === 'dark' ? 'vs-dark' : 'vs'}
              value={activeFile.content}
              onChange={(value) => updateCode(value || '')}
              beforeMount={handleEditorWillMount}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                lineHeight: 24,
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                renderLineHighlight: 'all',
              }}
            />
          </div>
        </div>

        {/* RIGHT PANE - Tabs & Content */}
        <div
          className={`flex-1 flex-col bg-card/20 h-full min-h-0 ${mobileView === 'tools' ? 'flex' : 'hidden md:flex'}`}
        >
          {/* TABS */}
          <div className="h-10 border-b border-border bg-muted/20 flex px-2 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActivePane(PaneType.OUTPUT)}
              className={`flex items-center gap-2 px-4 border-b-2 transition-colors shrink-0 ${activePane === PaneType.OUTPUT ? 'border-primary text-foreground bg-muted/10' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
            >
              <FileOutput className="w-4 h-4" />
              <span className="text-sm font-medium">{t('app.output')}</span>
            </button>
            <button
              onClick={() => setActivePane(PaneType.LIVE)}
              className={`flex items-center gap-2 px-4 border-b-2 transition-colors shrink-0 ${activePane === PaneType.LIVE ? 'border-primary text-foreground bg-muted/10' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
            >
              <TermIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{t('app.liveRepl')}</span>
            </button>
            <button
              onClick={() => setActivePane(PaneType.DOCS)}
              className={`flex items-center gap-2 px-4 border-b-2 transition-colors shrink-0 ${activePane === PaneType.DOCS ? 'border-primary text-foreground bg-muted/10' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'}`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">{t('app.documentation')}</span>
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="flex-1 overflow-auto p-4 relative">
            <AnimatePresence mode="wait">
              {activePane === PaneType.OUTPUT && (
                <motion.div
                  key="output"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  <pre className="font-mono text-[14px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {output || t('app.outputPlaceholder')}
                  </pre>
                </motion.div>
              )}

              {activePane === PaneType.LIVE && (
                <motion.div
                  key="live"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  <Terminal />
                </motion.div>
              )}

              {activePane === PaneType.DOCS && (
                <motion.div
                  key="docs"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  <Documentation />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden flex h-14 border-t border-border shrink-0 bg-muted/20">
        <button
          onClick={() => setMobileView('editor')}
          className={`flex-1 flex items-center justify-center gap-2 transition-colors ${mobileView === 'editor' ? 'text-primary border-t-2 border-primary bg-muted/10' : 'text-muted-foreground hover:bg-muted/40'}`}
        >
          <FileCode2 className="w-4 h-4" />
          <span className="text-sm font-medium">{t('app.editor')}</span>
        </button>
        <button
          onClick={() => setMobileView('tools')}
          className={`flex-1 flex items-center justify-center gap-2 transition-colors ${mobileView === 'tools' ? 'text-primary border-t-2 border-primary bg-muted/10' : 'text-muted-foreground hover:bg-muted/40'}`}
        >
          <TermIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{t('app.tools')}</span>
        </button>
      </div>
    </div>
  );
};

export default IdeWorkspace;
