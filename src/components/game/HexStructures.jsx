import React from 'react';

// Nation-specific fortress themes
const FORTRESS_THEMES = {
  onishiman:     { wall: '#2a1a1a', tower: '#3a1a1a', keep: '#4a1a1a', top: '#6a2a2a', flag: '#8b1a1a', aura: '#8b1a1a', window: '#ff4400', roofShape: 'pagoda' },
  gojeon:        { wall: '#2a1a3a', tower: '#3a2a5a', keep: '#4a3a6a', top: '#7a5a9a', flag: '#7b5ea7', aura: '#7b5ea7', window: '#cc88ff', roofShape: 'curved' },
  ruskel:        { wall: '#3a2a1a', tower: '#5a3a1a', keep: '#6a4a2a', top: '#8a6a3a', flag: '#7f8c8d', aura: '#7f8c8d', window: '#ff8800', roofShape: 'round' },
  icebound:      { wall: '#1a2a3a', tower: '#2a3a5a', keep: '#3a4a6a', top: '#6a8a9a', flag: '#aed6f1', aura: '#aed6f1', window: '#aaeeff', roofShape: 'spike' },
  oakhaven:      { wall: '#1a2a1a', tower: '#2a4a2a', keep: '#3a5a3a', top: '#4a7a4a', flag: '#27ae60', aura: '#27ae60', window: '#88ff88', roofShape: 'dome' },
  kadjimaran:    { wall: '#3a2a0a', tower: '#5a3a0a', keep: '#6a4a0a', top: '#9a6a0a', flag: '#8b6a1a', aura: '#d4a020', window: '#ffcc00', roofShape: 'flat' },
  inuvak:        { wall: '#1a2a3a', tower: '#2a3a4a', keep: '#3a4a5a', top: '#5a7a8a', flag: '#5dade2', aura: '#5dade2', window: '#88ccff', roofShape: 'spike' },
  nimrudan:      { wall: '#3a2a1a', tower: '#5a3a1a', keep: '#6a4a1a', top: '#9a6a2a', flag: '#e67e22', aura: '#e67e22', window: '#ffaa44', roofShape: 'arch' },
  republic:      { wall: '#1a2a2a', tower: '#2a4a4a', keep: '#3a5a5a', top: '#4a7a7a', flag: '#1a7a5a', aura: '#1a7a5a', window: '#44ffcc', roofShape: 'dome' },
  sultanate:     { wall: '#1a1a3a', tower: '#2a2a5a', keep: '#3a3a6a', top: '#5a5a9a', flag: '#1a5a8b', aura: '#4488ff', window: '#88aaff', roofShape: 'arch' },
  tlalocayotlan: { wall: '#2a1a0a', tower: '#4a2a0a', keep: '#5a3a0a', top: '#8a5a0a', flag: '#c0392b', aura: '#c0392b', window: '#ff6600', roofShape: 'pyramid' },
  kintei:        { wall: '#2a1a0a', tower: '#4a2a0a', keep: '#5a3a0a', top: '#7a4a1a', flag: '#d35400', aura: '#d35400', window: '#ff8844', roofShape: 'pagoda' },
  default:       { wall: '#4a4a5a', tower: '#5a5a6a', keep: '#6a6a7a', top: '#8a8a9a', flag: '#c0392b', aura: '#8a8a9a', window: '#ffe080', roofShape: 'standard' },
};

