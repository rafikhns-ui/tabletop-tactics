// Extracted card play logic to keep Game.jsx under size limits
import { applyInstantCardEffects } from '../components/game/cardEffects';

export function buildPlayCardHandler({ setGameState, setCardPlayAnnouncement, addMessage, addLog, getCurrentPlayer }) {
  return (card) => {
    const currentPlayer = getCurrentPlayer();
    setGameState(prev => {
      const player = prev.players.find(p => p.id === currentPlayer.id);
      const newResources = { ...player.resources };
      let newIp = player.ip ?? 0;
      let newSp = player.sp ?? 0;
      for (const [k, v] of Object.entries(card.cost || {})) {
        if (k === 'ip') newIp -= v;
        else if (k === 'sp') newSp -= v;
        else newResources[k] = (newResources[k] || 0) - v;
      }

      let cardEffects = { ...(player.cardEffects || {}) };
      const CE = (id, effect) => { cardEffects[id] = effect; };

      if (card.id === 'faith_surge')            { newSp = Math.min(10, newSp + 3); }
      else if (card.id === 'peace_treaty')       { newIp += 1; CE('peace_treaty', { duration: 3, active: true }); }
      else if (card.id === 'embargo')            { CE('embargo', { duration: 2, active: true }); }
      else if (card.id === 'trade_diplomacy')    { newIp += 1; CE('trade_diplomacy', { duration: 3, active: true }); }
      else if (card.id === 'merchant_fleet')     { CE('merchant_fleet', { duration: 2, active: true }); }
      else if (card.id === 'exclusive_contract') { CE('exclusive_contract', { duration: 3, active: true }); }
      else if (card.id === 'tariff_deal')        { CE('tariff_deal', { duration: 3, active: true, tariffBonus: 1 }); }
      else if (card.id === 'wood_monopoly')      { CE('wood_monopoly', { duration: 3, active: true, resource: 'wood' }); }
      else if (card.id === 'wheat_monopoly')     { CE('wheat_monopoly', { duration: 3, active: true, resource: 'wheat' }); }
      else if (card.id === 'trade_corridor')     { CE('trade_corridor', { duration: 2, active: true }); }
      else if (card.id === 'merchant_guild')     { CE('merchant_guild', { duration: Infinity, active: true }); }
      else if (card.id === 'economic_boom')      { CE('economic_boom', { duration: 3, active: true, goldBonus: 2 }); }
      else if (card.id === 'war_profiteering')   { CE('war_profiteering', { duration: Infinity, active: true }); }
      else if (card.id === 'economic_manipulation') { CE('economic_manipulation', { duration: 1, active: true }); }
      else if (card.id === 'tariff_war')         { CE('tariff_war', { duration: 1, active: true }); }
      else if (card.id === 'slave_trade')        { CE('slave_trade', { duration: 3, active: true }); }
      else if (card.id === 'debt_forgiveness')   { CE('debt_forgiveness', { duration: 1, active: true }); }
      else if (card.id === 'luxury_tax')         { CE('luxury_tax', { duration: 1, active: true }); }
      else if (card.id === 'forced_tribute')     { CE('forced_tribute', { duration: 1, active: true }); }
      else if (card.id === 'royal_marriage')     { CE('royal_marriage', { duration: 3, active: true }); }
      else if (card.id === 'allied_barracks')    { newIp += 1; CE('allied_barracks', { duration: 1, active: true }); }
      else if (card.id === 'diplomatic_favor')   { newIp += 3; }
      else if (card.id === 'non_aggression_pact'){ newIp += 1; CE('non_aggression_pact', { duration: 2, active: true }); }
      else if (card.id === 'spiritual_pilgrimage') { newSp += 3; }
      else if (card.id === 'holy_shield')        { newSp += 1; CE('holy_shield', { duration: 1, active: true }); }
      else if (card.id === 'ritual_of_summoning') { newSp += 1; CE('ritual_of_summoning', { duration: 1, active: true }); }
      else if (card.id === 'temple_blessing')    { CE('temple_blessing', { duration: 1, active: true }); }
      else if (card.id === 'mystic_barrier')     { newSp += 1; CE('mystic_barrier', { duration: 1, active: true }); }
      else if (card.id === 'prophets_vision')    { newSp += 1; CE('prophets_vision', { duration: 1, active: true }); }
      else if (card.id === 'wrath_of_divine')    { newSp += 2; CE('wrath_of_divine', { duration: 1, active: true }); }
      else if (card.id === 'avatars_echo')       { newSp -= 1; CE('avatars_echo', { duration: 1, active: true }); }
      else if (card.id === 'sanctified_ground')  { CE('sanctified_ground', { duration: 1, active: true }); }
      else if (card.id === 'echoes_of_prophecy') { CE('echoes_of_prophecy', { duration: 1, active: true }); }

      const newCards = (player.actionCards || []).filter(id => id !== card.id);
      const newPlayer = { ...player, resources: newResources, ip: newIp, sp: newSp, actionCards: newCards, cardEffects };
      const baseState = { ...prev, players: prev.players.map(p => p.id === currentPlayer.id ? newPlayer : p) };
      const { newPlayers, newHexes } = applyInstantCardEffects(card, baseState, currentPlayer.id);
      return { ...baseState, players: newPlayers, hexes: newHexes };
    });
    setCardPlayAnnouncement({ card, playerName: currentPlayer.name, playerColor: currentPlayer.color });
    addMessage(`🃏 Played ${card.name}: ${card.effect}`);
    addLog('card', `Played card: ${card.name}`, card.effect, 'Action');
  };
}