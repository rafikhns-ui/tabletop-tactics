// Helper functions for movement and embarkation logic

export function handleDisembarkation(fromHex, unitType, destHexId, hexTerrainLookup, isNavalUnit, toHexUnits) {
  const toTerrain = hexTerrainLookup[destHexId];
  const isToCoastal = toTerrain === 'coastal';
  const hasEmbarked = (fromHex.embarked || []).length > 0;
  const isMovingNavalUnit = isNavalUnit(unitType);
  
  if (isMovingNavalUnit && isToCoastal && hasEmbarked) {
    return {
      toUnits: [...toHexUnits, ...(fromHex.embarked || [])],
      embarked: [],
      disembarked: true
    };
  }
  
  return {
    toUnits: toHexUnits,
    embarked: fromHex.embarked || [],
    disembarked: false
  };
}