// Nation-specific port themes
const PORT_THEMES = {
  onishiman:     { dock: '#3a1808', pillar: '#2a1008', tower: '#c0392b', stripe1: '#8b1a1a', stripe2: '#2a0808', light: '#ff4400', sail: '#8b1a1a', ring: '#8b1a1a' },
  republic:      { dock: '#1a3a5a', pillar: '#0a2a4a', tower: '#c8c4b8', stripe1: '#e8e0d0', stripe2: '#1a7a5a', light: '#44ffcc', sail: '#1a7a5a', ring: '#1a7a5a' },
  sultanate:     { dock: '#1a1a3a', pillar: '#0a0a2a', tower: '#c0c8e0', stripe1: '#e0e4f0', stripe2: '#1a5a8b', light: '#88aaff', sail: '#1a5a8b', ring: '#4488ff' },
  kintei:        { dock: '#3a2010', pillar: '#2a1008', tower: '#d4a020', stripe1: '#f0c840', stripe2: '#8b4a00', light: '#ffcc00', sail: '#d35400', ring: '#d35400' },
  tlalocayotlan: { dock: '#3a1a08', pillar: '#2a0a00', tower: '#8a5a20', stripe1: '#c09050', stripe2: '#c0392b', light: '#ff6600', sail: '#c0392b', ring: '#c0392b' },
  gojeon:        { dock: '#2a1a3a', pillar: '#1a0a2a', tower: '#8a7aaa', stripe1: '#c0b0e0', stripe2: '#5a4a8a', light: '#cc88ff', sail: '#7b5ea7', ring: '#7b5ea7' },
  default:       { dock: '#5a3a18', pillar: '#4a2808', tower: '#c8c4b8', stripe1: '#e8e0d0', stripe2: '#2255aa', light: '#ffee80', sail: '#eee0c0', ring: '#2266cc' },
};

function getFortressTheme(nationId) {
  const norm = nationId?.replace('kinetic','kintei').replace('ilalocatotlan','tlalocayotlan').replace('hestia','republic').replace('azure','sultanate').replace('silver','silverunion').replace('shadowsfall','shadowfell');
  return FORTRESS_THEMES[norm] || FORTRESS_THEMES.default;
}

function getPortTheme(nationId) {
  const norm = nationId?.replace('kinetic','kintei').replace('ilalocatotlan','tlalocayotlan').replace('hestia','republic').replace('azure','sultanate');
  return PORT_THEMES[norm] || PORT_THEMES.default;
}

// Nation-specific roof shapes on top of keep
function FortressRoof({ shape, color, top }) {
  switch (shape) {
    case 'pagoda': return (
      <g>
        <polygon points="-5,-12 5,-12 3,-18 -3,-18" fill={top} stroke={color} strokeWidth={0.5}/>
        <polygon points="-3,-18 3,-18 1,-22 -1,-22" fill={top} stroke={color} strokeWidth={0.4}/>
        <line x1={0} y1={-22} x2={0} y2={-26} stroke="#aaa" strokeWidth={0.8}/>
      </g>
    );
    case 'curved': return (
      <g>
        <path d="M-5,-12 Q-6,-20 0,-22 Q6,-20 5,-12 Z" fill={top} stroke={color} strokeWidth={0.5}/>
        <line x1={0} y1={-22} x2={0} y2={-26} stroke="#aaa" strokeWidth={0.8}/>
      </g>
    );
    case 'spike': return (
      <g>
        <polygon points="-5,-12 5,-12 0,-26" fill={top} stroke={color} strokeWidth={0.5}/>
      </g>
    );
    case 'dome': return (
      <g>
        <ellipse cx={0} cy={-13} rx={6} ry={4} fill={top} stroke={color} strokeWidth={0.5}/>
        <line x1={0} y1={-17} x2={0} y2={-22} stroke="#aaa" strokeWidth={0.8}/>
      </g>
    );
    case 'pyramid': return (
      <g>
        <polygon points="-5,-12 5,-12 2,-20 -2,-20" fill={top} stroke={color} strokeWidth={0.5}/>
        <polygon points="-2,-20 2,-20 0,-25" fill={color} stroke={color} strokeWidth={0.4}/>
      </g>
    );
    case 'arch': return (
      <g>
        <path d="M-5,-12 Q-5,-22 0,-24 Q5,-22 5,-12 Z" fill={top} stroke={color} strokeWidth={0.5}/>
        <circle cx={0} cy={-15} r={2} fill={color} fillOpacity={0.6}/>
        <line x1={0} y1={-24} x2={0} y2={-28} stroke="#aaa" strokeWidth={0.8}/>
      </g>
    );
    case 'flat': return (
      <g>
        <rect x={-6} y={-14} width={12} height={2} fill={top} stroke={color} strokeWidth={0.5}/>
        {[-5,-2,1,4].map(x => <rect key={x} x={x} y={-18} width={2} height={4} rx={0.5} fill={top} stroke={color} strokeWidth={0.4}/>)}
        <line x1={0} y1={-14} x2={0} y2={-20} stroke="#aaa" strokeWidth={0.8}/>
      </g>
    );
    case 'round': return (
      <g>
        <ellipse cx={0} cy={-14} rx={5} ry={3} fill={top} stroke={color} strokeWidth={0.5}/>
        <rect x={-1} y={-17} width={2} height={4} fill={top}/>
        <line x1={0} y1={-17} x2={0} y2={-22} stroke="#aaa" strokeWidth={0.8}/>
      </g>
    );
    default: return (
      <g>
        {[-5,-2,1,4].map(x => <rect key={x} x={x} y={-16} width={2} height={4} rx={0.5} fill={top} stroke={color} strokeWidth={0.5}/>)}
        <line x1={0} y1={-17} x2={0} y2={-23} stroke="#aaa" strokeWidth={0.8}/>
      </g>
    );
  }
}

