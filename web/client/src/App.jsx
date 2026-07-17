import React, { useState, useEffect, useRef, useMemo } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { mplLanguageDef, mplLanguageConfig } from './mplLanguage';
import Terminal from './Terminal';
import Documentation from './Documentation';
import { Plus, X, Play, FileCode2, BookOpen, Terminal as TermIcon, FileOutput, Download, Globe } from 'lucide-react';
import { locales } from './locales';

const API_URL = 'http://localhost:3000/api';

function App() {
  const monaco = useMonaco();

  const [lang, setLang] = useState('en');
  const t = locales[lang].app;

  const [tabs, setTabs] = useState([{
    id: '1',
    name: 'main.mpl',
    content: 'num1 = 5;\nnum2 = 10;\nresult = num1 * num2;\ndisplay(result);\n'
  }]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [leftPane, setLeftPane] = useState('editor');
  const [rightPane, setRightPane] = useState('output');

  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [samples, setSamples] = useState([]);

  const [dynamicVars, setDynamicVars] = useState(new Set());
  const providerRef = useRef(null);

  useEffect(() => {
    fetchSamples();
  }, []);

  useEffect(() => {
    if (monaco) {
      monaco.languages.register({ id: 'mpl' });
      monaco.languages.setMonarchTokensProvider('mpl', mplLanguageDef);
      monaco.languages.setLanguageConfiguration('mpl', mplLanguageConfig);
    }
  }, [monaco]);

  useEffect(() => {
    if (monaco) {
      if (providerRef.current) {
        providerRef.current.dispose();
      }
      providerRef.current = monaco.languages.registerCompletionItemProvider('mpl', {
        provideCompletionItems: (model, position) => {
          const suggestions = [
            ...mplLanguageDef.keywords.map(k => ({
              label: k,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: k
            })),
            {
              label: 'MATRIXLU',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'MATRIXLU(${1:matrix})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
            },
            {
              label: 'INTEGRAL',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'INTEGRAL(${1:func}, ${2:a}, ${3:b})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
            },
            ...Array.from(dynamicVars).map(v => ({
              label: v,
              kind: monaco.languages.CompletionItemKind.Variable,
              insertText: v
            }))
          ];
          return { suggestions };
        }
      });
    }
  }, [monaco, dynamicVars]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    if (activeTab) {
      const regex = /([a-zA-Z_]\w*)\s*=/g;
      const vars = new Set();
      let match;
      while ((match = regex.exec(activeTab.content)) !== null) {
        vars.add(match[1]);
      }

      let changed = false;
      if (vars.size !== dynamicVars.size) changed = true;
      else {
        for (let v of vars) if (!dynamicVars.has(v)) changed = true;
      }

      if (changed) setDynamicVars(vars);
    }
  }, [activeTab?.content]);

  const fetchSamples = async () => {
    try {
      const res = await fetch(`${API_URL}/samples`);
      if (res.ok) {
        const data = await res.json();
        setSamples(data.samples);
      }
    } catch (e) {
      console.error("Failed to fetch samples:", e);
    }
  };

  const loadSample = async (filename) => {
    if (!filename) return;
    try {
      const res = await fetch(`${API_URL}/samples/${filename}`);
      if (res.ok) {
        const data = await res.json();
        const newTab = {
          id: Date.now().toString(),
          name: filename,
          content: data.content
        };
        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
        setLeftPane('editor');
      }
    } catch (e) {
      console.error("Failed to load sample:", e);
    }
  };

  const createNewTab = () => {
    const newTab = {
      id: Date.now().toString(),
      name: `untitled-${tabs.length + 1}.mpl`,
      content: '\n'
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setLeftPane('editor');
  };

  const closeTab = (e, id) => {
    e.stopPropagation();
    const newTabs = tabs.filter(t => t.id !== id);
    if (newTabs.length === 0) {
      createNewTab();
    } else {
      if (activeTabId === id) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
      setTabs(newTabs);
    }
  };

  const handleEditorChange = (value) => {
    setTabs(tabs.map(tab => tab.id === activeTabId ? { ...tab, content: value } : tab));
  };

  const downloadScript = () => {
    if (!activeTab) return;
    let fileName = activeTab.name;
    if (fileName.startsWith('untitled')) {
      const newName = prompt("Enter file name:", fileName);
      if (newName) {
        fileName = newName.endsWith('.mpl') ? newName : `${newName}.mpl`;
        setTabs(tabs.map(tab => tab.id === activeTabId ? { ...tab, name: fileName } : tab));
      } else {
        return;
      }
    }
    const blob = new Blob([activeTab.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    setError('');
    setRightPane('output');

    try {
      const res = await fetch(`${API_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: activeTab.content })
      });
      const data = await res.json();

      if (data.error) setError(data.error);

      let out = "";
      if (data.stdout) out += data.stdout;
      if (data.stderr) out += `\n[STDERR]:\n${data.stderr}`;
      setOutput(out);

    } catch (e) {
      setError(t.backendError);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">M</div>
          <h1>{t.title}</h1>
        </div>
        <div className="controls">
          <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'es' : 'en')} title="Toggle Language">
            <Globe size={18} /> {lang.toUpperCase()}
          </button>
          <select onChange={(e) => { loadSample(e.target.value); e.target.value = ''; }}>
            <option value="">{t.loadSample}</option>
            {samples.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="btn-run" onClick={handleRun} disabled={isRunning || !activeTab.content.trim()}>
            {isRunning ? <div className="spinner"></div> : <Play size={16} />}
            {t.runCode}
          </button>
        </div>
      </header>

      <main className="workspace">
        <div className="pane left-pane">
          <div className="pane-tabs">
            <button className={`tab-btn ${leftPane === 'editor' ? 'active' : ''}`} onClick={() => setLeftPane('editor')}>
              <FileCode2 size={16} /> {t.editor}
            </button>
            <button className={`tab-btn ${leftPane === 'docs' ? 'active' : ''}`} onClick={() => setLeftPane('docs')}>
              <BookOpen size={16} /> {t.documentation}
            </button>
          </div>

          <div className="pane-content">
            {leftPane === 'editor' && (
              <div className="editor-wrapper">
                <div className="editor-file-tabs">
                  {tabs.map(tab => (
                    <div
                      key={tab.id}
                      className={`file-tab ${activeTabId === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTabId(tab.id)}
                    >
                      {tab.name}
                      <button className="close-tab" onClick={(e) => closeTab(e, tab.id)}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button className="add-tab" onClick={createNewTab}><Plus size={16} /></button>
                  <button className="download-tab" onClick={downloadScript} title={t.download} style={{marginLeft: 'auto', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 1rem'}}>
                    <Download size={16} />
                  </button>
                </div>
                <div className="editor-container">
                  <Editor
                    height="100%"
                    language="mpl"
                    theme="vs-dark"
                    value={activeTab.content}
                    onChange={handleEditorChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: 'Fira Code',
                      padding: { top: 16 },
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                    }}
                  />
                </div>
              </div>
            )}

            {leftPane === 'docs' && <Documentation lang={lang} />}
          </div>
        </div>

        <div className="pane right-pane">
          <div className="pane-tabs">
            <button className={`tab-btn ${rightPane === 'output' ? 'active' : ''}`} onClick={() => setRightPane('output')}>
              <FileOutput size={16} /> {t.output}
            </button>
            <button className={`tab-btn ${rightPane === 'live' ? 'active' : ''}`} onClick={() => setRightPane('live')}>
              <TermIcon size={16} /> {t.liveRepl}
            </button>
          </div>

          <div className="pane-content">
            {rightPane === 'output' && (
              <div className="terminal-output">
                {error && <div className="error">{error}</div>}
                {output ? (
                  <pre>{output}</pre>
                ) : (
                  !error && <span style={{ color: '#475569' }}>{t.outputPlaceholder}</span>
                )}
              </div>
            )}

            {rightPane === 'live' && <Terminal lang={lang} />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
