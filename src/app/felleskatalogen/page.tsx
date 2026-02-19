'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/AppSidebar';

interface Source {
  drugName: string;
  section: string;
  url: string;
  similarity: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

const STARTER_QUESTIONS = [
  'Hva er maksdosen av paracetamol hos voksne?',
  'Hvilke legemidler er trygge i svangerskapet?',
  'Bivirkninger ved metformin?',
  'Metformin ved nedsatt nyrefunksjon — når skal det seponeres?',
];

function SourceChip({ source }: { source: Source }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[var(--surface-overlay)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[rgba(94,106,210,0.08)] transition-colors border border-[var(--border-default)]"
    >
      <BookOpen className="w-3 h-3 shrink-0" />
      {source.drugName} — {source.section}
      <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
    </a>
  );
}

function AssistantMessage({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-[rgba(94,106,210,0.1)] flex items-center justify-center shrink-0 mt-0.5">
        <Bot className="w-4 h-4 text-[var(--accent-primary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="card-base p-4">
          <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          {msg.sources && msg.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--border-default)]">
              <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Kilder</p>
              <div className="flex flex-wrap gap-1.5">
                {msg.sources.map((s, i) => <SourceChip key={i} source={s} />)}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          {copied ? <><Check className="w-3 h-3 text-[#10B981]" /> Kopiert</> : <><Copy className="w-3 h-3" /> Kopier til journal</>}
        </button>
      </div>
    </div>
  );
}

export default function FelleskatalogenPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/felleskatalogen/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.answer, sources: data.sources }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.error || 'Noe gikk galt.' }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Nettverksfeil. Prøv igjen.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-primary)]">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="border-b border-[var(--border-default)] px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(94,106,210,0.08)] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[var(--text-primary)]">Felleskatalogen</h1>
              <p className="text-[11px] text-[var(--text-muted)]">AI-assistert legemiddeloppslagsverk for helsepersonell</p>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[rgba(94,106,210,0.08)] flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-7 h-7 text-[var(--accent-primary)]" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Legemiddelassistent</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Still spørsmål om legemidler — dosering, bivirkninger, interaksjoner og mer
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-overlay)] hover:border-[var(--accent-primary)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, i) =>
                msg.role === 'user' ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[80%] px-4 py-3 rounded-xl bg-[var(--accent-primary)] text-white text-sm">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <AssistantMessage key={i} msg={msg} />
                )
              )}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[rgba(94,106,210,0.1)] flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-[var(--accent-primary)]" />
                  </div>
                  <div className="card-base px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-[var(--border-default)] px-6 py-4 shrink-0">
          <div className="max-w-3xl mx-auto flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Still et spørsmål om et legemiddel..."
              rows={1}
              className="flex-1 bg-[var(--surface-overlay)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border border-[var(--border-default)] focus:outline-none focus:border-[var(--accent-primary)] resize-none"
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="h-11 w-11 rounded-xl bg-[var(--accent-primary)] hover:opacity-90 flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] text-center mt-2">
            Basert på Felleskatalogen · Alltid verifiser med gjeldende preparatomtale
          </p>
        </div>
      </main>
    </div>
  );
}
