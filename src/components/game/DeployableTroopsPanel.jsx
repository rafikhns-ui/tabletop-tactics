import React from 'react';
import { UNIT_DEFS } from './ardoniaData';

export default function DeployableTroopsPanel({ phase }) {
  if (phase !== 'deploy') return null;

  const unitTypes = ['infantry', 'cavalry', 'ranged', 'siege'];

  return (
    <div className="border-t border-border p-2">
      <div className="text-xs font-bold mb-2" style={{ color: 'hsl(43,80%,55%)', fontFamily: "'Cinzel',serif" }}>
        DEPLOYABLE TROOPS
      </div>
      <div className="grid grid-cols-2 gap-2">
        {unitTypes.map(type => {
          const def = UNIT_DEFS[type];
          if (!def) return null;
          return (
            <div key={type} className="p-2 rounded" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,28%)' }}>
              <div className="text-xs font-bold" style={{ color: 'hsl(43,80%,65%)', fontFamily: "'Cinzel',serif" }}>
                {def.name}
              </div>
              <div className="text-xs mt-1 space-y-0.5" style={{ color: 'hsl(40,20%,60%)' }}>
                <div>ATK: {def.attack} DEF: {def.defense}</div>
                <div>Cost: {def.cost?.gold || 0}g {def.cost?.wheat || 0}w</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}