import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { FolderOpen, X, FileCode2, Trash2, Loader2, Clock } from 'lucide-react';

interface Snippet {
  id: string;
  title: string;
  isPublic: boolean;
  updatedAt: string;
}

interface MySnippetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSnippet: (title: string, content: string) => void;
}

export const MySnippetsModal: React.FC<MySnippetsModalProps> = ({ isOpen, onClose, onLoadSnippet }) => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    if (isOpen && token) {
      fetchSnippets();
    }
  }, [isOpen, token]);

  const fetchSnippets = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/snippets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch snippets');
      const data = await res.json();
      setSnippets(data.snippets);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const loadSnippet = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/snippets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load snippet');
      const data = await res.json();
      onLoadSnippet(title, data.snippet.content);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const deleteSnippet = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this snippet?')) return;

    try {
      const res = await fetch(`/api/snippets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete snippet');
      setSnippets(snippets.filter(s => s.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
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
            className="relative z-10 w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col h-[80vh] max-h-[600px]"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2 shrink-0">
              <FolderOpen className="w-5 h-5 text-blue-400" />
              My Cloud Snippets
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center shrink-0">
                {error}
              </div>
            )}

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                </div>
              ) : snippets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <FileCode2 className="w-12 h-12 mb-3 opacity-50" />
                  <p>You haven't saved any snippets yet.</p>
                </div>
              ) : (
                snippets.map(snippet => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={snippet.id}
                    onClick={() => loadSnippet(snippet.id, snippet.title)}
                    className="group bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 rounded-xl p-4 cursor-pointer transition-all duration-200 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-white font-medium mb-1 group-hover:text-blue-400 transition-colors">
                        {snippet.title}
                      </h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(snippet.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => deleteSnippet(e, snippet.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      title="Delete Snippet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
