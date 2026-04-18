// ── Card effect application logic ──
// Called inside setGameState updater in handlePlayCard

export function applyInstantCardEffects(card, prev, currentPlayerId) {
  let newPlayers = prev.players;
  let newHexes = prev.hexes;

  if (card.id === 'forced_tribute') {
    // Take up to 3 gold from the opponent with least gold
    const target = newPlayers.filter(p => p.id !== currentPlayerId)
      .sort((a, b) => (a.resources?.gold || 0) - (b.resources?.gold || 0))[0];
    if (target) {
      const take = Math.min(3, target.resources?.gold || 0);
      newPlayers = newPlayers.map(p => {
        if (p.id === target.id) return { ...p, resources: { ...p.resources, gold: (p.resources.gold || 0) - take } };
        if (p.id === currentPlayerId) return { ...p, resources: { ...p.resources, gold: (p.resources.gold || 0) + take } };
        return p;
      });
    }
  } else if (card.id === 'wrath_of_divine') {
    // Deal 1d6 damage to units in a random enemy hex
    const enemyEntries = Object.entries(newHexes || {}).filter(([, h]) => h.owner && h.owner !== currentPlayerId && (h.units || []).length > 0);
    if (enemyEntries.length > 0) {
      const [tHexId, tHex] = enemyEntries[Math.floor(Math.random() * enemyEntries.length)];
      const dmg = Math.floor(Math.random() * 6) + 1;
      let rem = dmg;
      const newUnits = (tHex.units || [])
        .map(u => { const take = Math.min(u.count, rem); rem -= take; return { ...u, count: u.count - take }; })
        .filter(u => u.count > 0);
      newHexes = { ...newHexes, [tHexId]: { ...tHex, units: newUnits } };
    }
  } else if (card.id === 'luxury_tax') {
    // Players with >10 gold pay 2 to caster
    let taxCollected = 0;
    newPlayers = newPlayers.map(p => {
      if (p.id === currentPlayerId) return p;
      if ((p.resources?.gold || 0) > 10) {
        taxCollected += 2;
        return { ...p, resources: { ...p.resources, gold: (p.resources.gold || 0) - 2 } };
      }
      return p;
    });
    newPlayers = newPlayers.map(p =>
      p.id === currentPlayerId ? { ...p, resources: { ...p.resources, gold: (p.resources.gold || 0) + taxCollected } } : p
    );
  } else if (card.id === 'famine') {
    // Instant famine: all players lose 2 wheat
    newPlayers = newPlayers.map(p => ({ ...p, resources: { ...p.resources, wheat: Math.max(0, (p.resources?.wheat || 0) - 2) } }));
  } else if (card.id === 'economic_manipulation') {
    // Force weakest opponent to trade a resource at 2-for-1 disadvantage (simulate as -2 wheat)
    const target = newPlayers.filter(p => p.id !== currentPlayerId)
      .sort((a, b) => (a.resources?.gold || 0) - (b.resources?.gold || 0))[0];
    if (target) {
      newPlayers = newPlayers.map(p =>
        p.id === target.id ? { ...p, resources: { ...p.resources, wheat: Math.max(0, (p.resources?.wheat || 0) - 2) } } : p
      );
    }
  }

  return { newPlayers, newHexes };
}

// Returns combat bonus from active card effects for a player
export function getPlayerCombatCardBonus(player) {
  const fx = player?.cardEffects || {};
  let attackBonus = 0, defenseBonus = 0;
  if (fx.rally?.active)          attackBonus  += 2;
  if (fx.holy_shield?.active)    defenseBonus += 3;
  if (fx.divine_shield?.active)  defenseBonus += 3;
  if (fx.sanctified_ground?.active) defenseBonus += 1;
  return { attackBonus, defenseBonus };
}