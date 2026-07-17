import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { locales } from './locales';

const Terminal = ({ lang }) => {
    const t = locales[lang].terminal;
    const [history, setHistory] = useState([]);
    const [input, setInput] = useState('');
    const socketRef = useRef(null);
    const endRef = useRef(null);

    useEffect(() => {
        const socket = io('http://localhost:3000');
        socketRef.current = socket;

        socket.on('connect', () => {
            setHistory(prev => [...prev, { type: 'system', text: t.connected }]);
        });

        socket.on('output', (data) => {
            setHistory(prev => [...prev, { type: 'output', text: data }]);
        });

        socket.on('error_output', (data) => {
            setHistory(prev => [...prev, { type: 'error', text: data }]);
        });

        socket.on('closed', (msg) => {
            setHistory(prev => [...prev, { type: 'system', text: msg }]);
        });

        socket.on('disconnect', () => {
            setHistory(prev => [...prev, { type: 'system', text: t.disconnected }]);
        });

        return () => {
            socket.disconnect();
        };
    }, [t.connected, t.disconnected]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (input.trim()) {
                setHistory(prev => [...prev, { type: 'input', text: `> ${input}` }]);
                socketRef.current.emit('input', input);
                setInput('');
            }
        }
    };

    return (
        <div className="live-terminal">
            <div className="terminal-history">
                {history.map((line, i) => (
                    <div key={i} className={`term-line ${line.type}`}>
                        {line.text}
                    </div>
                ))}
                <div ref={endRef} />
            </div>
            <div className="terminal-input-row">
                <span className="prompt">&gt;</span>
                <input 
                    type="text" 
                    value={input} 
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t.placeholder}
                    autoFocus
                />
            </div>
        </div>
    );
};

export default Terminal;
