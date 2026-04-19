// Handles embarked unit movement and auto-disembarkation

export function processEmbarkMovement(fromHex, toHex, unitType, hexId, hexTerrainLookup, unitsToMoveSnap, remainingFromUnitsSnap, isNavalUnit) {
  const toTerrain = hexTerrainLookup[hexId];
  const toIsCoastal = toTerrain === 'coastal';
  const isMovingNavalUnit = isNavalUnit(unitType);
  const hasEmbarked = (fromHex.embarked || []).length > 0;
  
  // Build units in destination
  const mergedToUnits = [...(toHex.units || [])];
  for (const mu of unitsToMoveSnap) {
    const ex = mergedToUnits.find(u => u.type === mu.type);
    if (ex) ex.count += mu.count;
    else mergedToUnits.push({ ...mu });
  }
  
  let finalToUnits = mergedToUnits;
  let finalEmbarked = toHex.embarked || [];
  let fromEmbarked = fromHex.embarked || [];
  
  // Auto-disembark if naval unit with cargo moves to coastal
  if (isMovingNavalUnit && hasEmbarked && toIsCoastal) {
    finalToUnits = [...mergedToUnits, ...(fromHex.embarked || [])];
    finalEmbarked = [];
    fromEmbarked = [];
  }
  
  return {
    toUnits: finalToUnits,
    toEmbarked: finalEmbarked,
    fromUnits: remainingFromUnitsSnap,
    fromEmbarked,
    didDisembark: isMovingNavalUnit && hasEmbarked && toIsCoastal
  };
}