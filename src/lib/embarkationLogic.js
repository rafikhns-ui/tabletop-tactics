// Embarkation mechanics: land units can board naval units

export function isNavalUnit(unitType) {
  return unitType === 'naval' || unitType === 'infamous_reapership';
}

export function isLandUnit(unitType) {
  return !isNavalUnit(unitType);
}

export const EMBARK_CAPACITY = 3;

export function getEmbarkedCount(hex) {
  return (hex.embarked || []).reduce((sum, u) => sum + u.count, 0);
}

export function canEmbark(hex, unitType, hexTerrainLookup, hexId) {
  const terrain = hexTerrainLookup[hexId];
  const isCoastal = terrain === 'coastal';
  const hasNavalUnit = (hex.units || []).some(u => isNavalUnit(u.type));
  return isLandUnit(unitType) && hasNavalUnit && isCoastal;
}

export function embarkUnits(hex, unitsToEmbark) {
  const embarked = [...(hex.embarked || [])];
  const currentCount = getEmbarkedCount(hex);
  let remaining = [...unitsToEmbark];
  
  for (let i = 0; i < remaining.length; i++) {
    const unit = remaining[i];
    const canAdd = Math.min(unit.count, Math.max(0, EMBARK_CAPACITY - currentCount));
    
    if (canAdd > 0) {
      const existing = embarked.find(u => u.type === unit.type);
      if (existing) existing.count += canAdd;
      else embarked.push({ type: unit.type, count: canAdd });
      
      remaining[i] = { ...unit, count: unit.count - canAdd };
    }
  }
  
  return { embarked: embarked.filter(u => u.count > 0), remaining: remaining.filter(u => u.count > 0) };
}

export function disembarkUnits(hex) {
  return {
    disembarked: hex.embarked || [],
    hex: { ...hex, embarked: [] }
  };
}