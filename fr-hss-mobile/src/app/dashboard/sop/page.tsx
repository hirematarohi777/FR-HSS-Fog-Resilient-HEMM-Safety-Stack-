'use client';

import { useState, useRef, useEffect } from 'react';
import { useDemoState } from '@/lib/demo-context';
import { Bot, Send, AlertTriangle, BookOpen } from 'lucide-react';
import { SOPEntry } from '@/lib/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isUnapproved?: boolean;
  isUnavailable?: boolean;
}

function findBestMatch(query: string, entries: SOPEntry[]): SOPEntry | null {
  const q = query.toLowerCase();
  // Keyword matching
  const keywords: [string[], string][] = [
    [['fog', 'visibility', 'foggy', 'mist', 'low vis'], 'sop-1'],
    [['speed', 'limit', 'km/h', 'kmh', 'fast', 'slow'], 'sop-2'],
    [['collision', 'warning', 'crash', 'convergence', 'conflict', 'alert', 'impact'], 'sop-3'],
    [['ebs', 'brake', 'braking', 'emergency brake', 'brakes'], 'sop-4'],
    [['ppe', 'gear', 'equipment', 'vest', 'helmet', 'boots', 'protection', 'safety equipment'], 'sop-5'],
  ];

  for (const [kws, id] of keywords) {
    if (kws.some(kw => q.includes(kw))) {
      return entries.find(e => e.id === id) || null;
    }
  }
  return null;
}

const QUICK_QUESTIONS = [
  'What is the procedure for fog operations?',
  'How do I respond to a collision warning?',
  'What PPE is required for HEMM operation?',
];

function AssistantBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-[#1F2937] border border-[#374151] flex items-center justify-center flex-shrink-0">
        <Bot size={16} className="text-[#06B6D4]" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        {msg.isUnapproved && (
          <div className="bg-[#78350F] border border-[#F97316]/30 rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle size={12} className="text-[#F97316]" />
              <span className="text-[10px] font-bold text-[#F97316] uppercase">Unapproved Demonstration Content</span>
            </div>
            <p className="text-[10px] text-[#FDE68A]/80">
              This is sample text, not an approved NMDC procedure. For actual operations, contact your Safety Administrator.
            </p>
          </div>
        )}
        {msg.isUnavailable && (
          <div className="bg-[#1F2937] border border-[#374151] rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <BookOpen size={12} className="text-[#9CA3AF]" />
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">No Approved SOP Available</span>
            </div>
          </div>
        )}
        <div className="bg-[#1F2937] border border-[#374151] rounded-2xl rounded-tl-sm px-4 py-3">
          <p className="text-sm text-[#E5E7EB] leading-relaxed whitespace-pre-line">{msg.text}</p>
        </div>
      </div>
    </div>
  );
}

function UserBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex justify-end">
      <div className="bg-[#06B6D4] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
        <p className="text-sm text-white">{msg.text}</p>
      </div>
    </div>
  );
}

export default function SopPage() {
  const { state } = useDemoState();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Welcome to the SOP Assistant. I can answer questions about standard operating procedures for HEMM operations. Note: this is a demonstration system with limited pre-loaded content.',
    },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (query: string) => {
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query.trim(),
    };

    const match = findBestMatch(query, state.sopEntries);
    let assistantMsg: ChatMessage;

    if (match) {
      if (match.answer === null) {
        // Unavailable
        assistantMsg = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: match.fallbackMessage,
          isUnavailable: true,
        };
      } else {
        // Has answer — mark as unapproved
        assistantMsg = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: match.answer,
          isUnapproved: true,
        };
      }
    } else {
      assistantMsg = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: "I don't have information about that topic. This demonstration system has limited pre-loaded content. Contact your Safety Administrator for operational guidance.\n\n[This is a demonstration system — not a production SOP database]",
      };
    }

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-28px-56px)] md:h-[calc(100vh-28px)] bg-[#0A0E14]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#374151] bg-[#0A0E14]">
        <h1 className="text-xl font-bold text-white">SOP Assistant</h1>
        <p className="text-xs text-[#9CA3AF] mt-0.5">
          Standard Operating Procedure Q&A — Demo system with limited pre-loaded content
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg =>
          msg.role === 'user'
            ? <UserBubble key={msg.id} msg={msg} />
            : <AssistantBubble key={msg.id} msg={msg} />
        )}

        {/* Quick question chips */}
        {messages.length <= 1 && (
          <div className="space-y-2">
            <p className="text-xs text-[#6B7280] text-center">Try asking about:</p>
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="w-full text-left text-sm text-[#9CA3AF] bg-[#1F2937] border border-[#374151] hover:border-[#06B6D4]/50 hover:text-white rounded-xl px-4 py-3 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 pb-4 pt-3 border-t border-[#374151] bg-[#0A0E14]">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            className="flex-1 bg-[#1F2937] border border-[#374151] rounded-xl px-4 py-3 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#06B6D4] transition-colors"
            placeholder="Ask about a procedure..."
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="w-11 h-11 bg-[#06B6D4] rounded-xl flex items-center justify-center text-white hover:bg-cyan-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-[#6B7280] italic text-center mt-2">
          This demo assistant does not have access to actual approved NMDC SOPs
        </p>
      </div>
    </div>
  );
}
