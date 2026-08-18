/**
 * @file Terminal.tsx
 * @description Interactive WebSocket REPL terminal component.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTerminal } from '@/hooks/useTerminal';
import { Send, TerminalSquare, Trash2 } from 'lucide-react';

/**
 * Terminal Component
 */
const Terminal: React.FC = () => {
    const { t } = useTranslation();
    const { history, isConnected, bottomRef, sendInput, clearTerminal } = useTerminal();
    const [input, setInput] = useState('');

    /**
     * Handles the submission of the input field.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendInput(input);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full bg-card/30 border border-border rounded-lg overflow-hidden shadow-inner">
            {/* Header */}
            <div className="h-10 border-b border-border bg-muted/30 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                    <TerminalSquare className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">MPL Live REPL</span>
                    <span className={`ml-2 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs text-muted-foreground ml-1">
                        {isConnected ? t('terminal.connected') : t('terminal.disconnected')}
                    </span>
                </div>
                <button 
                    onClick={clearTerminal} 
                    className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                    title="Clear Terminal"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* History output */}
            <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                {history.map((line, i) => (
                    <div key={i} className={`mb-1 ${line.startsWith('>') ? 'text-primary' : line.startsWith('[Error]') ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {line}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <form onSubmit={handleSubmit} className="border-t border-border bg-muted/10 p-2 flex items-center gap-2">
                <span className="text-primary font-mono ml-2">{'>'}</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={!isConnected}
                    placeholder={t('terminal.placeholder')}
                    className="flex-1 bg-transparent border-none outline-none text-sm font-mono placeholder:text-muted-foreground/50 px-2"
                    autoComplete="off"
                    spellCheck="false"
                />
                <button 
                    type="submit" 
                    disabled={!isConnected || !input.trim()}
                    className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors disabled:opacity-50"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};

export default Terminal;