export function NationFortress({ cx, cy, nationId }) {
  const t = getFortressTheme(nationId);
  const flagDur = t.roofShape === 'spike' ? '0.8s' : t.roofShape === 'pagoda' ? '2s' : '1.5s';

  return (
    <g transform={`translate(${cx},${cy - 6})`} style={{ pointerEvents: 'none' }} filter="url(#fortressGlow)">
      <ellipse cx={0} cy={14} rx={16} ry={4} fill="#000" fillOpacity={0.5} />
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="4s" repeatCount="indefinite" />
        {/* Base wall */}
        <rect x={-12} y={2} width={24} height={10} rx={1} fill={t.wall} stroke="#1a1a18" strokeWidth={0.8} />
        <rect x={-12} y={2} width={24} height={2} rx={1} fill={t.tower} />
        {/* Gate */}
        <rect x={-3} y={6} width={6} height={6} rx={1} fill="#0d0f16" />
        <ellipse cx={0} cy={6} rx={3} ry={2} fill="#0d0f16" />
        {/* Left tower */}
        <rect x={-14} y={-6} width={8} height={10} rx={1} fill={t.tower} stroke="#1a1a18" strokeWidth={0.8} />
        <rect x={-14} y={-6} width={8} height={2} fill={t.top} rx={1} />
        {[-14,-11,-8].map(x => <rect key={x} x={x} y={-10} width={2} height={4} rx={0.5} fill={t.tower} stroke="#1a1a18" strokeWidth={0.5}/>)}
        {/* Right tower */}
        <rect x={6} y={-6} width={8} height={10} rx={1} fill={t.tower} stroke="#1a1a18" strokeWidth={0.8} />
        <rect x={6} y={-6} width={8} height={2} fill={t.top} rx={1} />
        {[6,9,12].map(x => <rect key={x} x={x} y={-10} width={2} height={4} rx={0.5} fill={t.tower} stroke="#1a1a18" strokeWidth={0.5}/>)}
        {/* Center keep */}
        <rect x={-5} y={-12} width={10} height={14} rx={1} fill={t.keep} stroke="#1a1a18" strokeWidth={0.8} />
        <rect x={-5} y={-12} width={10} height={2} fill={t.top} rx={1} />
        {/* Nation-specific window glow */}
        <rect x={-1.5} y={-8} width={3} height={4} rx={0.5} fill={t.window} fillOpacity={0.8}>
          <animate attributeName="fillOpacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite" />
        </rect>
        {/* Nation-specific roof */}
        <FortressRoof shape={t.roofShape} color={t.wall} top={t.top} />
        {/* Flag */}
        <polygon points="0,-23 6,-20 0,-18" fill={t.flag}>
          <animate attributeName="points" values="0,-23 6,-20 0,-18; 0,-23 7,-21 0,-19; 0,-23 6,-20 0,-18" dur={flagDur} repeatCount="indefinite" />
        </polygon>
        <ellipse cx={-2} cy={-13} rx={3} ry={1} fill="#ffffff" fillOpacity={0.18} />
      </g>
      {/* Nation-color aura ring */}
      <circle cx={0} cy={4} r={19} fill="none" stroke={t.aura} strokeWidth={1.2}>
        <animate attributeName="r" values="17;22;17" dur="3s" repeatCount="indefinite" />
        <animate attributeName="strokeOpacity" values="0.15;0.55;0.15" dur="3s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

export function NationPort({ cx, cy, nationId }) {
  const t = getPortTheme(nationId);

  return (
    <g transform={`translate(${cx},${cy - 4})`} style={{ pointerEvents: 'none' }} filter="url(#portGlow)">
      <ellipse cx={0} cy={14} rx={14} ry={3.5} fill="#0a1a3a" fillOpacity={0.7} />
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-1.5;0,0" dur="3s" repeatCount="indefinite" />
        {/* Dock planks */}
        <rect x={-13} y={8} width={26} height={4} rx={1} fill={t.dock} stroke="#1a0800" strokeWidth={0.6} />
        {[-8,-3,3,8].map(x => <line key={x} x1={x} y1={8} x2={x} y2={12} stroke="#1a0800" strokeWidth={0.5}/>)}
        {/* Pillars */}
        {[-12,-2,10].map(x => <rect key={x} x={x} y={10} width={2} height={6} fill={t.pillar}/>)}
        {/* Tower */}
        <rect x={-4} y={-14} width={8} height={22} rx={1} fill={t.tower} stroke="#8a8070" strokeWidth={0.8} />
        <rect x={-4} y={-14} width={8} height={4} rx={0.5} fill={t.stripe1} />
        <rect x={-4} y={-6} width={8} height={4} fill={t.stripe2} />
        <rect x={-4} y={2} width={8} height={4} fill={t.stripe2} />
        {/* Balcony */}
        <rect x={-6} y={-16} width={12} height={2} rx={1} fill="#9a9080" stroke="#6a6050" strokeWidth={0.5} />
        {[-5,0,5].map(x => <line key={x} x1={x} y1={-16} x2={x} y2={-14} stroke="#6a6050" strokeWidth={0.6}/>)}
        {/* Light dome */}
        <ellipse cx={0} cy={-18} rx={5} ry={3.5} fill={t.light} stroke="#d4a820" strokeWidth={0.8}>
          <animate attributeName="fill" values={`${t.light};#fff8a0;${t.light}`} dur="1.5s" repeatCount="indefinite" />
        </ellipse>
        {/* Beam sweep */}
        <path d="M0,-18 L18,4 L12,8 Z" fill={t.light} fillOpacity={0.08}>
          <animate attributeName="fillOpacity" values="0.04;0.18;0.04" dur="2s" repeatCount="indefinite" />
          <animateTransform attributeName="transform" type="rotate" from="0 0 -18" to="360 0 -18" dur="6s" repeatCount="indefinite" />
        </path>
        {/* Light rays */}
        {[0,60,120,180,240,300].map((deg,ri) => (
          <line key={ri} x1={0} y1={-18}
            x2={Math.cos(deg*Math.PI/180)*10} y2={-18+Math.sin(deg*Math.PI/180)*10}
            stroke={t.light} strokeWidth={0.8} strokeOpacity={0.4}>
            <animate attributeName="strokeOpacity" values="0.2;0.7;0.2" dur={`${1.5+ri*0.2}s`} repeatCount="indefinite" />
          </line>
        ))}
        {/* Sail */}
        <line x1={8} y1={8} x2={8} y2={-8} stroke="#6a4a20" strokeWidth={1.2} />
        <polygon points="8,-8 16,-4 8,0" fill={t.sail} fillOpacity={0.85}>
          <animate attributeName="points" values="8,-8 16,-4 8,0; 8,-8 15,-5 8,1; 8,-8 16,-4 8,0" dur="2s" repeatCount="indefinite" />
        </polygon>
        <ellipse cx={-1.5} cy={-19.5} rx={2} ry={1} fill="#ffffff" fillOpacity={0.5} />
      </g>
      {/* Nation ring */}
      <circle cx={0} cy={10} r={17} fill="none" stroke={t.ring} strokeWidth={1} strokeDasharray="6,4">
        <animate attributeName="strokeDashoffset" from="0" to="20" dur="2s" repeatCount="indefinite" />
        <animate attributeName="strokeOpacity" values="0.15;0.55;0.15" dur="3s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}