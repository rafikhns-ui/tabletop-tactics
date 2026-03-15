import React from 'react';

export default function EventModal({ event, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden scroll-in text-center"
        style={{ background: 'linear-gradient(160deg, hsl(35,25%,13%), hsl(35,20%,9%))', border: '2px solid hsl(43,70%,45%)' }}>
        <div className="py-6 px-6">
          <div className="text-5xl mb-3">{event.emoji}</div>
          <div className="text-xs tracking-widest opacity-50 mb-1" style={{ fontFamily: "'Cinzel',serif" }}>
            WORLD EVENT
          </div>
          <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "'Cinzel',serif", color: 'hsl(43,90%,58%)' }}>
            {event.name}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(40,20%,70%)', fontFamily: "'Crimson Text',serif", fontSize: '16px' }}>
            {event.effect}
          </p>
          {event.duration > 0 && (
            <div className="mt-2 text-xs" style={{ color: 'hsl(43,70%,55%)' }}>
              Lasts {event.duration} turn{event.duration > 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div className="px-6 pb-6">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-lg text-sm font-bold hover:opacity-90"
            style={{ fontFamily: "'Cinzel',serif", background: 'linear-gradient(135deg, hsl(38,80%,38%), hsl(38,80%,28%))', border: '1px solid hsl(38,80%,55%)', color: 'hsl(43,90%,92%)' }}>
            ✦ Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}