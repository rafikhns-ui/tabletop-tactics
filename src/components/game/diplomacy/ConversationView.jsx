import React, { useState, useRef, useEffect } from 'react';
import { sendDiplomacyMessage } from '@/lib/diplomacy/api';
import { getPersonality } from '@/lib/diplomacy';

/**
 * Freeform chat with a faction leader. Any ActionDefs the LLM emits are
 * dispatched against current state; the caller receives the new state via
 * onStateChange and a compact "what happened" summary per turn.
 */
export default function ConversationView({
  gameState,
  playerFactionId,
  targetFactionId,
  seedMessages = [],
  onStateChange,
  onClose,
}) {
  const personality = getPersonality(targetFactionId);
  const leaderName = personality?.leaderName || targetFactionId;
  const accent = '#d4a853';

  const [messages, setMessages] = useState(seedMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const { dialogue, applied, rejected, nextState, error } = await sendDiplomacyMessage({
        gameState,
        speakerFactionId: targetFactionId,
        playerFactionId,
        history: messages,
        userMessage: userMsg,
      });

      // The API now surfaces transport failures as a sentinel return
      // rather than a throw. Show the same courier-failed message the
      // catch block below would have shown before.
      if (error === 'transport_failure') {
        setMessages((m) => [
          ...m,
          { role: 'system', text: 'Messenger returned with empty hands.' },
        ]);
        return;
      }

      setMessages((m) => [
        ...m,
        { role: 'ai', text: dialogue || '…' },
        ...(applied.length
          ? [
              {
                role: 'system',
                text: `Actions applied: ${applied.map((a) => a.type).join(', ')}.`,
              },
            ]
          : []),
        ...(rejected.length
          ? [
              {
                role: 'system',
                text: `Rejected: ${rejected.map((r) => `${r.action?.type || 'unknown'} (${r.reason})`).join('; ')}.`,
              },
            ]
          : []),
      ]);
      if (applied.length && onStateChange) onStateChange(nextState);
    } catch {
      // Defensive — should no longer fire, but keep the fallback.
      setMessages((m) => [
        ...m,
        { role: 'system', text: 'Messenger returned with empty hands.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 640,
          height: 520,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(160deg, hsl(35,25%,14%), hsl(35,20%,10%))',
          border: `2px solid ${accent}88`,
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid hsl(35,20%,25%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: 2,
                opacity: 0.5,
                fontFamily: "'Cinzel',serif",
              }}
            >
              DIPLOMACY
            </div>
            <div
              style={{
                fontFamily: "'Cinzel',serif",
                fontSize: 16,
                color: accent,
                fontWeight: 700,
              }}
            >
              {leaderName}
            </div>
            <div style={{ fontSize: 11, opacity: 0.5 }}>
              {personality?.title || ''}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#c8c0b0',
              fontSize: 18,
              cursor: 'pointer',
              opacity: 0.6,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#888', marginTop: 40, fontStyle: 'italic' }}>
              Send the first word.
            </div>
          )}
          {messages.map((m, i) => (
            <MessageBubble key={i} m={m} accent={accent} />
          ))}
          {loading && (
            <div style={{ fontStyle: 'italic', color: '#888' }}>
              {leaderName} considers…
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <form
          onSubmit={onSend}
          style={{
            borderTop: '1px solid hsl(35,20%,25%)',
            padding: 12,
            display: 'flex',
            gap: 8,
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Speak plainly…"
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 12px',
              background: 'hsl(35,22%,18%)',
              border: '1px solid hsl(35,20%,30%)',
              borderRadius: 4,
              color: '#d8cfb8',
              fontFamily: "'Crimson Text', serif",
              fontSize: 13,
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: '8px 16px',
              background: loading ? 'hsl(35,20%,22%)' : 'hsl(38,80%,38%)',
              border: '1px solid hsl(38,80%,55%)',
              borderRadius: 4,
              color: '#fff3c0',
              fontFamily: "'Cinzel',serif",
              fontSize: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ m, accent }) {
  if (m.role === 'system') {
    return (
      <div
        style={{
          alignSelf: 'center',
          fontSize: 11,
          color: '#8c8572',
          fontStyle: 'italic',
        }}
      >
        {m.text}
      </div>
    );
  }
  const isUser = m.role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div
        style={{
          maxWidth: '78%',
          padding: '10px 14px',
          borderRadius: 8,
          background: isUser ? '#1a1a2e' : '#0f2a1f',
          border: `1px solid ${isUser ? '#d4a853' : accent}66`,
          color: '#c8c0b0',
          fontFamily: "'Crimson Text', serif",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        {m.text}
      </div>
    </div>
  );
}
