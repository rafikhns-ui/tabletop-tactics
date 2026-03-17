import React, { useState } from 'react';
import { ACTION_CARDS } from './ardoniaData';
import { motion, AnimatePresence } from 'framer-motion';

const DRAW_COST = 2; // gold to draw a card

function canAffordCard(card, player) {
  const cost = card.cost || {};
  for (const [k, v] of Object.entries(cost)) {
    if (k === 'ip' && (player.ip ?? 0) < v) return false;
    if (k === 'sp' && (player.sp ?? 0) < v) return false;
    if (k !== 'ip' && k !== 'sp' && (player.resources?.[k] ?? 0) < v) return false;
  }
  return true;
}

function CostTag({ k, v, player }) {
  const have = k === 'ip' ? (player.ip ?? 0) : k === 'sp' ? (player.sp ?? 0) : (player.resources?.[k] ?? 0);
  const ok = have >= v;
  const icons = { gold: '🪙', wood: '🪵', wheat: '🌾', ip: '💬', sp: '✨' };
  return (
    <span className="text-xs px-1.5 py-0.5 rounded" style={{
      background: 'hsl(35,20%,22%)',
      color: ok ? 'hsl(43,80%,65%)' : 'hsl(0,65%,55%)',
    }}>
      {icons[k] || k}{v}
    </span>
  );
}

