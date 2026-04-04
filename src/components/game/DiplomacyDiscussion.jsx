import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

export default function DiplomacyDiscussion({ gameState, currentPlayer, targetPlayer, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await base44.functions.invoke('getDiplomacyResponse', {
        gameState,
        currentPlayer,
        targetPlayer,
        userMessage: userMsg,
        conversationHistory: messages,
      });

      const aiResponse = response.data?.response || 'The ruler remains silent.';
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);

      // If AI suggests an action, parse and execute it
      if (response.data?.suggestedAction) {
        const action = response.data.suggestedAction;
        // Auto-execute trade offer if suggested
        if (action.type === 'trade_offer' && window.onDiplomacyAction) {
          window.onDiplomacyAction(action);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Communication failed.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div className="w-full max-w-2xl h-96 rounded-2xl overflow-hidden flex flex-col scroll-in"
        onClick={e => e.stopPropagation()}
        style={{ background: 'linear-gradient(160deg, hsl(35,25%,14%), hsl(35,20%,10%))', border: `2px solid ${targetPlayer.color}88`, boxShadow: `0 0 40px ${targetPlayer.color}33` }}>
        
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-xs tracking-widest opacity-50 mb-0.5" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,80%,60%)' }}>DIPLOMACY</div>
            <div className="text-base font-bold" style={{ fontFamily: "'Cinzel',serif", color: targetPlayer.color }}>
              Discussing with {targetPlayer.name}
            </div>
          </div>
          <button onClick={onClose} className="text-lg opacity-50 hover:opacity-100 px-2">✕</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: 40 }}>
              Start a conversation with {targetPlayer.name}...
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
              <div style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: 8,
                background: msg.role === 'user' ? '#1a1a2e' : '#0f2a1f',
                border: `1px solid ${msg.role === 'user' ? '#d4a853' : targetPlayer.color}66`,
                color: '#c8c0b0',
                fontSize: 12,
                lineHeight: 1.4,
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
              {targetPlayer.name} is considering your proposal...
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="border-t border-border px-5 py-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about trade, alliances, or intentions..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'hsl(35,20%,20%)',
              border: '1px solid hsl(35,20%,30%)',
              color: '#c8c0b0',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: "'Crimson Text', serif",
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: '8px 16px',
              background: loading ? 'hsl(35,20%,22%)' : 'hsl(38,80%,38%)',
              border: `1px solid ${loading ? 'hsl(35,20%,30%)' : 'hsl(38,80%,55%)'}`,
              color: loading ? 'hsl(40,20%,50%)' : 'hsl(43,90%,90%)',
              borderRadius: 4,
              fontSize: 11,
              fontFamily: "'Cinzel',serif",
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}>
            {loading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}