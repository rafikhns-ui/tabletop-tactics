import React, { useState } from 'react';
import { AVATARS } from './ardoniaData';

function CostTag({ cost, resources }) {
  return (
    <div className="flex gap-1 flex-wrap mt-1">
      {Object.entries(cost || {}).map(([k, v]) => {
        const icons = { gold: '🪙', wood: '🪵', wheat: '🌾', ip: '💬', sp: '✨', crystals: '💠', militaryUnit: '⚔️' };
        const has = (resources[k] ?? 0) >= v;
        return (
          <span key={k} className="text-xs px-1 rounded" style={{ background: 'hsl(35,20%,22%)', color: has ? 'hsl(43,80%,65%)' : 'hsl(0,60%,60%)' }}>
            {icons[k] || k} {v}
          </span>
        );
      })}
    </div>
  );
}

export default function AvatarPanel({ currentPlayer, onSummon }) {
  const [previewImage, setPreviewImage] = useState(null);
  const { resources, factionId } = currentPlayer;
  const factionAvatars = AVATARS[factionId] || [];

  const canAfford = (cost) => {
    return Object.entries(cost || {}).every(([k, v]) => (resources[k] ?? 0) >= v);
  };

  const s = { fontFamily: "'Cinzel',serif" };

  return (
    <div className="p-2 space-y-1.5 relative">
      {factionAvatars.length === 0 && (
        <div className="text-xs text-center opacity-40 py-4" style={{ color: 'hsl(40,20%,60%)' }}>
          No avatars available for your faction
        </div>
      )}
      {factionAvatars.map(avatar => {
        const affordable = canAfford(avatar.cost);
        return (
          <div
            key={avatar.id}
            className="rounded p-2 transition-all cursor-pointer"
            onMouseEnter={() => avatar.image && setPreviewImage(avatar.image)}
            onMouseLeave={() => setPreviewImage(null)}
            style={{
              background: 'hsl(35,20%,21%)',
              border: '1px solid hsl(35,20%,30%)',
            }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold" style={{ ...s, color: 'hsl(40,30%,80%)' }}>
                  {avatar.emoji} {avatar.name}
                </div>
                <div className="text-xs opacity-60 mt-0.5" style={{ color: 'hsl(43,70%,50%)' }}>
                  {avatar.tier} • Duration: {avatar.duration} turns
                </div>
              </div>
              <button
                onClick={() => onSummon(avatar.id)}
                disabled={!affordable}
                className="text-xs px-2 py-0.5 rounded font-bold transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  ...s,
                  background: 'hsl(38,70%,30%)',
                  border: '1px solid hsl(38,80%,50%)',
                  color: 'hsl(43,90%,80%)',
                }}>
                Summon
              </button>
            </div>
            <div className="text-xs mt-1 opacity-55" style={{ color: 'hsl(40,20%,65%)' }}>
              <strong>Passive:</strong> {avatar.passive}
            </div>
            <div className="text-xs mt-1 opacity-55" style={{ color: 'hsl(40,20%,65%)' }}>
              <strong>Active:</strong> {avatar.active}
            </div>
            <CostTag cost={avatar.cost} resources={resources} />
          </div>
        );
      })}

      {previewImage && (
        <div className="fixed pointer-events-none z-50" style={{ top: '50%', right: '2rem', transform: 'translateY(-50%)' }}>
          <img src={previewImage} alt="Avatar preview" className="w-96 h-auto rounded-sm shadow-2xl border-4" style={{ borderColor: 'hsl(43,90%,55%)', boxShadow: '0 0 40px hsl(43,90%,55%)50' }} />
        </div>
      )}
    </div>
  );
}