export default function ActionCardsPanel({ currentPlayer, onPlayCard, onDrawCard }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [newCardId, setNewCardId] = useState(null);

  const hand = currentPlayer.actionCards?.length > 0
    ? ACTION_CARDS.filter(c => currentPlayer.actionCards.includes(c.id))
    : [];

  const canDraw = (currentPlayer.resources?.gold ?? 0) >= DRAW_COST;
  const deckSize = ACTION_CARDS.length;

  const handleDraw = async () => {
    if (!canDraw || drawing) return;
    setDrawing(true);

    // Pick a random card not already in hand
    const inHand = currentPlayer.actionCards || [];
    const available = ACTION_CARDS.filter(c => !inHand.includes(c.id));
    const pool = available.length > 0 ? available : ACTION_CARDS;
    const drawn = pool[Math.floor(Math.random() * pool.length)];

    // Animate for 800ms before confirming
    await new Promise(r => setTimeout(r, 800));
    setNewCardId(drawn.id);
    onDrawCard(drawn);
    setTimeout(() => { setNewCardId(null); setDrawing(false); }, 900);
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold opacity-50 tracking-widest" style={{ fontFamily: "'Cinzel',serif" }}>
          ACTION CARDS
        </div>
        <span className="text-xs opacity-40" style={{ color: 'hsl(40,20%,60%)' }}>
          Hand: {hand.length}
        </span>
      </div>

      {/* Deck draw button */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative" style={{ width: '52px', height: '72px', flexShrink: 0 }}>
          {/* Stacked deck visual */}
          {[2, 1, 0].map(i => (
            <div key={i} className="absolute rounded-lg"
              style={{
                width: '48px', height: '68px',
                top: `${i * 2}px`, left: `${i * 1}px`,
                background: 'hsl(35,30%,20%)',
                border: '1px solid hsl(43,60%,35%)',
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,200,50,0.03) 3px, rgba(255,200,50,0.03) 6px)',
              }}
            />
          ))}
          {/* Top of deck with ⚜️ */}
          <div className="absolute rounded-lg flex items-center justify-center"
            style={{
              width: '48px', height: '68px', top: 0, left: 0,
              background: 'linear-gradient(135deg, hsl(35,28%,18%), hsl(35,22%,13%))',
              border: '1.5px solid hsl(43,65%,42%)',
              boxShadow: drawing ? '0 0 16px rgba(255,200,50,0.5)' : '0 2px 8px rgba(0,0,0,0.4)',
              transition: 'box-shadow 0.3s',
            }}>
            <span style={{ fontSize: '22px' }}>⚜️</span>
          </div>

          {/* Flying card animation */}
          <AnimatePresence>
            {drawing && (
              <motion.div
                key="flying"
                className="absolute rounded-lg flex items-center justify-center z-50"
                style={{
                  width: '48px', height: '68px',
                  background: 'linear-gradient(135deg, hsl(38,60%,22%), hsl(35,22%,13%))',
                  border: '1.5px solid hsl(43,80%,55%)',
                  boxShadow: '0 0 20px rgba(255,200,50,0.6)',
                  top: 0, left: 0,
                }}
                initial={{ y: 0, x: 0, rotate: 0, opacity: 1, scale: 1 }}
                animate={{ y: -40, x: 70, rotate: 15, opacity: 1, scale: 1.1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <span style={{ fontSize: '22px' }}>🃏</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-xs" style={{ color: 'hsl(40,20%,55%)' }}>
            {deckSize} cards in deck
          </div>
          <button
            onClick={handleDraw}
            disabled={!canDraw || drawing}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
            style={{
              fontFamily: "'Cinzel',serif",
              background: canDraw && !drawing
                ? 'linear-gradient(135deg, hsl(38,70%,32%), hsl(38,70%,22%))'
                : 'hsl(35,15%,22%)',
              border: `1px solid ${canDraw && !drawing ? 'hsl(43,75%,50%)' : 'hsl(35,15%,30%)'}`,
              color: canDraw && !drawing ? 'hsl(43,90%,80%)' : 'hsl(40,15%,40%)',
              cursor: canDraw && !drawing ? 'pointer' : 'not-allowed',
            }}>
            {drawing ? '✨ Drawing...' : `🃏 Draw Card`}
          </button>
          <div className="text-xs flex items-center gap-1" style={{ color: (currentPlayer.resources?.gold ?? 0) >= DRAW_COST ? 'hsl(43,70%,55%)' : 'hsl(0,60%,50%)' }}>
            <span>🪙 {DRAW_COST} gold</span>
            {!canDraw && <span className="opacity-60">(need more gold)</span>}
          </div>
        </div>
      </div>

      {/* Hand */}
      {hand.length > 0 && (
        <div>
          <div className="text-xs opacity-40 mb-1.5 tracking-wider" style={{ fontFamily: "'Cinzel',serif" }}>YOUR HAND</div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {hand.map(card => {
                const affordable = canAffordCard(card, currentPlayer);
                const isHovered = hoveredId === card.id;
                const isNew = newCardId === card.id;
                return (
                  <motion.div
                    key={card.id}
                    initial={isNew ? { y: -30, opacity: 0, scale: 0.7, rotate: -10 } : false}
                    animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="relative cursor-pointer select-none"
                    style={{ width: '70px' }}
                    onMouseEnter={() => setHoveredId(card.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => affordable && onPlayCard(card)}
                  >
                    <motion.div
                      className="rounded-lg p-1.5 flex flex-col items-center gap-0.5 text-center"
                      animate={{
                        y: isHovered && affordable ? -6 : 0,
                        boxShadow: isHovered && affordable ? '0 8px 20px rgba(0,0,0,0.6)' : '0 2px 6px rgba(0,0,0,0.3)',
                      }}
                      transition={{ duration: 0.15 }}
                      style={{
                        background: isHovered && affordable ? 'hsl(38,60%,22%)' : 'hsl(35,20%,18%)',
                        border: `1px solid ${affordable ? (isHovered ? 'hsl(43,80%,55%)' : 'hsl(43,50%,35%)') : 'hsl(35,15%,28%)'}`,
                        opacity: affordable ? 1 : 0.5,
                      }}>
                      <div className="text-2xl leading-none">{card.emoji}</div>
                      <div className="font-semibold mt-0.5" style={{ color: 'hsl(43,75%,65%)', fontFamily: "'Cinzel',serif", fontSize: '9px', lineHeight: 1.2 }}>
                        {card.name}
                      </div>
                      <div className="flex gap-0.5 flex-wrap justify-center mt-1">
                        {Object.entries(card.cost || {}).map(([k, v]) => (
                          <CostTag key={k} k={k} v={v} player={currentPlayer} />
                        ))}
                      </div>
                    </motion.div>

                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 mb-2 z-50 w-44 rounded-lg p-2 text-xs pointer-events-none"
                        style={{
                          transform: 'translateX(-50%)',
                          background: 'hsl(35,25%,12%)',
                          border: '1px solid hsl(43,60%,40%)',
                          color: 'hsl(40,20%,75%)',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
                        }}>
                        <div className="font-bold mb-1" style={{ color: 'hsl(43,85%,65%)', fontFamily: "'Cinzel',serif" }}>
                          {card.emoji} {card.name}
                        </div>
                        <div className="mb-1 opacity-70 italic">{card.category}</div>
                        <div>{card.effect}</div>
                        {!affordable && <div className="mt-1 text-red-400 font-semibold">Not enough resources</div>}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {hand.length === 0 && (
        <div className="text-xs opacity-30 italic text-center py-2" style={{ color: 'hsl(40,20%,55%)' }}>
          Draw a card to begin
        </div>
      )}
    </div>
  );
}