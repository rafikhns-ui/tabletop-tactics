import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

// Parse action commands from AI message
const parseAction = (content) => {
  const match = content.match(/ACTION:(\{[^}]+\})/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
};

// Remove ACTION:... from displayed text
const cleanMessage = (content) => content.replace(/ACTION:\{[^}]+\}/g, '').trim();

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const clean = cleanMessage(message.content || '');
  if (!clean) return null;
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5"
          style={{ background: 'hsl(43,70%,30%)', fontSize: '12px' }}>⚜️</div>
      )}
      <div
        className={`max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed`}
        style={{
          background: isUser ? 'hsl(35,30%,22%)' : 'hsl(35,25%,18%)',
          border: isUser ? '1px solid hsl(35,30%,32%)' : '1px solid hsl(43,60%,35%)',
          color: isUser ? 'hsl(40,20%,75%)' : 'hsl(43,80%,82%)',
          fontFamily: "'Crimson Text', serif",
        }}
      >
        {isUser ? clean : (
          <ReactMarkdown
            className="prose prose-xs max-w-none"
            components={{
              p: ({ children }) => <p className="my-0.5">{children}</p>,
              strong: ({ children }) => <strong style={{ color: 'hsl(43,90%,70%)' }}>{children}</strong>,
              ul: ({ children }) => <ul className="ml-3 list-disc my-1">{children}</ul>,
              li: ({ children }) => <li className="my-0">{children}</li>,
            }}
          >
            {clean}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default function AdvisorPanel({ gameState, currentPlayer, onAction }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const bottomRef = useRef(null);

  // Init conversation — persist conversation ID across tab switches
  useEffect(() => {
    let unsubscribe;
    (async () => {
      setInitializing(true);
      try {
        const existingId = window.__advisorConversationId;
        let conv;
        if (existingId) {
          conv = await base44.agents.getConversation(existingId);
        } else {
          conv = await base44.agents.createConversation({
            agent_name: 'game_advisor',
            metadata: { game: 'rulers_of_ardonia' },
          });
          window.__advisorConversationId = conv.id;
        }
        setConversation(conv);
        setMessages(conv.messages || []);
        unsubscribe = base44.agents.subscribeToConversation(conv.id, (updated) => {
          setMessages(updated.messages || []);
          // Parse and fire any action commands from last AI message
          const last = (updated.messages || []).slice().reverse().find(m => m.role === 'assistant');
          if (last) {
            const action = parseAction(last.content || '');
            if (action) onAction(action);
          }
        });
      } catch (e) {
        console.error('Advisor init error', e);
      }
      setInitializing(false);
    })();
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContext = () => {
    if (!gameState || !currentPlayer) return '';
    const owned = Object.values(gameState.hexes || {}).filter(h => h.owner === currentPlayer.id).length;
    const enemies = gameState.players.filter(p => p.id !== currentPlayer.id).map(p => `${p.name} (${p.factionId})`).join(', ');
    return `\n\n[GAME STATE] Turn: ${gameState.turn}, Phase: ${gameState.phase || 'N/A'}, Player: ${currentPlayer.name} (${currentPlayer.factionId}), Hexes owned: ${owned}, Resources: Gold=${currentPlayer.resources?.gold}, Wood=${currentPlayer.resources?.wood}, Wheat=${currentPlayer.resources?.wheat}, IP=${currentPlayer.ip}, SP=${currentPlayer.sp}, Enemies: ${enemies}`;
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversation || loading) return;
    const fullMessage = input.trim() + buildContext();
    setInput('');
    setLoading(true);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: fullMessage });
    } catch (e) {
      console.error('Send error', e);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickCommands = [
    { label: '📊 Strategy', text: 'What should I do this turn?' },
    { label: '⚔️ Attack', text: 'Which territory should I attack?' },
    { label: '🏗️ Build', text: 'What should I build next?' },
    { label: '💰 Resources', text: 'How can I improve my economy?' },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: 'hsl(35,22%,12%)' }}>
      {/* Header */}
      <div className="px-3 py-2 border-b flex-shrink-0 flex items-center gap-2"
        style={{ borderColor: 'hsl(35,20%,25%)', background: 'hsl(35,22%,14%)' }}>
        <span style={{ color: 'hsl(43,85%,65%)', fontFamily: "'Cinzel',serif", fontSize: '12px', fontWeight: 700 }}>
          ⚜️ Royal Advisor
        </span>
        <span className="text-xs opacity-40" style={{ color: 'hsl(40,20%,60%)' }}>— Ask anything or give commands</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {initializing && (
          <div className="flex items-center justify-center h-full opacity-40" style={{ color: 'hsl(43,80%,60%)' }}>
            <span className="text-xs animate-pulse" style={{ fontFamily: "'Cinzel',serif" }}>Summoning advisor…</span>
          </div>
        )}
        {!initializing && messages.length === 0 && (
          <div className="text-center opacity-40 mt-4">
            <div className="text-2xl mb-2">⚜️</div>
            <div className="text-xs" style={{ color: 'hsl(43,60%,60%)', fontFamily: "'Cinzel',serif" }}>
              Your Royal Advisor awaits.<br />Ask for strategy or give commands.
            </div>
          </div>
        )}
        {messages.filter(m => m.content).map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        {loading && (
          <div className="flex justify-start mb-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
              style={{ background: 'hsl(43,70%,30%)', fontSize: '12px' }}>⚜️</div>
            <div className="px-3 py-2 rounded-lg text-xs animate-pulse"
              style={{ background: 'hsl(35,25%,18%)', border: '1px solid hsl(43,60%,35%)', color: 'hsl(43,60%,60%)' }}>
              Consulting the scrolls…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick commands */}
      <div className="px-3 py-1.5 flex gap-1.5 flex-wrap border-t" style={{ borderColor: 'hsl(35,20%,22%)' }}>
        {quickCommands.map(cmd => (
          <button key={cmd.label} onClick={() => setInput(cmd.text)}
            className="text-xs px-2 py-0.5 rounded transition-all hover:opacity-90"
            style={{
              background: 'hsl(35,20%,20%)',
              border: '1px solid hsl(35,20%,30%)',
              color: 'hsl(40,20%,60%)',
              fontFamily: "'Cinzel',serif",
            }}>
            {cmd.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-3 py-2 flex gap-2 border-t" style={{ borderColor: 'hsl(35,20%,25%)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the advisor or give a command…"
          disabled={initializing || loading}
          className="flex-1 px-3 py-1.5 rounded text-xs outline-none"
          style={{
            background: 'hsl(35,20%,19%)',
            border: '1px solid hsl(35,20%,30%)',
            color: 'hsl(40,20%,80%)',
            fontFamily: "'Crimson Text', serif",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading || initializing}
          className="px-3 py-1.5 rounded text-xs font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, hsl(38,70%,32%), hsl(38,70%,22%))',
            border: '1px solid hsl(38,70%,50%)',
            color: 'hsl(43,90%,80%)',
            fontFamily: "'Cinzel',serif",
          }}>
          Send
        </button>
      </div>
    </div>
  );
}