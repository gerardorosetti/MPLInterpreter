/**
 * @file App.tsx
 * @description Main application entry point for the MPL Interactive IDE.
 * It manages the split layout, code editor, and tabbed panes (Output, Documentation, Live REPL).
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Editor, { useMonaco } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, FileCode2, BookOpen, Terminal as TermIcon, FileOutput, Download, Globe, Sun, Moon, X } from 'lucide-react';

import { PaneType, AppLanguage } from '@/constants/enums';
import { useCodeExecution } from '@/hooks/useCodeExecution';
import { ApiService } from '@/services/api';
import Terminal from '@/components/Terminal';
import Documentation from '@/components/Documentation';

/**
 * Main App Component
 */
const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const monaco = useMonaco();
  
  // Custom Hooks
  const { output, isLoading, execute, setOutput } = useCodeExecution();
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  // Files State
  const [files, setFiles] = useState<{id: string, name: string, content: string}[]>([
    { id: '1', name: 'main.mpl', content: 'v = [1, 2, 3];\ndisplay(v);\n' }
  ]);
  const [activeFileId, setActiveFileId] = useState<string>('1');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);

  const [activePane, setActivePane] = useState<PaneType>(PaneType.OUTPUT);
  const [samples, setSamples] = useState<string[]>([]);
  const [isSamplesOpen, setIsSamplesOpen] = useState(false);

  // Fetch samples on mount
  useEffect(() => {
    ApiService.getSamples().then(setSamples);
  }, []);

  // Configure Monaco Editor for MPL language
  useEffect(() => {
    if (monaco) {
      monaco.languages.register({ id: 'mpl' });
      monaco.languages.setMonarchTokensProvider('mpl', {
        tokenizer: {
          root: [
            [/\b(print|tridiagonal|matrixLu|realEigenvalues|bisectionRoot|integral|number|vector|matrix)\b/, "keyword"],
            [/[a-zA-Z_]\w*/, "identifier"],
            [/[0-9]+(\.[0-9]+)?/, "number"],
            [/[\{\}\[\]\(\)]/, "delimiter"],
            [/[+\-*\/^=,]/, "operator"],
          ]
        }
      });
      monaco.languages.registerCompletionItemProvider('mpl', {
        provideCompletionItems: () => {
          const suggestions = [
            { label: 'display', kind: monaco.languages.CompletionItemKind.Function, insertText: 'display(${1:value});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
            { label: 'number', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'number ' },
            { label: 'vector', kind: monaco.languages.CompletionItemKind.Keyword, insertText: '${1:name} = [${2:1, 2, 3}];' },
            { label: 'matrix', kind: monaco.languages.CompletionItemKind.Keyword, insertText: '${1:name} = { [${2:1, 0}], [${3:0, 1}] };' },
          ];
          return { suggestions } as any;
        }
      });
      monaco.editor.defineTheme('mpl-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: 'C678DD', fontStyle: 'bold' },
          { token: 'identifier', foreground: 'E5C07B' },
          { token: 'number', foreground: 'D19A66' },
          { token: 'operator', foreground: '56B6C2' },
          { token: 'delimiter', foreground: 'ABB2BF' }
        ],
        colors: {
          'editor.background': '#1e1e1e',
          'editor.lineHighlightBackground': '#2c313a',
        }
      });
    }
  }, [monaco]);

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const updateCode = (newCode: string) => {
    setFiles(files.map(f => f.id === activeFileId ? { ...f, content: newCode } : f));
  };

  const runCode = () => execute(activeFile.content);

  const loadSample = async (filename: string) => {
    setIsSamplesOpen(false);
    const content = await ApiService.getSampleContent(filename);
    const newFile = { id: Date.now().toString(), name: filename, content };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setOutput('');
    setActivePane(PaneType.OUTPUT);
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

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (files.length === 1) return; // Prevent closing last tab
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id) setActiveFileId(newFiles[0].id);
  };

  const renameTab = (id: string, newName: string) => {
    if (!newName.trim()) return;
    setFiles(files.map(f => f.id === id ? { ...f, name: newName.trim() } : f));
    setEditingFileId(null);
  };

  const addNewTab = () => {
    const newFile = { id: Date.now().toString(), name: `untitled-${files.length}.mpl`, content: '' };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === AppLanguage.EN ? AppLanguage.ES : AppLanguage.EN;
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      
      {/* HEADER */}
      <header className="relative z-10 h-16 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <TermIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {t('app.title')}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors" title="Toggle Theme">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted/50 text-sm font-medium transition-colors">
            <Globe className="w-4 h-4" />
            {i18n.language.toUpperCase()}
          </button>

          <div className="relative">
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

          <button onClick={runCode} disabled={isLoading} className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm font-semibold transition-all active:scale-95 shadow-sm">
            {isLoading ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Play className="w-4 h-4" />}
            {t('app.runCode')}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT - Responsive Layout */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANE - Editor */}
        <div className="flex-1 flex flex-col h-1/2 md:h-auto md:border-r border-border border-b md:border-b-0 min-h-0">
          
          {/* File Tabs */}
          <div className="h-10 border-b border-border bg-muted/20 flex items-center px-2 shrink-0 overflow-x-auto overflow-y-hidden gap-1">
            {files.map(file => (
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
                    onKeyDown={(e) => e.key === 'Enter' && renameTab(file.id, e.currentTarget.value)}
                    className="bg-transparent border-none outline-none w-24 text-sm text-foreground"
                  />
                ) : (
                  <span onDoubleClick={() => setEditingFileId(file.id)} className="select-none min-w-[3rem]">
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
            <button onClick={addNewTab} className="p-1.5 ml-1 text-muted-foreground hover:bg-muted/50 rounded-md transition-colors" title="New File">
              <Plus className="w-4 h-4" />
            </button>
            
            <div className="flex-1"></div>
            
            <button onClick={downloadScript} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors mr-2 shrink-0" title={t('app.download')}>
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
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                lineHeight: 24,
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "all"
              }}
            />
          </div>
        </div>

        {/* RIGHT PANE - Tabs & Content */}
        <div className="flex-1 flex flex-col bg-card/20 h-1/2 md:h-auto min-h-0">
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
    </div>
  );
}

export default App;
