import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  X, 
  Send, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Truck, 
  Building2, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';

export default function ChatPanel({ request, isOpen, onClose, onThreadUpdated }) {
  const { currentUser, addToast } = useAuth();
  const [messages, setMessages] = useState([]);
  const [requestMeta, setRequestMeta] = useState(request || null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch conversation messages
  const loadMessages = useCallback(async (isInitial = false) => {
    if (!request?.id) return;
    try {
      if (isInitial) setLoading(true);
      const data = await api.getMessages(request.id, currentUser?.id);
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
      if (data?.request) {
        setRequestMeta(prev => ({ ...prev, ...data.request }));
      }
      if (isInitial) {
        setTimeout(() => scrollToBottom('auto'), 100);
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [request?.id, currentUser?.id]);

  // Initial load and polling setup (every 3.5s while open)
  useEffect(() => {
    if (!isOpen || !request?.id) return;

    loadMessages(true);
    const interval = setInterval(() => {
      loadMessages(false);
    }, 3500);

    // Focus input on open
    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);

    return () => {
      clearInterval(interval);
      if (onThreadUpdated) onThreadUpdated();
    };
  }, [isOpen, request?.id, loadMessages, onThreadUpdated]);

  // Scroll to bottom when messages count changes
  useEffect(() => {
    scrollToBottom('smooth');
  }, [(messages || []).length]);

  if (!isOpen || !request) return null;

  // Determine chat participant roles
  const isSeeker = currentUser?.id === (requestMeta?.seeker_id || request?.seeker_id);
  const otherPartyName = isSeeker 
    ? (requestMeta?.provider_name || request?.provider_name || 'Hospitality Host') 
    : (requestMeta?.seeker_name || request?.seeker_name || 'Resource Seeker');
  const otherPartyAvatar = isSeeker 
    ? (requestMeta?.provider_avatar || request?.provider_avatar) 
    : (requestMeta?.seeker_avatar || request?.seeker_avatar);
  const otherPartyRole = isSeeker ? 'Resource Provider' : 'Resource Seeker';

  // Handle Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const newMsg = await api.sendMessage(request.id, trimmed, currentUser?.id);
      setMessages(prev => [...(prev || []), newMsg]);
      setInputText('');
      setTimeout(() => scrollToBottom('smooth'), 50);
      if (onThreadUpdated) onThreadUpdated();
    } catch (err) {
      addToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleQuickQuestion = (text) => {
    setInputText(text);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Slide-in Drawer Container */}
      <div 
        className="w-full sm:max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <img
                src={otherPartyAvatar || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=120&q=80'}
                alt=""
                className="w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-500/30 border border-slate-200 dark:border-slate-700"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {otherPartyName}
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  {otherPartyRole}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Direct Inquiry Thread
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request Context Strip */}
        <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
              {requestMeta?.resource_title || request?.resource_title || 'Hospitality Resource'}
            </span>
            <span className="text-slate-400 shrink-0">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
              ${requestMeta?.negotiated_price || requestMeta?.total_price || request?.total_price || 0}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {Boolean(requestMeta?.needs_transport ?? request?.needs_transport) && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-semibold">
                <Truck className="w-3 h-3" /> Delivery
              </span>
            )}
            <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {requestMeta?.status || request?.status || 'pending'}
            </span>
          </div>
        </div>

        {/* Message Thread Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
              <span className="text-xs">Loading message history...</span>
            </div>
          ) : (messages || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                No messages yet — start the conversation
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-5">
                Clarify logistics, access timing, equipment specs, or custom requests directly with {otherPartyName}.
              </p>

              {/* Quick suggestion prompts */}
              <div className="w-full space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1">
                  Quick conversation starters:
                </p>
                {[
                  'What time is the earliest loading bay access available?',
                  'Can we schedule an in-person site walkthrough?',
                  'Do you provide power distribution for high-draw equipment?'
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleQuickQuestion(q)}
                    className="w-full text-left p-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 transition-colors"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center my-2">
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  Direct B2B Hospitality Exchange Channel
                </span>
              </div>

              {(messages || []).map((msg) => {
                const isSelf = msg.sender_id === currentUser?.id;

                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} transition-all`}
                  >
                    {!isSelf && (
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1 flex items-center gap-1">
                        {msg.sender_name}
                      </span>
                    )}

                    <div 
                      className={`max-w-[85%] sm:max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        isSelf
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-medium rounded-tr-sm shadow-md shadow-emerald-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>

                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Footer */}
        <form 
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={`Message ${otherPartyName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-sm"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 disabled:hover:from-emerald-500 disabled:hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all active:scale-95 shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
