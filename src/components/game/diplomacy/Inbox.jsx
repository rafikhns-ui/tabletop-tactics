import React, { useEffect, useState } from 'react';
import EventCard from './EventCard';
import ConversationView from './ConversationView';
import OpenOffersPanel from './OpenOffersPanel';
import RelationsView from './RelationsView';
import {
  getInbox,
  sortedForDisplay,
  markRead,
  resolveEventChoice,
  listAuthoredPersonalities,
} from '@/lib/diplomacy';
import { reconcileEventErrors } from './_errorReconciler';

/**
 * The inbox panel — the single new UI surface for LLM-driven diplomacy.
 * Shows all events for the current player, plus a compact "talk to" row
 * for the authored factions so the player can start a conversation
 * without waiting for an event.
 */
export default function Inbox({ gameState, playerFactionId, onStateChange }) {
  const events = sortedForDisplay(getInbox(gameState));
  const [conversationWith, setConversationWith] = useState(null);
  const [view, setView] = useState('inbox'); // 'inbox' | 'relations'
  // Per-event inline error for failed proposal choices. Keeps the event
  // visible so the player can try a different proposal or dismiss.
  const [eventErrors, setEventErrors] = useState({});
  const authored = listAuthoredPersonalities();

  // Reconcile eventErrors against the current event list. Without this,
  // entries for events that were pruned by the state layer (resolved,
  // expired, or aged out by pruneInboxHistory) would accumulate forever
  // — and if an event ID were ever reused, a stale error from a
  // long-gone event could surface on a brand-new one. Using functional
  // setState and bailing if nothing changed keeps this from re-rendering
  // in a loop (new object identity from `events` on every getInbox call
  // would otherwise churn the effect).
  useEffect(() => {
    const liveIds = new Set(events.map((e) => e.id));
    setEventErrors((prev) => reconcileEventErrors(prev, liveIds));
  }, [events]);

  const onOpenConversation = (event) => {
    const next = markRead(gameState, event.id);
    onStateChange?.(next);
    setConversationWith(event.fromFactionId);
  };

  const clearEventError = (eventId) => {
    setEventErrors((prev) => {
      if (!(eventId in prev)) return prev;
      const next = { ...prev };
      delete next[eventId];
      return next;
    });
  };

  const onChoose = (event, proposalId) => {
    const result = resolveEventChoice({
      gameState,
      event,
      chosenActionId: proposalId,
    });
    if (!result.ok) {
      // Keep the event in the inbox and surface the reason. The previous
      // mark-read-on-fail behavior silently ate events when the player
      // picked something they couldn't afford — a real usability footgun.
      const reason = result.reason;
      console.warn('Event action rejected:', reason);
      setEventErrors((prev) => ({ ...prev, [event.id]: reason }));
      return;
    }
    clearEventError(event.id);
    onStateChange?.(result.nextState);
  };

  const onDismiss = (event) => {
    clearEventError(event.id);
    onStateChange?.(markRead(gameState, event.id));
  };

  return (
    <div
      style={{
        padding: 14,
        background: 'linear-gradient(180deg, hsl(35,22%,12%), hsl(35,18%,9%))',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 12,
        }}
      >
        <TabButton active={view === 'inbox'} onClick={() => setView('inbox')}>
          Inbox
        </TabButton>
        <TabButton
          active={view === 'relations'}
          onClick={() => setView('relations')}
        >
          Relations
        </TabButton>
      </div>

      {view === 'relations' ? (
        <RelationsView
          gameState={gameState}
          playerFactionId={playerFactionId}
        />
      ) : (
        <InboxBody
          gameState={gameState}
          playerFactionId={playerFactionId}
          events={events}
          authored={authored}
          eventErrors={eventErrors}
          onStateChange={onStateChange}
          onChoose={onChoose}
          onDismiss={onDismiss}
          onOpenConversation={onOpenConversation}
          setConversationWith={setConversationWith}
        />
      )}

      {conversationWith && (
        <ConversationView
          gameState={gameState}
          playerFactionId={playerFactionId}
          targetFactionId={conversationWith}
          onStateChange={onStateChange}
          onClose={() => setConversationWith(null)}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        fontFamily: "'Cinzel',serif",
        letterSpacing: 2,
        fontSize: 11,
        cursor: 'pointer',
        background: active ? 'hsl(38,40%,28%)' : 'hsl(35,22%,14%)',
        color: active ? '#f2e7c8' : '#c8c0b0',
        border: `1px solid ${active ? 'hsl(38,50%,45%)' : 'hsl(38,20%,25%)'}`,
        borderRadius: 4,
      }}
    >
      {children}
    </button>
  );
}

function InboxBody({
  gameState,
  playerFactionId,
  events,
  authored,
  eventErrors,
  onStateChange,
  onChoose,
  onDismiss,
  onOpenConversation,
  setConversationWith,
}) {
  return (
    <>
      <div
        style={{
          fontFamily: "'Cinzel',serif",
          letterSpacing: 3,
          fontSize: 11,
          color: '#d4a853',
          marginBottom: 6,
        }}
      >
        DIPLOMATIC INBOX
      </div>
      <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 14 }}>
        Messages, rumors, and opportunities from rival courts.
      </div>

      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 10,
            letterSpacing: 2,
            opacity: 0.5,
            marginBottom: 6,
          }}
        >
          OPEN AUDIENCE WITH
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {authored
            .filter((p) => p.factionId !== playerFactionId)
            .map((p) => (
              <button
                key={p.factionId}
                onClick={() => setConversationWith(p.factionId)}
                style={{
                  padding: '6px 10px',
                  fontSize: 11,
                  background: 'hsl(35,22%,17%)',
                  border: '1px solid hsl(38,40%,35%)',
                  color: '#d8cfb8',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontFamily: "'Crimson Text', serif",
                }}
                title={p.title}
              >
                {p.leaderName}
              </button>
            ))}
        </div>
      </div>

      <OpenOffersPanel
        gameState={gameState}
        playerFactionId={playerFactionId}
        onStateChange={onStateChange}
      />

      {events.length === 0 ? (
        <div style={{ opacity: 0.5, fontStyle: 'italic', fontSize: 12 }}>
          The halls are quiet.
        </div>
      ) : (
        events.map((e) => (
          <EventCard
            key={e.id}
            event={e}
            errorReason={eventErrors?.[e.id]}
            onChoose={onChoose}
            onOpenConversation={onOpenConversation}
            onDismiss={onDismiss}
          />
        ))
      )}
    </>
  );
}
