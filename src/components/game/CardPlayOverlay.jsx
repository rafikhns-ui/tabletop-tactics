import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_STYLES = {
  Trade:      { bg: 'hsl(38,70%,18%)', border: 'hsl(43,80%,55%)', glow: 'rgba(255,200,50,0.6)', particles: '#f0c040' },
  Diplomacy:  { bg: 'hsl(200,50%,14%)', border: 'hsl(200,80%,55%)', glow: 'rgba(80,180,255,0.6)', particles: '#5ab4ff' },
  Spiritual:  { bg: 'hsl(270,40%,14%)', border: 'hsl(270,70%,65%)', glow: 'rgba(180,100,255,0.6)', particles: '#c080ff' },
  Military:   { bg: 'hsl(0,40%,14%)', border: 'hsl(0,70%,55%)', glow: 'rgba(255,80,80,0.6)', particles: '#ff5555' },
  Clandestine:{ bg: 'hsl(0,20%,10%)', border: 'hsl(0,50%,40%)', glow: 'rgba(200,50,50,0.5)', particles: '#aa3333' },
};

function Particle({ style, color }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={style}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{ width: 8, height: 8, background: color, boxShadow: `0 0 10px ${color}` }}
    />
  );
}

export default function CardPlayOverlay({ playedCard, playerName, playerColor, onDone }) {
  const [phase, setPhase] = useState('enter'); // enter → reveal → burst → exit
  const [particles] = useState(() =>
    Array.from({ length: 16 }, (_, i) => {
      const angle = (i / 16) * Math.PI * 2;
      const dist = 90 + Math.random() * 70;
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        scale: 0,
      };
    })
  );

  useEffect(() => {
    if (!playedCard) return;
    setPhase('enter');
    const t1 = setTimeout(() => setPhase('reveal'), 400);
    const t2 = setTimeout(() => setPhase('burst'), 900);
    const t3 = setTimeout(() => setPhase('exit'), 1800);
    const t4 = setTimeout(() => onDone && onDone(), 2300);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [playedCard]);

  if (!playedCard) return null;

  const catStyle = CATEGORY_STYLES[playedCard.category] || CATEGORY_STYLES.Trade;

  return (
    <AnimatePresence>
      {phase !== 'exit' && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)' }}
        >
          {/* Ambient glow behind card */}
          <motion.div
            className="absolute rounded-full"
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={phase === 'burst' ? { width: 500, height: 500, opacity: 0.35 } : phase === 'reveal' ? { width: 200, height: 200, opacity: 0.5 } : { width: 0, height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ background: `radial-gradient(circle, ${catStyle.glow}, transparent 70%)` }}
          />

          {/* The card itself */}
          <motion.div
            className="relative flex flex-col items-center"
            initial={{ scale: 0.2, y: 80, opacity: 0, rotate: -20 }}
            animate={
              phase === 'enter'  ? { scale: 0.5, y: 40, opacity: 0.7, rotate: -10 } :
              phase === 'reveal' ? { scale: 1.15, y: 0, opacity: 1, rotate: 0 } :
              phase === 'burst'  ? { scale: 1.05, y: 0, opacity: 1, rotate: 0 } :
                                   { scale: 0, y: -60, opacity: 0, rotate: 15 }
            }
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            {/* Card body */}
            <div className="relative rounded-2xl p-6 flex flex-col items-center gap-3 select-none"
              style={{
                width: 200,
                background: `linear-gradient(160deg, ${catStyle.bg}, hsl(35,18%,10%))`,
                border: `2px solid ${catStyle.border}`,
                boxShadow: `0 0 40px ${catStyle.glow}, 0 0 80px ${catStyle.glow}40, 0 8px 32px rgba(0,0,0,0.8)`,
              }}>

              {/* Category ribbon */}
              <div className="absolute -top-3 px-4 py-0.5 rounded-full text-xs font-bold tracking-widest"
                style={{ background: catStyle.border, color: '#0d1117', fontFamily: "'Cinzel',serif" }}>
                {playedCard.category?.toUpperCase()}
              </div>

              {/* Emoji */}
              <motion.div
                className="text-6xl mt-2"
                animate={phase === 'burst' ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] } : { scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {playedCard.emoji}
              </motion.div>

              {/* Name */}
              <div className="text-center font-bold text-lg leading-tight"
                style={{ fontFamily: "'Cinzel',serif", color: catStyle.border }}>
                {playedCard.name}
              </div>

              {/* Effect text */}
              <div className="text-center text-xs opacity-80 leading-relaxed"
                style={{ color: 'hsl(40,20%,75%)', fontFamily: "'Crimson Text',serif" }}>
                {playedCard.effect}
              </div>

              {/* Shimmer overlay */}
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                animate={phase === 'reveal' ? { opacity: [0, 0.3, 0] } : { opacity: 0 }}
                transition={{ duration: 0.6 }}
                style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)' }}
              />
            </div>

            {/* Player name badge below card */}
            <motion.div
              className="mt-4 px-5 py-1.5 rounded-full text-sm font-bold"
              initial={{ opacity: 0, y: 10 }}
              animate={phase === 'reveal' || phase === 'burst' ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ delay: 0.2 }}
              style={{
                background: `${playerColor}22`,
                border: `1.5px solid ${playerColor || catStyle.border}`,
                color: playerColor || catStyle.border,
                fontFamily: "'Cinzel',serif",
                boxShadow: `0 0 16px ${playerColor || catStyle.border}44`,
              }}>
              {playerName} played a card!
            </motion.div>

            {/* Burst particles */}
            <AnimatePresence>
              {phase === 'burst' && (
                <div className="absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%,-50%)' }}>
                  {particles.map((p, i) => (
                    <Particle key={i} style={p} color={catStyle.particles} />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Corner rune decorations */}
          {phase === 'reveal' || phase === 'burst' ? (
            <>
              {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos, i) => (
                <motion.div
                  key={i}
                  className={`absolute ${pos} text-3xl opacity-30 pointer-events-none`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.3, scale: 1, rotate: i % 2 === 0 ? 15 : -15 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  style={{ color: catStyle.border, fontFamily: "'Cinzel',serif" }}>
                  ✦
                </motion.div>
              ))}
            </>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}