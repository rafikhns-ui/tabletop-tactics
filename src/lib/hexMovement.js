// Hex-based movement calculation with water-only support

export const getReachableHexes = (fromHexId, selectedUnits, gameState) => {
  const isWaterOnly = selectedUnits?.some(u => u.type === 'naval' || u.name === 'Infamous Reapership' || u.name === 'Reapership');
  const visited = new Set([fromHexId]);
  const reachable = new Set();
  const queue = [{ hexId: fromHexId, dist: 0 }];
  const MAX_DIST = 3; // max movement range

  while (queue.length > 0) {
    const { hexId, dist } = queue.shift();
    if (dist > MAX_DIST) continue;
    reachable.add(hexId);

    const [col, row] = hexId.split(',').map(Number);
    const even = col % 2 === 0;
    const neighbors = [
      [col+1, even ? row-1 : row], [col+1, even ? row : row+1],
      [col-1, even ? row-1 : row], [col-1, even ? row : row+1],
      [col, row-1], [col, row+1],
    ].map(([c, r]) => `${c},${r}`);

    neighbors.forEach(nId => {
      if (visited.has(nId)) return;
      visited.add(nId);
      const nHex = gameState?.hexes?.[nId];
      if (!nHex) return;

      // Water-only: can ONLY move to water hexes
      if (isWaterOnly && nHex.type !== 'water') return;
      // Land units: CANNOT move to water
      if (!isWaterOnly && nHex.type === 'water') return;

      queue.push({ hexId: nId, dist: dist + 1 });
    });
  }
  return reachable;
};