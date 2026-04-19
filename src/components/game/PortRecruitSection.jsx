import React, { useState } from 'react';

const REAPER_IMAGE = 'https://media.base44.com/images/public/69b732e420481df67e8a6804/4c3f57a91_16.png';

export default function PortRecruitSection({ selHexId, currentPlayer, onRecruitReapership }) {
  const [hovered, setHovered] = useState(false);
  const reaperDef = { gold: 2, wood: 3 };
  const canAfford = Object.entries(reaperDef).every(([k, v]) => (currentPlayer?.resources?.[k] ?? 0) >= v);

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid #2a2520', paddingTop: 12 }}>
      <div style={{ color: '#4488ff', fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
        ⚓ PORT RECRUITMENT
      </div>
      {hovered && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 9999, pointerEvents: 'none' }}>
          <img src={REAPER_IMAGE} alt="Infamous Reapership" style={{ width: 320, height: 'auto', borderRadius: 12, border: '3px solid #4488ff', boxShadow: '0 0 60px #4488ff66' }} />
        </div>
      )}
      <div style={{ borderRadius: 8, border: '1px solid #4488ff55', background: 'linear-gradient(135deg,#4488ff18,#0a0c12)', cursor: 'default' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: '1px solid #4488ff33' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'radial-gradient(circle at 35% 30%,#4488ff88,#0a0c12)', border: '2px solid #4488ff88', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            ⛵
          </div>
          <div>
            <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 13, color: '#4488ff' }}>Infamous Reapership</div>
            <div style={{ fontSize: 10, color: '#7a9a7a', marginTop: 1 }}>Naval flagship · d12 · Transport 4 units</div>
          </div>
        </div>
        <div style={{ padding: '8px 12px' }}>
          <div style={{ fontSize: 11, color: '#8a8070', fontStyle: 'italic', marginBottom: 8 }}>
            Deploys to adjacent water. Bombardment: +1 attack to adjacent units. Can blockade ports.
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {Object.entries(reaperDef).map(([k, v]) => {
              const icons = { gold: '🪙', wood: '🪵' };
              const has = (currentPlayer?.resources?.[k] ?? 0) >= v;
              return (
                <span key={k} style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'hsl(35,20%,22%)', color: has ? 'hsl(43,80%,65%)' : 'hsl(0,60%,60%)' }}>
                  {icons[k] || k} {v}
                </span>
              );
            })}
          </div>
          <button
            onClick={() => onRecruitReapership && onRecruitReapership(selHexId)}
            disabled={!canAfford}
            style={{
              width: '100%', padding: '8px', borderRadius: 4,
              cursor: canAfford ? 'pointer' : 'not-allowed',
              background: canAfford ? 'linear-gradient(135deg,#1a4a8a,#0a2a5a)' : '#1a1c22',
              border: `1px solid ${canAfford ? '#4488ff' : '#333'}`,
              color: canAfford ? '#88aaff' : '#444',
              fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700,
              opacity: canAfford ? 1 : 0.5,
            }}>
            ⛵ Recruit Reapership
          </button>
        </div>
      </div>
    </div>
  );
}