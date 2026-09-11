import React, { useState, useRef, useEffect } from 'react';
import { aiAssistantService } from '../services/aiAssistantService';
import { FlipBookDocument } from '../types';
import { AiQueryMessage, PageAiSummary } from '../types/saas';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  HelpCircle,
  X,
  Loader2,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: FlipBookDocument;
  currentPageNumber: number;
  onNavigateToPage: (pageNumber: number) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  document,
  currentPageNumber,
  onNavigateToPage,
}) => {
  const [messages, setMessages] = useState<AiQueryMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Bonjour ! Je suis l'assistant intelligent de ce document "${document.title}". Vous consultez actuellement la Page ${currentPageNumber}. Que souhaitez-vous savoir ?`,
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageSummary, setPageSummary] = useState<PageAiSummary | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pageSummary]);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const q = questionText || inputText.trim();
    if (!q || isLoading) return;

    const userMsg: AiQueryMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const answer = await aiAssistantService.askQuestion(q, document, currentPageNumber);
      const botMsg: AiQueryMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: `Désolé, une erreur temporaire est survenue. N'hésitez pas à reformuler votre question.`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarizePage = async () => {
    setIsSummarizing(true);
    const activePage = document.pages.find((p) => p.pageNumber === currentPageNumber);
    if (!activePage) {
      setIsSummarizing(false);
      return;
    }

    try {
      const summary = await aiAssistantService.summarizePage(activePage, document.title);
      setPageSummary(summary);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl h-[600px] flex flex-col justify-between shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">Assistant IA du Document</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Page active : <span className="text-white font-semibold">Page {currentPageNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSummarizePage}
              disabled={isSummarizing}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              {isSummarizing ? (
                <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
              ) : (
                <FileText className="w-3 h-3 text-indigo-400" />
              )}
              Résumer la Page
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {pageSummary && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 to-zinc-950 border border-indigo-500/30 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Synthèse de la Page {pageSummary.pageNumber}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Lecture ~{pageSummary.readingTimeMinutes} min
                </span>
              </div>

              <ul className="space-y-1 text-zinc-300 text-[11px]">
                {pageSummary.keyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-2xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-zinc-400 text-xs p-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>L'IA analyse le catalogue...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-zinc-950/60 border-t border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto">
          {[
            'Quels sont les tarifs ?',
            'Comment réserver ?',
            'Résume les points forts',
            'Coordonnées de contact ?',
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="px-2.5 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-[11px] whitespace-nowrap transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Posez une question sur le document..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all shadow-md shadow-indigo-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
