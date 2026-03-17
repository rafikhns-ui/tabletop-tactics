import React from 'react';
import { UNIT_DEFS } from './ardoniaData';

export default function UnitBreakdown({ currentPlayer, gameState }) {
  const units = Object.values(UNIT_DEFS);
  
  const canAffordUnit = (unit) => {
    if (!currentPlayer) return false;
    return Object.entries(unit.cost).every(([resource, amount]) => 
      (currentPlayer.resources[resource] ?? 0) >= amount
    );
  };

  const hasRequiredBuilding = (unit) => {
    if (!currentPlayer) return false;
    return currentPlayer.buildings[unit.requires];
  };

  return (
    <div className="space-y-2 p-2">
      <div className="flex items-center justify-between px-2 py-1">
        <div className="text-xs font-bold" style={{ color: 'hsl(43,80%,70%)', fontFamily: "'Cinzel',serif" }}>
          UNIT TYPES
        </div>
        <div className="text-xs" style={{ color: 'hsl(40,20%,60%)' }}>
          {currentPlayer?.troopsToDeploy || 0} troops available
        </div>
      </div>
      
      <div className="grid gap-2">
        {units.map(unit => {
          const affordable = canAffordUnit(unit);
          const hasBuilding = hasRequiredBuilding(unit);
          const canDeploy = affordable && hasBuilding;
          
          return (
            <div 
              key={unit.id}
              className="p-3 rounded-lg border transition-all"
              style={{
                background: canDeploy ? 'hsl(35,25%,19%)' : 'hsl(35,25%,14%)',
                borderColor: canDeploy ? 'hsl(43,70%,45%)' : 'hsl(35,20%,25%)',
                opacity: canDeploy ? 1 : 0.6,
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{unit.emoji}</span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: 'hsl(40,30%,90%)' }}>
                      {unit.name}
                    </div>
                    <div className="text-xs" style={{ color: canDeploy ? 'hsl(43,80%,70%)' : 'hsl(40,20%,50%)' }}>
                      {!hasBuilding ? `⚠️ Missing ${unit.requires}` : 'Ready'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold" style={{ color: 'hsl(43,80%,70%)' }}>
                    🎲 {unit.dice}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 mb-2 text-xs">
                <div style={{ color: 'hsl(40,20%,60%)' }}>
                  <span style={{ color: 'hsl(43,80%,70%)' }}>Move:</span> {unit.movementRange} hex
                </div>
                <div style={{ color: 'hsl(40,20%,60%)' }}>
                  <span style={{ color: 'hsl(43,80%,70%)' }}>Capture:</span> {unit.canCapture ? '✓' : '✗'}
                </div>
              </div>

              <div className="mb-2 text-xs" style={{ color: 'hsl(40,20%,70%)' }}>
                {unit.description}
              </div>

              <div className="flex gap-2 flex-wrap text-xs">
                {Object.entries(unit.cost).map(([resource, amount]) => {
                  const have = currentPlayer?.resources[resource] ?? 0;
                  const canAfford = have >= amount;
                  return (
                    <div 
                      key={resource} 
                      style={{ 
                        background: canAfford ? 'rgba(100,255,100,0.1)' : 'rgba(255,100,100,0.1)', 
                        padding: '4px 6px', 
                        borderRadius: '3px', 
                        color: canAfford ? 'hsl(120,80%,70%)' : 'hsl(0,80%,70%)',
                        border: `1px solid ${canAfford ? 'rgba(100,255,100,0.3)' : 'rgba(255,100,100,0.3)'}`,
                      }}
                    >
                      {resource === 'gold' && '🪙'} {resource === 'wheat' && '🌾'} {resource === 'wood' && '🪵'} {have}/{amount}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}