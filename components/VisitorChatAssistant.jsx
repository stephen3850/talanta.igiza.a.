'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  MessageCircle,
  Sparkles,
  Send,
  X,
  Bot,
  PhoneCall,
  RefreshCw,
} from 'lucide-react';
import Badge from './Badge';

export default function VisitorChatAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'MSG-001',
      sender: 'BOT',
      text: 'Jambo! I am Talanta Bot, your AI assistant for Talanta Sports City Stadium. How can I assist you with events, tickets, M-PESA payments, or stadium facilities today?',
      sourceTitle: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Hide Chat Assistant in admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const suggestedQuestions = [
    'What events are available?',
    'How do I purchase a ticket?',
    'How does M-PESA payment work?',
    'Where can I find my digital ticket?',
    'What facilities are available?',
    'How do I contact stadium support?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    const userMsg = {
      id: `MSG-${Date.now()}`,
      sender: 'USER',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/visitor-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText }),
      });

      const data = await res.json();
      if (data.success) {
        const botMsg = {
          id: `MSG-${Date.now() + 1}`,
          sender: 'BOT',
          text: data.response,
          sourceTitle: data.sourceTitle,
          escalateToHuman: data.escalateToHuman,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(data.message || 'Failed to process request');
      }
    } catch (err) {
      const errorMsg = {
        id: `MSG-${Date.now() + 2}`,
        sender: 'BOT',
        text: 'I am currently having trouble reaching my knowledge base. You can also reach our Matchday Support Desk at +254 711 000 100 or support@talanta.go.ke.',
        sourceTitle: 'Network Advisory',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* SINGLE UNIFIED FLOATING BUTTON: HAVE A QUESTION? */}
      {!isOpen && (
        <div className="fixed bottom-16 sm:bottom-0 right-4 sm:right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-[#E5B83F] hover:bg-[#D4A72E] text-black font-extrabold text-xs tracking-wider uppercase px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-b-none sm:rounded-t-xl shadow-2xl flex items-center space-x-2 transition-transform hover:-translate-y-0.5 border border-black/20"
            aria-label="Have A Question? Open Talanta Assistant"
          >
            <MessageCircle className="w-4 h-4 text-black stroke-[3]" />
            <span>HAVE A QUESTION?</span>
          </button>
        </div>
      )}

      {/* Expandable Visitor Chat Window */}
      {isOpen && (
        <div className="fixed bottom-16 sm:bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 h-[520px] max-h-[80vh] z-50 bg-navy-900 border border-emerald-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-navy-950 p-4 border-b border-navy-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E5B83F]/20 text-[#E5B83F] flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 text-[#E5B83F]" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-white text-xs">Talanta Stadium AI Assistant</span>
                  <Badge variant="success" size="sm">ONLINE</Badge>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">Grounded Matchday Visitor Support</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-1 ${
                    msg.sender === 'USER'
                      ? 'bg-[#E5B83F] text-slate-950 font-bold rounded-tr-none'
                      : 'bg-navy-950 border border-navy-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {msg.sourceTitle && (
                    <span className="block text-[9px] text-emerald-400 font-mono pt-1 border-t border-navy-900">
                      Grounded Source: {msg.sourceTitle}
                    </span>
                  )}
                </div>

                <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* Human Escalation Offer if flagged */}
                {msg.escalateToHuman && (
                  <a
                    href="mailto:support@talanta.go.ke"
                    className="mt-1 inline-flex items-center space-x-1 text-[10px] text-amber-400 font-bold hover:underline bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20"
                  >
                    <PhoneCall className="w-3 h-3 mr-1" />
                    <span>Connect with Human Support Steward</span>
                  </a>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono bg-navy-950 p-3 rounded-2xl max-w-[180px]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E5B83F]" />
                <span>Searching knowledge...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Questions Chips */}
          <div className="p-2.5 bg-navy-950/80 border-t border-navy-800 overflow-x-auto whitespace-nowrap flex space-x-2 no-scrollbar">
            {suggestedQuestions.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sq)}
                className="px-2.5 py-1 rounded-full bg-navy-900 border border-navy-800 text-[10px] font-semibold text-slate-300 hover:text-white hover:border-[#E5B83F] transition-all shrink-0"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-navy-950 border-t border-navy-800 flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask about tickets, M-PESA, events..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-navy-900 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E5B83F]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-xl bg-[#E5B83F] hover:bg-[#D4A72E] text-slate-950 font-bold disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Disclosure Bar */}
          <div className="bg-navy-950 px-3 py-1 text-center text-[9px] text-slate-500 font-mono border-t border-navy-900">
            AI-powered assistant • Answers grounded in official stadium sources
          </div>
        </div>
      )}
    </>
  );
}
