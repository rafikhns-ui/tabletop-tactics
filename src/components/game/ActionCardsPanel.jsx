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
  const [drawing, setDrawing] = useState(null); // null | 'trade' | 'spiritual' | 'clandestine'
  const [newCardId, setNewCardId] = useState(null);
  const [playingCard, setPlayingCard] = useState(null); // {card, ref} for animation
  const [cardEffectBurst, setCardEffectBurst] = useState(null); // card id for burst effect

  const hand = currentPlayer.actionCards?.length > 0
    ? ACTION_CARDS.filter(c => currentPlayer.actionCards.includes(c.id))
    : [];

  // Define three decks
  const decks = {
    trade: { name: 'Trade & Diplomacy', emoji: '💰', color: 'hsl(38,70%,28%)', cards: ACTION_CARDS.filter(c => ['Trade', 'Diplomacy'].includes(c.category)) },
    spiritual: { name: 'Spiritual & Arcane', emoji: '✨', color: 'hsl(200,50%,28%)', cards: ACTION_CARDS.filter(c => ['Spiritual', 'Military'].includes(c.category)) },
    clandestine: { name: 'Clandestine', emoji: '🕵️', color: 'hsl(0,50%,28%)', cards: ACTION_CARDS.filter(c => c.category === 'Clandestine') },
  };

  const canDraw = (currentPlayer.resources?.gold ?? 0) >= DRAW_COST;

  const handleDraw = async (deckKey) => {
    if (!canDraw || drawing) return;
    setDrawing(deckKey);

    const inHand = currentPlayer.actionCards || [];
    const available = decks[deckKey].cards.filter(c => !inHand.includes(c.id));
    const pool = available.length > 0 ? available : decks[deckKey].cards;
    const drawn = pool[Math.floor(Math.random() * pool.length)];

    await new Promise(r => setTimeout(r, 800));
    setNewCardId(drawn.id);
    onDrawCard(drawn);
    setTimeout(() => { setNewCardId(null); setDrawing(null); }, 900);
  };

  const handlePlayCard = (card) => {
    setPlayingCard(card.id);
    setTimeout(() => {
      setCardEffectBurst(card.id);
      onPlayCard(card);
    }, 300);
    setTimeout(() => {
      setPlayingCard(null);
      setCardEffectBurst(null);
    }, 1200);
  };

  return (
    <div className="p-3">
      <div className="text-xs font-bold opacity-50 tracking-widest mb-3" style={{ fontFamily: "'Cinzel',serif" }}>
        ACTION CARDS — Hand: {hand.length}
      </div>

      {/* Three deck stacks */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {Object.entries(decks).map(([deckKey, deck]) => (
          <div key={deckKey} className="flex flex-col items-center">
            {/* Deck visual */}
            <div className="relative mb-2" style={{ width: '52px', height: '72px' }}>
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
              <div className="absolute rounded-lg flex items-center justify-center"
                style={{
                  width: '48px', height: '68px', top: 0, left: 0,
                  background: `linear-gradient(135deg, ${deck.color}, hsl(35,22%,13%))`,
                  border: `1.5px solid ${deck.color}`,
                  boxShadow: drawing === deckKey ? `0 0 16px ${deck.color}` : '0 2px 8px rgba(0,0,0,0.4)',
                  transition: 'box-shadow 0.3s',
                }}>
                <span style={{ fontSize: '20px' }}>{deck.emoji}</span>
              </div>

              <AnimatePresence>
                {drawing === deckKey && (
                  <motion.div
                    key={`flying-${deckKey}`}
                    className="absolute rounded-lg flex items-center justify-center z-50"
                    style={{
                      width: '48px', height: '68px',
                      background: `linear-gradient(135deg, ${deck.color}, hsl(35,22%,13%))`,
                      border: `1.5px solid ${deck.color}`,
                      boxShadow: `0 0 20px ${deck.color}`,
                      top: 0, left: 0,
                    }}
                    initial={{ y: 0, x: 0, rotate: 0, opacity: 1, scale: 1 }}
                    animate={{ y: -40, x: 70, rotate: 15, opacity: 1, scale: 1.1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    <span style={{ fontSize: '20px' }}>🃏</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Draw button */}
            <button
              onClick={() => handleDraw(deckKey)}
              disabled={!canDraw || drawing}
              className="px-2 py-1 rounded text-xs font-bold transition-all active:scale-95"
              style={{
                fontFamily: "'Cinzel',serif",
                background: canDraw && !drawing ? deck.color : 'hsl(35,15%,22%)',
                border: `1px solid ${canDraw && !drawing ? deck.color : 'hsl(35,15%,30%)'}`,
                color: canDraw && !drawing ? 'white' : 'hsl(40,15%,40%)',
                cursor: canDraw && !drawing ? 'pointer' : 'not-allowed',
              }}>
              Draw
            </button>

            {/* Deck label */}
            <div className="text-xs mt-1 text-center opacity-60 leading-tight" style={{ color: 'hsl(40,20%,55%)', fontSize: '10px' }}>
              {deck.name}
            </div>
          </div>
        ))}
      </div>

      {/* Cost */}
      <div className="text-xs flex items-center justify-center gap-1 mb-3" style={{ color: (currentPlayer.resources?.gold ?? 0) >= DRAW_COST ? 'hsl(43,70%,55%)' : 'hsl(0,60%,50%)' }}>
        <span>🪙 {DRAW_COST} gold per card</span>
        {!canDraw && <span className="opacity-60">(need more gold)</span>}
      </div>

      {/* Hand */}
      {hand.length > 0 && (
        <div>
          <div className="text-xs opacity-40 mb-2 tracking-wider" style={{ fontFamily: "'Cinzel',serif" }}>YOUR HAND</div>
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
                    animate={playingCard === card.id ? { y: -80, x: 0, opacity: 0, scale: 0.3, rotate: 45 } : { y: 0, opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="relative cursor-pointer select-none"
                    style={{ width: '70px' }}
                    onMouseEnter={() => setHoveredId(card.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => affordable && handlePlayCard(card)}
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

                    <AnimatePresence>
                      {cardEffectBurst === card.id && (
                        <>
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={`burst-${i}`}
                              className="absolute rounded-full"
                              initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                              animate={{
                                x: Math.cos((i / 6) * Math.PI * 2) * 60,
                                y: Math.sin((i / 6) * Math.PI * 2) * 60,
                                opacity: 0,
                                scale: 0,
                              }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              style={{
                                width: '8px',
                                height: '8px',
                                background: card.category === 'Clandestine' ? 'hsl(0,70%,50%)' : card.category === 'Spiritual' ? 'hsl(200,70%,50%)' : 'hsl(38,80%,55%)',
                                boxShadow: `0 0 8px currentColor`,
                              }}
                            />
                          ))}
                        </>
                      )}
                    </AnimatePresence>

                    {isHovered && (
                      <div className="absolute bottom-3/4 left-0 mb-2 z-50 w-56 rounded-lg overflow-hidden pointer-events-none"
                       style={{
                          transform: 'translateX(10%)',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.7)',
                        }}>
                        {card.image ? (
                          <div className="relative">
                            <img src={card.image} alt={card.name} className="w-full h-auto rounded-lg" />
                            {!affordable && (
                              <div className="absolute inset-0 bg-red-900 bg-opacity-60 flex items-center justify-center rounded-lg">
                                <span className="text-red-200 font-bold text-sm">Not enough resources</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg text-xs" style={{ background: 'hsl(35,25%,12%)', border: '1px solid hsl(43,60%,40%)', color: 'hsl(40,20%,75%)' }}>
                            <div className="font-bold mb-1" style={{ color: 'hsl(43,85%,65%)', fontFamily: "'Cinzel',serif" }}>
                              {card.emoji} {card.name}
                            </div>
                            <div className="mb-1 opacity-70 italic">{card.category}</div>
                            <div>{card.effect}</div>
                            {!affordable && <div className="mt-1 text-red-400 font-semibold">Not enough resources</div>}
                          </div>
                        )}
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