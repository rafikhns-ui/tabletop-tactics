import React, { useState } from 'react';

export default function MarketPanel({ currentPlayer, gameState, onPlaceOrder, onCancelOrder, onExecuteOrder }) {
  const [tab, setTab] = useState('orders'); // 'orders' | 'history'
  const [selectedResource, setSelectedResource] = useState('gold');
  const [orderType, setOrderType] = useState('buy'); // 'buy' | 'sell'
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');

  const marketLevel = currentPlayer.buildings?.market?.level || 0;
  const canTrade = marketLevel >= 2;

  if (!canTrade) {
    return (
      <div className="rounded p-4" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,28%)' }}>
        <div className="text-center text-sm" style={{ color: 'hsl(40,20%,60%)' }}>
          <div style={{ marginBottom: '8px' }}>🏪 Market Trading requires <span style={{ color: 'hsl(43,80%,60%)', fontWeight: 'bold' }}>Market Level 2</span></div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>Current level: {marketLevel}</div>
        </div>
      </div>
    );
  }

  const resources = ['gold', 'wood', 'wheat', 'stone'];
  const globalOrders = gameState.marketOrders || [];
  const myOrders = globalOrders.filter(o => o.playerId === currentPlayer.id && !o.completed);
  const marketPrices = gameState.marketPrices || {};
  
  // Calculate current market price based on order book imbalance
  const getMarketPrice = (resource) => {
    const buy = globalOrders.filter(o => o.resource === resource && o.type === 'buy' && !o.completed).reduce((s, o) => s + o.quantity, 0);
    const sell = globalOrders.filter(o => o.resource === resource && o.type === 'sell' && !o.completed).reduce((s, o) => s + o.quantity, 0);
    
    const basePrice = { gold: 1, wood: 2, wheat: 1.5, stone: 2.5 }[resource] || 1;
    const demandRatio = sell > 0 ? buy / sell : 1;
    const adjustedPrice = basePrice * (0.7 + demandRatio * 0.6); // Price scales from 0.7x to 1.3x base
    return Math.max(0.5, Math.round(adjustedPrice * 100) / 100);
  };

  const currentPrice = getMarketPrice(selectedResource);
  const playerHas = currentPlayer.resources?.[selectedResource] || 0;
  const buyOrderPrice = parseFloat(price) || currentPrice;
  const canPlace = (orderType === 'buy' && (currentPlayer.resources?.gold || 0) >= (parseInt(quantity) || 0) * buyOrderPrice)
    || (orderType === 'sell' && playerHas >= (parseInt(quantity) || 0));

  const handlePlaceOrder = () => {
    if (!canPlace) return;
    onPlaceOrder({
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      resource: selectedResource,
      type: orderType,
      quantity: parseInt(quantity) || 1,
      price: buyOrderPrice,
      timestamp: Date.now(),
    });
    setQuantity('1');
    setPrice('');
  };

  const s = { fontFamily: "'Cinzel',serif" };

  return (
    <div className="rounded p-2 space-y-3" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,28%)' }}>
      {/* Tabs */}
      <div className="flex gap-1">
        {['orders', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-1 rounded text-xs font-bold transition-all"
            style={{
              ...s,
              background: tab === t ? 'hsl(38,70%,28%)' : 'hsl(35,20%,22%)',
              border: tab === t ? '1px solid hsl(38,80%,50%)' : '1px solid hsl(35,20%,32%)',
              color: tab === t ? 'hsl(43,90%,80%)' : 'hsl(40,20%,55%)',
            }}>
            {t === 'orders' ? '📊 Orders' : '📜 History'}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="space-y-3">
          {/* Market Prices Overview */}
          <div className="rounded p-2" style={{ background: 'hsl(35,20%,21%)', border: '1px solid hsl(35,20%,30%)' }}>
            <div className="text-xs font-bold mb-2" style={{ color: 'hsl(43,80%,60%)', ...s }}>Market Prices</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {resources.map(r => {
                const price = getMarketPrice(r);
                const buy = globalOrders.filter(o => o.resource === r && o.type === 'buy' && !o.completed).length;
                const sell = globalOrders.filter(o => o.resource === r && o.type === 'sell' && !o.completed).length;
                return (
                  <div key={r} className="rounded p-1" style={{ background: 'hsl(35,20%,18%)', border: '1px solid hsl(35,20%,28%)' }}>
                    <div style={{ color: 'hsl(40,20%,65%)', marginBottom: '2px', fontWeight: 'bold' }}>
                      {{ gold: '🪙', wood: '🪵', wheat: '🌾', stone: '⛰️' }[r]} {price.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '10px', color: 'hsl(40,20%,50%)' }}>
                      Buy:{buy} | Sell:{sell}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Place Order */}
          <div className="rounded p-2" style={{ background: 'hsl(35,20%,21%)', border: '1px solid hsl(35,20%,30%)' }}>
            <div className="text-xs font-bold mb-2" style={{ color: 'hsl(43,80%,60%)', ...s }}>Place Order</div>
            <div className="space-y-2">
              <div className="flex gap-1">
                {['buy', 'sell'].map(t => (
                  <button key={t} onClick={() => setOrderType(t)}
                    className="flex-1 py-1 rounded text-xs font-bold transition-all"
                    style={{
                      ...s,
                      background: orderType === t ? 'hsl(38,70%,28%)' : 'hsl(35,20%,22%)',
                      border: orderType === t ? '1px solid hsl(38,80%,50%)' : '1px solid hsl(35,20%,32%)',
                      color: orderType === t ? 'hsl(43,90%,80%)' : 'hsl(40,20%,55%)',
                    }}>
                    {t === 'buy' ? '📥 Buy' : '📤 Sell'}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="block text-xs" style={{ color: 'hsl(40,20%,60%)', ...s }}>Resource</label>
                <select value={selectedResource} onChange={(e) => setSelectedResource(e.target.value)}
                  style={{
                    width: '100%', padding: '6px', background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)',
                    color: 'hsl(40,30%,80%)', borderRadius: 4, fontSize: 12,
                  }}>
                  {resources.map(r => (
                    <option key={r} value={r}>
                      {{ gold: '🪙 Gold', wood: '🪵 Wood', wheat: '🌾 Wheat', stone: '⛰️ Stone' }[r]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'hsl(40,20%,60%)' }}>Quantity</label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1"
                    style={{
                      width: '100%', padding: '6px', background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)',
                      color: 'hsl(40,30%,80%)', borderRadius: 4, fontSize: 12, boxSizing: 'border-box',
                    }} />
                  <div className="text-xs mt-1" style={{ color: 'hsl(40,20%,55%)' }}>
                    Have: {playerHas}
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'hsl(40,20%,60%)' }}>Price/Unit</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0.1" step="0.1"
                    placeholder={currentPrice.toFixed(2)}
                    style={{
                      width: '100%', padding: '6px', background: 'hsl(35,20%,20%)', border: '1px solid hsl(35,20%,30%)',
                      color: 'hsl(40,30%,80%)', borderRadius: 4, fontSize: 12, boxSizing: 'border-box',
                    }} />
                  <div className="text-xs mt-1" style={{ color: 'hsl(40,20%,55%)' }}>
                    Market: {currentPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              <button onClick={handlePlaceOrder} disabled={!canPlace}
                className="w-full py-1.5 rounded text-xs font-bold transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  ...s,
                  background: canPlace ? (orderType === 'buy' ? 'hsl(220,70%,30%)' : 'hsl(130,70%,30%)') : 'hsl(35,20%,22%)',
                  border: canPlace ? (orderType === 'buy' ? '1px solid hsl(220,80%,50%)' : '1px solid hsl(130,80%,50%)') : '1px solid hsl(35,20%,32%)',
                  color: canPlace ? 'hsl(40,30%,90%)' : 'hsl(40,20%,55%)',
                }}>
                {orderType === 'buy' ? '📥 Place Buy Order' : '📤 Place Sell Order'}
              </button>
            </div>
          </div>

          {/* My Orders */}
          <div className="rounded p-2" style={{ background: 'hsl(35,20%,21%)', border: '1px solid hsl(35,20%,30%)' }}>
            <div className="text-xs font-bold mb-2" style={{ color: 'hsl(43,80%,60%)', ...s }}>My Active Orders</div>
            {myOrders.length === 0 ? (
              <div className="text-xs text-center py-2" style={{ color: 'hsl(40,20%,55%)' }}>No active orders</div>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {myOrders.map(order => {
                  const icons = { gold: '🪙', wood: '🪵', wheat: '🌾', stone: '⛰️' };
                  return (
                    <div key={order.id} className="rounded p-1.5 flex items-center justify-between text-xs"
                      style={{ background: 'hsl(35,20%,18%)', border: `1px solid ${order.type === 'buy' ? 'hsl(220,60%,40%)' : 'hsl(130,60%,40%)'}` }}>
                      <div>
                        <span style={{ color: order.type === 'buy' ? 'hsl(220,80%,70%)' : 'hsl(130,80%,70%)', fontWeight: 'bold' }}>
                          {order.type === 'buy' ? '📥' : '📤'} {order.quantity}x {icons[order.resource]}
                        </span>
                        <div style={{ color: 'hsl(40,20%,55%)', fontSize: '11px' }}>
                          @ {order.price.toFixed(2)} each
                        </div>
                      </div>
                      <button onClick={() => onCancelOrder(order.id)}
                        className="px-2 py-0.5 rounded text-xs font-bold transition-all hover:opacity-80"
                        style={{ background: 'hsl(0,60%,30%)', border: '1px solid hsl(0,60%,50%)', color: 'hsl(0,80%,70%)' }}>
                        Cancel
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Book */}
          <div className="rounded p-2" style={{ background: 'hsl(35,20%,21%)', border: '1px solid hsl(35,20%,30%)' }}>
            <div className="text-xs font-bold mb-2" style={{ color: 'hsl(43,80%,60%)', ...s }}>Market Orders</div>
            {globalOrders.filter(o => !o.completed).length === 0 ? (
              <div className="text-xs text-center py-2" style={{ color: 'hsl(40,20%,55%)' }}>No active orders</div>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {globalOrders.filter(o => !o.completed).slice(0, 20).map(order => {
                  const icons = { gold: '🪙', wood: '🪵', wheat: '🌾', stone: '⛰️' };
                  return (
                    <div key={order.id} className="rounded p-1 text-xs flex items-center justify-between"
                      style={{ background: 'hsl(35,20%,18%)', border: `1px solid ${order.type === 'buy' ? 'hsl(220,50%,35%)' : 'hsl(130,50%,35%)'}` }}>
                      <div>
                        <span style={{ color: order.type === 'buy' ? 'hsl(220,70%,65%)' : 'hsl(130,70%,65%)', fontWeight: 'bold' }}>
                          {order.type === 'buy' ? 'Buy' : 'Sell'} {order.quantity}x {icons[order.resource]}
                        </span>
                        <div style={{ fontSize: '10px', color: 'hsl(40,20%,50%)' }}>
                          {order.playerName} @ {order.price.toFixed(2)} {order.type === 'sell' && currentPlayer.id !== order.playerId && (
                            <button onClick={() => onExecuteOrder(order.id)}
                              className="ml-1 px-1 py-0 rounded text-xs font-bold transition-all hover:opacity-80"
                              style={{ background: 'hsl(130,70%,35%)', border: '1px solid hsl(130,80%,50%)', color: 'hsl(130,80%,80%)' }}>
                              Buy
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="text-xs text-center py-4" style={{ color: 'hsl(40,20%,60%)' }}>
          📊 Market history coming soon
        </div>
      )}
    </div>
  );
}