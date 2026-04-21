import React, { useState } from 'react';

export default function SilverUnionMenu({ gameState, currentPlayer, setGameState, addMessage, onClose }) {
  const [activeTab, setActiveTab] = useState('loans'); // 'loans' | 'mercenaries' | 'heroes' | 'trade'
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loanAmount, setLoanAmount] = useState(10);
  const [tradeAmount, setTradeAmount] = useState(5);
  const [selectedTradeFrom, setSelectedTradeFrom] = useState('gold');
  const [selectedTradeTo, setSelectedTradeTo] = useState('wood');

  if (!gameState || !currentPlayer) return null;

  const grandMarketLevel = currentPlayer.buildings?.grand_market?.level || 0;
  const hasGrandMarketL3 = grandMarketLevel >= 3;

  const silverUnion = {
    id: 'silver_union',
    name: 'Silver Union',
    color: '#bdc3c7',
    emoji: '🏦',
  };

  // Available mercenary units (all elite)
  const mercenaryUnits = [
    { id: 'elite_guard', name: 'Elite Guard', cost: 7, emoji: '⚡', description: 'Powerful elite unit' },
    { id: 'elite_cavalry', name: 'Elite Cavalry', cost: 9, emoji: '🐴', description: 'Fast elite cavalry' },
    { id: 'elite_archer', name: 'Elite Archer', cost: 8, emoji: '🏹', description: 'Ranged elite unit' },
    { id: 'elite_siege', name: 'Elite Siege Unit', cost: 12, emoji: '🏗️', description: 'Siege specialist' },
  ];

  // Available mercenary heroes
  const mercenaryHeroes = [
    { id: 'sellsword_vance', name: 'Sellsword Vance', cost: 12, type: 'Warrior', ability: 'Mercenary Rush — attacks twice if paid double' },
    { id: 'spymistress_lyra', name: 'Spymistress Lyra', cost: 10, type: 'Spy', ability: 'Sabotage — disables 1 enemy building for 2 turns' },
    { id: 'guildmaster_aurion', name: 'Guildmaster Aurion', cost: 11, type: 'Diplomat', ability: 'Golden Bribe — convert 1 enemy unit to your side' },
  ];

  // Loan system
  const loanTerms = [
    { turns: 5, interestRate: 0.10, emoji: '📋' },
    { turns: 10, interestRate: 0.15, emoji: '📋' },
    { turns: 15, interestRate: 0.20, emoji: '📋' },
  ];

  // Unfavorable trade rates (disadvantage unless card says otherwise)
  const tradeRates = {
    'gold-wood': { give: 2, get: 1 },
    'gold-wheat': { give: 2, get: 1 },
    'gold-stone': { give: 2.5, get: 1 },
    'wood-gold': { give: 3, get: 1 },
    'wood-wheat': { give: 2, get: 1 },
    'wheat-gold': { give: 3, get: 1 },
    'wheat-wood': { give: 2, get: 1 },
  };

  const playerLoans = currentPlayer.loans || [];
  const totalDebt = playerLoans.reduce((sum, loan) => sum + loan.amount + (loan.amount * loan.interestRate), 0);

  const handleTakeLoan = (loanTerm) => {
    const newLoan = {
      id: Date.now(),
      amount: loanAmount,
      turnsRemaining: loanTerm.turns,
      interestRate: loanTerm.interestRate,
      takenAtTurn: gameState.turn,
    };
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === currentPlayer.id 
          ? { ...p, loans: [...(p.loans || []), newLoan], resources: { ...p.resources, gold: (p.resources.gold || 0) + loanAmount } }
          : p
      ),
    }));
    addMessage(`🏦 Silver Union loan of ${loanAmount} Gold received! Repay in ${loanTerm.turns} turns or face war!`);
    setSelectedLoan(null);
  };

  const handleHireMercenary = (unit) => {
    if ((currentPlayer.resources?.gold || 0) < unit.cost) return;
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === currentPlayer.id 
          ? { 
              ...p, 
              pendingUnits: [...(p.pendingUnits || []), 'elite'],
              resources: { ...p.resources, gold: (p.resources.gold || 0) - unit.cost }
            }
          : p
      ),
    }));
    addMessage(`⚔️ ${unit.name} mercenary hired! Deploy them from your territories.`);
  };

  const handleHireMercenaryHero = (hero) => {
    if ((currentPlayer.resources?.gold || 0) < hero.cost) return;
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === currentPlayer.id 
          ? { 
              ...p, 
              heroes: [...(p.heroes || []), hero.id],
              resources: { ...p.resources, gold: (p.resources.gold || 0) - hero.cost }
            }
          : p
      ),
    }));
    addMessage(`⭐ ${hero.name} mercenary hero hired!`);
  };

  const handleTrade = () => {
    const rateKey = `${selectedTradeFrom}-${selectedTradeTo}`;
    const rate = tradeRates[rateKey];
    if (!rate) return;

    const giveAmount = tradeAmount * rate.give;
    const getAmount = tradeAmount * rate.get;

    if ((currentPlayer.resources?.[selectedTradeFrom] || 0) < giveAmount) return;

    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === currentPlayer.id 
          ? { 
              ...p,
              resources: {
                ...p.resources,
                [selectedTradeFrom]: (p.resources[selectedTradeFrom] || 0) - giveAmount,
                [selectedTradeTo]: (p.resources[selectedTradeTo] || 0) + getAmount,
              }
            }
          : p
      ),
    }));
    addMessage(`📦 Silver Union trade: gave ${giveAmount} ${selectedTradeFrom}, got ${getAmount} ${selectedTradeTo}`);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1c22, #14161c)',
        border: '1px solid #d4a853', borderRadius: 8,
        maxWidth: '90vw', maxHeight: '90vh', width: '800px',
        display: 'flex', flexDirection: 'column',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid #2a2520',
          fontFamily: "'Cinzel', serif",
        }}>
          <h2 style={{ color: '#d4a853', fontSize: 18, fontWeight: 700, margin: 0 }}>
            {silverUnion.emoji} Silver Union Merchant House
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#d4a853', fontSize: 24,
            cursor: 'pointer',
          }}>×</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #2a2520', background: '#0d0f14' }}>
          {[
            { id: 'loans', icon: '💰', label: 'Loans' },
            { id: 'trade', icon: '📦', label: 'Trade' },
            { id: 'mercenaries', icon: '⚔️', label: 'Mercenaries' },
            { id: 'heroes', icon: '⭐', label: 'Heroes' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1, padding: '12px', fontSize: 12, fontFamily: "'Cinzel', serif", fontWeight: 600,
                background: activeTab === t.id ? '#1e1a12' : 'transparent',
                color: activeTab === t.id ? '#d4a853' : '#666',
                border: 'none', borderBottom: activeTab === t.id ? '2px solid #d4a853' : '2px solid transparent',
                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', color: '#c8c0b0', fontSize: 13 }}>
          {!hasGrandMarketL3 && (
            <div style={{ padding: 16, background: 'rgba(200,50,50,0.12)', border: '1px solid #8a3030', borderRadius: 6, marginBottom: 16 }}>
              <div style={{ color: '#f87171', fontFamily: "'Cinzel', serif", fontWeight: 700, marginBottom: 6 }}>
                🔒 Grand Market Level 3 Required
              </div>
              <div style={{ fontSize: 12, color: '#888' }}>
                You must upgrade your Grand Market to Level 3 to unlock trade with the Silver Union.
                Currently: Level {grandMarketLevel}/3.
              </div>
            </div>
          )}
          {/* Loans Tab */}
          {activeTab === 'loans' && (
            <div>
              <div style={{ marginBottom: 20, padding: 12, background: 'rgba(212,168,83,0.08)', border: '1px solid #2a2520', borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: '#d4a853', fontFamily: "'Cinzel', serif", fontWeight: 700, marginBottom: 8 }}>
                  CURRENT DEBT
                </div>
                <div style={{ fontSize: 14, color: '#f0c040', fontWeight: 600 }}>
                  💰 {totalDebt.toFixed(0)} Gold
                </div>
                {playerLoans.length > 0 && (
                  <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
                    Active loans: {playerLoans.length}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: '#d4a853', fontFamily: "'Cinzel', serif", fontWeight: 700, marginBottom: 12 }}>
                  AVAILABLE LOANS
                </div>
                
                {selectedLoan === null ? (
                  // Bare <div> — previous `style={{ space: 'y-2' }}` was a
                  // Tailwind utility misplaced in inline styles (invalid CSS,
                  // silent no-op). The child buttons already supply their
                  // own vertical spacing via marginBottom.
                  <div>
                    {loanTerms.map((term, i) => (
                      <button key={i} onClick={() => setSelectedLoan(term)}
                        style={{
                          width: '100%', padding: 12, marginBottom: 8, background: 'hsl(35,20%,21%)', 
                          border: '1px solid hsl(35,20%,30%)', borderRadius: 6, cursor: 'pointer',
                          color: '#c8c0b0', textAlign: 'left', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'hsl(38,70%,28%)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'hsl(35,20%,21%)'}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {term.emoji} {term.turns}-Turn Loan
                        </div>
                        <div style={{ fontSize: 11, color: '#888' }}>
                          Interest Rate: {(term.interestRate * 100).toFixed(0)}% • Flexible amounts
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: 12, background: 'hsl(35,20%,21%)', border: '1px solid hsl(35,20%,30%)', borderRadius: 6 }}>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>
                        Loan Amount (Gold)
                      </label>
                      <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(parseInt(e.target.value) || 0)}
                        style={{
                          width: '100%', padding: '8px', background: '#0d0f14', border: '1px solid #2a2520',
                          color: '#c8c0b0', borderRadius: 4, fontSize: 12,
                        }} />
                    </div>
                    <div style={{ marginBottom: 12, fontSize: 11, color: '#888' }}>
                      <div>Repayment: {selectedLoan.turns} turns</div>
                      <div style={{ color: '#f0c040', fontWeight: 600 }}>
                        Total to repay: {(loanAmount + (loanAmount * selectedLoan.interestRate)).toFixed(0)} Gold
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => {
                        // If player fails to repay, Silver Union declares war
                        handleTakeLoan(selectedLoan);
                      }}
                        style={{
                          flex: 1, padding: '8px', background: '#2a5a2a', border: '1px solid #5a9a5a',
                          color: '#9afa9a', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                        }}>
                        ✓ Accept Loan
                      </button>
                      <button onClick={() => setSelectedLoan(null)}
                        style={{
                          flex: 1, padding: '8px', background: '#3a3a3a', border: '1px solid #555',
                          color: '#999', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                        }}>
                        ✗ Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ padding: 12, background: 'rgba(212,168,83,0.1)', border: '1px solid #8a6a30', borderRadius: 6, fontSize: 11 }}>
                <div style={{ color: '#d4a853', fontWeight: 600, marginBottom: 6 }}>⚠️ WARNING</div>
                <div style={{ color: '#888' }}>
                  Failure to repay loans on time will result in the Silver Union declaring war on your nation. All mercenaries will be withdrawn.
                </div>
              </div>
            </div>
          )}

          {/* Trade Tab */}
          {activeTab === 'trade' && !hasGrandMarketL3 && null}
          {activeTab === 'trade' && hasGrandMarketL3 && (
           <div>
             <div style={{ marginBottom: 20, padding: 12, background: 'rgba(212,168,83,0.1)', border: '1px solid #8a6a30', borderRadius: 6, fontSize: 11 }}>
               <div style={{ color: '#d4a853', fontWeight: 600, marginBottom: 4 }}>⚠️ UNFAVORABLE RATES</div>
               <div style={{ color: '#888' }}>
                 The Silver Union charges premium rates on all trades. Rates are 30-50% worse than fair value unless you have special cards.
               </div>
             </div>

             <div style={{ marginBottom: 20, padding: 12, background: 'hsl(35,20%,21%)', border: '1px solid hsl(35,20%,30%)', borderRadius: 6 }}>
               <div style={{ marginBottom: 12 }}>
                 <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Give:</label>
                 <select value={selectedTradeFrom} onChange={(e) => setSelectedTradeFrom(e.target.value)}
                   style={{ width: '100%', padding: '8px', background: '#0d0f14', border: '1px solid #2a2520', color: '#c8c0b0', borderRadius: 4, marginBottom: 8 }}>
                   <option value="gold">Gold</option>
                   <option value="wood">Wood</option>
                   <option value="wheat">Wheat</option>
                   <option value="stone">Stone</option>
                 </select>
                 <input type="number" value={tradeAmount} onChange={(e) => setTradeAmount(parseInt(e.target.value) || 1)} min="1"
                   style={{ width: '100%', padding: '8px', background: '#0d0f14', border: '1px solid #2a2520', color: '#c8c0b0', borderRadius: 4 }} />
               </div>

               <div style={{ marginBottom: 12, padding: 12, background: '#0d0f14', borderRadius: 4 }}>
                 <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Current Offer:</div>
                 {(() => {
                   const rateKey = `${selectedTradeFrom}-${selectedTradeTo}`;
                   const rate = tradeRates[rateKey];
                   if (!rate) return <div style={{ color: '#f0c040' }}>Select valid pair</div>;
                   const giveAmount = tradeAmount * rate.give;
                   const getAmount = tradeAmount * rate.get;
                   return (
                     <div style={{ color: '#f0c040', fontWeight: 600 }}>
                       Give: {giveAmount.toFixed(1)} {selectedTradeFrom} → Get: {getAmount.toFixed(1)} {selectedTradeTo}
                     </div>
                   );
                 })()}
               </div>

               <div style={{ marginBottom: 12 }}>
                 <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Receive:</label>
                 <select value={selectedTradeTo} onChange={(e) => setSelectedTradeTo(e.target.value)}
                   style={{ width: '100%', padding: '8px', background: '#0d0f14', border: '1px solid #2a2520', color: '#c8c0b0', borderRadius: 4 }}>
                   <option value="gold">Gold</option>
                   <option value="wood">Wood</option>
                   <option value="wheat">Wheat</option>
                   <option value="stone">Stone</option>
                 </select>
               </div>

               <button onClick={handleTrade}
                 style={{
                   width: '100%', padding: '8px', background: '#2a5a2a', border: '1px solid #5a9a5a',
                   color: '#9afa9a', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                 }}>
                 ✓ Execute Trade
               </button>
             </div>
           </div>
          )}

          {/* Mercenaries Tab */}
          {activeTab === 'mercenaries' && !hasGrandMarketL3 && null}
          {activeTab === 'mercenaries' && hasGrandMarketL3 && (
            <div>
              <div style={{ marginBottom: 20 }}>
                {mercenaryUnits.map((unit, i) => {
                  const canAfford = (currentPlayer.resources?.gold || 0) >= unit.cost;
                  return (
                    <div key={i} style={{
                      padding: 12, marginBottom: 8, background: 'hsl(35,20%,21%)', 
                      border: '1px solid hsl(35,20%,30%)', borderRadius: 6,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {unit.emoji} {unit.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#888' }}>
                          {unit.description}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#f0c040', fontWeight: 600, marginBottom: 6 }}>
                          {unit.cost} Gold
                        </div>
                        <button onClick={() => canAfford && handleHireMercenary(unit)}
                          disabled={!canAfford}
                          style={{
                            padding: '6px 12px', background: canAfford ? '#2a5a2a' : '#3a3a3a',
                            border: `1px solid ${canAfford ? '#5a9a5a' : '#555'}`,
                            color: canAfford ? '#9afa9a' : '#666',
                            borderRadius: 4, cursor: canAfford ? 'pointer' : 'not-allowed',
                            fontSize: 11, fontWeight: 600, opacity: canAfford ? 1 : 0.5
                          }}>
                          Hire
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: 12, background: 'rgba(212,168,83,0.1)', border: '1px solid #8a6a30', borderRadius: 6, fontSize: 11 }}>
                <div style={{ color: '#d4a853', fontWeight: 600, marginBottom: 4 }}>💡 INFO</div>
                <div style={{ color: '#888' }}>
                  All mercenary units are elite units with superior combat abilities. They are immediately available for deployment.
                </div>
              </div>
            </div>
          )}

          {/* Heroes Tab */}
          {activeTab === 'heroes' && !hasGrandMarketL3 && null}
          {activeTab === 'heroes' && hasGrandMarketL3 && (
            <div>
              <div style={{ marginBottom: 20 }}>
                {mercenaryHeroes.map((hero, i) => {
                  const canAfford = (currentPlayer.resources?.gold || 0) >= hero.cost;
                  const alreadyHired = currentPlayer.heroes?.includes(hero.id);
                  return (
                    <div key={i} style={{
                      padding: 12, marginBottom: 8, background: 'hsl(35,20%,21%)', 
                      border: '1px solid hsl(35,20%,30%)', borderRadius: 6,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            ⭐ {hero.name}
                          </div>
                          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                            {hero.type}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 12, color: '#f0c040', fontWeight: 600 }}>
                          {hero.cost} Gold
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
                        {hero.ability}
                      </div>
                      <button onClick={() => !alreadyHired && canAfford && handleHireMercenaryHero(hero)}
                        disabled={!canAfford || alreadyHired}
                        style={{
                          width: '100%', padding: '6px 12px', 
                          background: alreadyHired ? '#3a3a3a' : canAfford ? '#2a5a2a' : '#3a3a3a',
                          border: `1px solid ${alreadyHired ? '#555' : canAfford ? '#5a9a5a' : '#555'}`,
                          color: alreadyHired ? '#666' : canAfford ? '#9afa9a' : '#666',
                          borderRadius: 4, cursor: alreadyHired || !canAfford ? 'not-allowed' : 'pointer',
                          fontSize: 11, fontWeight: 600, opacity: alreadyHired || !canAfford ? 0.5 : 1
                        }}>
                        {alreadyHired ? '✓ Hired' : 'Hire Hero'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}