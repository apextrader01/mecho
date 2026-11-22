'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useVendorAuth } from '../context/VendorAuthContext';
import { vendorApiRequest } from '../lib/api';
import { X, Send, ShieldCheck, MessageSquare } from 'lucide-react';

interface VendorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: {
    dispatchId?: string;
    rfqId?: string;
    receiverId: string;
    receiverName: string;
  } | null;
}

export default function VendorChatModal({ isOpen, onClose, context }: VendorChatModalProps) {
  const { vendor } = useVendorAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    if (!context) return;
    try {
      const query = context.dispatchId
        ? `dispatchId=${context.dispatchId}`
        : `rfqId=${context.rfqId}`;

      const res = await vendorApiRequest(`/chat/messages?${query}`);
      if (res.success && res.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  useEffect(() => {
    if (isOpen && context) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, context]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !context) return;

    try {
      setLoading(true);
      const res = await vendorApiRequest('/chat/send', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: context.receiverId,
          dispatchId: context.dispatchId,
          rfqId: context.rfqId,
          message: newMessage.trim()
        })
      });

      if (res.success && res.message) {
        setNewMessage('');
        setMessages(prev => [...prev, res.message]);
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !context) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full h-[80vh] sm:h-[600px] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center font-black text-sm">
              {context.receiverName.charAt(0)}
            </div>
            <div>
              <h4 className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                <span>{context.receiverName}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              </h4>
              <p className="text-[10px] text-slate-400">
                Customer Direct Chat (Phone Masked)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {messages.map((msg) => {
            const isMe = msg.senderId === vendor?.userId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-sky-600 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <p>{msg.message}</p>
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type customer reply or ETA..."
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="p-2.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 active:scale-95 transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
