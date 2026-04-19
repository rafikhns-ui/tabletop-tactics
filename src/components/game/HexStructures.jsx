import React from 'react';

// Normalize nation IDs from map JSON aliases
function normNation(id) {
  if (!id) return 'default';
  return id
    .replace('kinetic', 'kintei')
    .replace('ilalocatotlan', 'tlalocayotlan')
    .replace('hestia', 'republic')
    .replace('azure', 'sultanate')
    .replace('shadowsfall', 'shadowfell')
    .replace('silver', 'silverunion');
}

// ══════════════════════════════════════════════
// FORTRESS — each nation has a unique SVG shape
// ══════════════════════════════════════════════

function FortressOnishiman() {
  // Dark feudal Japanese castle — black lacquered wood, tiered pagoda keep, crimson accents
  return (
    <g>
      {/* Stone base platform */}
      <rect x={-14} y={4} width={28} height={8} rx={1} fill="#1a1010" stroke="#3a0a0a" strokeWidth={0.8}/>
      <rect x={-14} y={4} width={28} height={2} fill="#2a1010"/>
      {/* Wide lower roof eave */}
      <polygon points="-16,4 16,4 12,-1 -12,-1" fill="#8b1a1a" stroke="#3a0808" strokeWidth={0.6}/>
      {/* Mid body */}
      <rect x={-10} y={-10} width={20} height={9} fill="#1a0808" stroke="#3a0808" strokeWidth={0.7}/>
      {/* Mid eave */}
      <polygon points="-12,-10 12,-10 9,-14 -9,-14" fill="#8b1a1a" stroke="#3a0808" strokeWidth={0.5}/>
      {/* Top body */}
      <rect x={-7} y={-22} width={14} height={8} fill="#1a0808" stroke="#3a0808" strokeWidth={0.6}/>
      {/* Top eave */}
      <polygon points="-9,-22 9,-22 6,-26 -6,-26" fill="#8b1a1a" stroke="#3a0808" strokeWidth={0.5}/>
      {/* Spire */}
      <line x1={0} y1={-26} x2={0} y2={-32} stroke="#d4a020" strokeWidth={1.2}/>
      <circle cx={0} cy={-32} r={1.5} fill="#d4a020"/>
      {/* Windows — glowing orange */}
      <rect x={-2} y={-8} width={4} height={3} rx={0.5} fill="#ff4400" fillOpacity={0.9}>
        <animate attributeName="fillOpacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite"/>
      </rect>
      <rect x={-1.5} y={-19} width={3} height={2.5} rx={0.5} fill="#ff4400" fillOpacity={0.8}>
        <animate attributeName="fillOpacity" values="0.5;1;0.5" dur="2.2s" repeatCount="indefinite"/>
      </rect>
      {/* Flag */}
      <line x1={0} y1={-26} x2={0} y2={-32} stroke="#aaa" strokeWidth={0.7}/>
      <polygon points="0,-32 7,-29 0,-26" fill="#8b1a1a">
        <animate attributeName="points" values="0,-32 7,-29 0,-26; 0,-32 8,-30 0,-27; 0,-32 7,-29 0,-26" dur="1.2s" repeatCount="indefinite"/>
      </polygon>
      {/* Aura */}
      <circle cx={0} cy={6} r={20} fill="none" stroke="#8b1a1a" strokeWidth={1.2}>
        <animate attributeName="r" values="18;23;18" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="strokeOpacity" values="0.1;0.5;0.1" dur="3s" repeatCount="indefinite"/>
      </circle>
    </g>
  );
}

function FortressGojeon() {
  // Elegant Korean-style palace — purple/violet, curved roofline, ornate gate
  return (
    <g>
      {/* Stone base */}
      <rect x={-13} y={4} width={26} height={7} rx={2} fill="#1a1228" stroke="#3a2a5a" strokeWidth={0.8}/>
      {/* Wide curved roof — lower */}
      <path d="M-15,4 Q-14,-2 0,-4 Q14,-2 15,4 Z" fill="#5a3a8a" stroke="#2a1a4a" strokeWidth={0.7}/>
      {/* Upturned corners */}
      <path d="M-15,4 Q-17,2 -16,0" fill="none" stroke="#7a5aaa" strokeWidth={1}/>
      <path d="M15,4 Q17,2 16,0" fill="none" stroke="#7a5aaa" strokeWidth={1}/>
      {/* Mid body */}
      <rect x={-9} y={-14} width={18} height={10} fill="#2a1a3a" stroke="#3a2a5a" strokeWidth={0.6}/>
      {/* Upper curved roof */}
      <path d="M-11,-14 Q-10,-21 0,-23 Q10,-21 11,-14 Z" fill="#7b5ea7" stroke="#3a2a6a" strokeWidth={0.6}/>
      <path d="M-11,-14 Q-13,-16 -12,-18" fill="none" stroke="#aa88dd" strokeWidth={0.8}/>
      <path d="M11,-14 Q13,-16 12,-18" fill="none" stroke="#aa88dd" strokeWidth={0.8}/>
      {/* Spire + lotus finial */}
      <line x1={0} y1={-23} x2={0} y2={-29} stroke="#c0a8d0" strokeWidth={0.8}/>
      <ellipse cx={0} cy={-30} rx={2} ry={1.2} fill="#cc88ff"/>
      {/* Gate */}
      <rect x={-3} y={0} width={6} height={7} rx={1} fill="#0d0814"/>
      <ellipse cx={0} cy={0} rx={3} ry={2} fill="#0d0814"/>
      {/* Windows */}
      <rect x={-2} y={-12} width={4} height={3} rx={0.5} fill="#cc88ff" fillOpacity={0.85}>
        <animate attributeName="fillOpacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite"/>
      </rect>
      {/* Flag */}
      <polygon points="0,-29 6,-26 0,-23" fill="#7b5ea7">
        <animate attributeName="points" values="0,-29 6,-26 0,-23; 0,-29 7,-27 0,-24; 0,-29 6,-26 0,-23" dur="2s" repeatCount="indefinite"/>
      </polygon>
      <circle cx={0} cy={4} r={19} fill="none" stroke="#7b5ea7" strokeWidth={1.2}>
        <animate attributeName="r" values="17;22;17" dur="3.5s" repeatCount="indefinite"/>
        <animate attributeName="strokeOpacity" values="0.1;0.5;0.1" dur="3.5s" repeatCount="indefinite"/>
      </circle>
    </g>
  );
}

function FortressRuskel() {
  // Soviet/Slavic iron citadel — squat brutalist towers, iron color, heavy walls
  return (
    <g>
      {/* Massive base */}
      <rect x={-15} y={2} width={30} height={10} rx={0} fill="#3a2a18" stroke="#1a1008" strokeWidth={1}/>
      <rect x={-15} y={2} width={30} height={3} fill="#5a4a28"/>
      {/* Left thick tower — round top */}
      <rect x={-16} y={-10} width={10} height={12} rx={0} fill="#4a3a20" stroke="#1a1008" strokeWidth={0.8}/>
      <ellipse cx={-11} cy={-10} rx={5} ry={3.5} fill="#6a5a30" stroke="#1a1008" strokeWidth={0.7}/>
      {/* Right thick tower */}
      <rect x={6} y={-10} width={10} height={12} rx={0} fill="#4a3a20" stroke="#1a1008" strokeWidth={0.8}/>
      <ellipse cx={11} cy={-10} rx={5} ry={3.5} fill="#6a5a30" stroke="#1a1008" strokeWidth={0.7}/>
      {/* Center keep — tall cylinder */}
      <rect x={-6} y={-18} width={12} height={20} rx={1} fill="#5a4a28" stroke="#1a1008" strokeWidth={0.8}/>
      {/* Conical roof */}
      <polygon points="-7,-18 7,-18 0,-28" fill="#7f8c8d" stroke="#4a5a5a" strokeWidth={0.6}/>
      {/* Bear-paw crenellations */}
      {[-14,-7,0,7,14].map(x => (
        <ellipse key={x} cx={x} cy={2} rx={2} ry={1.5} fill="#6a5a30" stroke="#1a1008" strokeWidth={0.4}/>
      ))}
      {/* Iron gate */}
      <rect x={-3} y={5} width={6} height={7} fill="#0d0c0a"/>
      {/* Window — orange forge glow */}
      <rect x={-2} y={-14} width={4} height={4} rx={0.3} fill="#ff8800" fillOpacity={0.9}>
        <animate attributeName="fillOpacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
      </rect>
      {/* Flag */}
      <line x1={0} y1={-28} x2={0} y2={-34} stroke="#7f8c8d" strokeWidth={0.8}/>
      <polygon points="0,-34 7,-31 0,-28" fill="#7f8c8d">
        <animate attributeName="points" values="0,-34 7,-31 0,-28; 0,-34 8,-32 0,-29; 0,-34 7,-31 0,-28" dur="1.8s" repeatCount="indefinite"/>
      </polygon>
      <circle cx={0} cy={4} r={20} fill="none" stroke="#7f8c8d" strokeWidth={1.2}>
        <animate attributeName="r" values="18;23;18" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="strokeOpacity" values="0.1;0.45;0.1" dur="2.5s" repeatCount="indefinite"/>
      </circle>
    </g>
  );
}

function FortressIcebound() {
  // Ice fortress — jagged ice spires, pale blue, snow-capped
  return (
    <g>
      {/* Ice base */}
      <rect x={-13} y={3} width={26} height={9} rx={1} fill="#1a2a3a" stroke="#2a4a6a" strokeWidth={0.8}/>
      <rect x={-13} y={3} width={26} height={2} fill="#4a7a9a" fillOpacity={0.5}/>
      {/* Left ice spire */}
      <polygon points="-14,3 -8,3 -11,-14" fill="#2a4a6a" stroke="#4a8aaa" strokeWidth={0.6}/>
      <polygon points="-12,3 -9,3 -10.5,-10" fill="#7ab8d4" fillOpacity={0.3}/>
      {/* Right ice spire */}
      <polygon points="8,3 14,3 11,-14" fill="#2a4a6a" stroke="#4a8aaa" strokeWidth={0.6}/>
      <polygon points="9,3 13,3 10.5,-10" fill="#7ab8d4" fillOpacity={0.3}/>
      {/* Center ice tower */}
      <polygon points="-6,3 6,3 0,-24" fill="#3a5a7a" stroke="#aed6f1" strokeWidth={0.8}/>
      <polygon points="-4,3 4,3 0,-18" fill="#aed6f1" fillOpacity={0.2}/>
      {/* Snow caps */}
      <ellipse cx={-11} cy={-14} rx={3.5} ry={1.5} fill="#ddeeff" fillOpacity={0.8}/>
      <ellipse cx={11} cy={-14} rx={3.5} ry={1.5} fill="#ddeeff" fillOpacity={0.8}/>
      <ellipse cx={0} cy={-24} rx={3} ry={1.2} fill="#ffffff" fillOpacity={0.9}/>
      {/* Ice shimmer */}
      <polygon points="-6,3 6,3 0,-24" fill="#aed6f1" fillOpacity={0.0}>
        <animate attributeName="fillOpacity" values="0;0.15;0" dur="2s" repeatCount="indefinite"/>
      </polygon>
      {/* Flag — blizzard streaks */}
      <line x1={0} y1={-24} x2={0} y2={-30} stroke="#aed6f1" strokeWidth={0.8}/>
      <line x1={0} y1={-30} x2={8} y2={-28} stroke="#aed6f1" strokeWidth={1.2}>
        <animate attributeName="x2" values="8;10;8" dur="0.6s" repeatCount="indefinite"/>
        <animate attributeName="y2" values="-28;-29;-28" dur="0.6s" repeatCount="indefinite"/>
      </line>
      <circle cx={0} cy={4} r={20} fill="none" stroke="#aed6f1" strokeWidth={1}>
        <animate attributeName="r" values="18;24;18" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="strokeOpacity" values="0.1;0.4;0.1" dur="2s" repeatCount="indefinite"/>
      </circle>
    </g>
  );
}

function FortressOakhaven() {
  // Living tree-fortress — organic curves, roots, green canopy on top
  return (
    <g>
      {/* Root base */}
      <path d="M-14,11 Q-12,4 -10,3 M10,3 Q12,4 14,11" fill="none" stroke="#2a4a18" strokeWidth={2}/>
      <path d="M-12,11 Q-8,6 -6,3 M6,3 Q8,6 12,11" fill="none" stroke="#3a5a20" strokeWidth={1.5}/>
      {/* Trunk base */}
      <rect x={-8} y={-2} width={16} height={5} rx={3} fill="#3a2a10" stroke="#2a1a08" strokeWidth={0.8}/>
      {/* Wooden walls — rough rounded */}
      <rect x={-10} y={-14} width={20} height={12} rx={3} fill="#3a2a10" stroke="#2a1a08" strokeWidth={0.8}/>
      {/* Left branch tower */}
      <rect x={-14} y={-12} width={6} height={10} rx={2} fill="#3a2a10" stroke="#2a1a08" strokeWidth={0.7}/>
      {/* Right branch tower */}
      <rect x={8} y={-12} width={6} height={10} rx={2} fill="#3a2a10" stroke="#2a1a08" strokeWidth={0.7}/>
      {/* Canopy — big green circle */}
      <circle cx={0} cy={-18} r={12} fill="#1a5a1a" stroke="#27ae60" strokeWidth={0.8}/>
      <circle cx={-5} cy={-20} r={6} fill="#2a6a2a" fillOpacity={0.7}/>
      <circle cx={5} cy={-22} r={5} fill="#278a38" fillOpacity={0.8}/>
      {/* Leaves shimmer */}
      <circle cx={0} cy={-18} r={12} fill="#44ff88" fillOpacity={0.0}>
        <animate attributeName="fillOpacity" values="0;0.08;0" dur="3s" repeatCount="indefinite"/>
      </circle>
      {/* Window */}
      <rect x={-2} y={-10} width={4} height={4} rx={1} fill="#88ff88" fillOpacity={0.7}>
        <animate attributeName="fillOpacity" values="0.4;0.9;0.4" dur="2.5s" repeatCount="indefinite"/>
      </rect>
      {/* Flag */}
      <line x1={0} y1={-30} x2={0} y2={-36} stroke="#27ae60" strokeWidth={0.8}/>
      <polygon points="0,-36 7,-33 0,-30" fill="#27ae60">
        <animate attributeName="points" values="0,-36 7,-33 0,-30; 0,-36 8,-34 0,-31; 0,-36 7,-33 0,-30" dur="2.5s" repeatCount="indefinite"/>
      </polygon>
      <circle cx={0} cy={4} r={20} fill="none" stroke="#27ae60" strokeWidth={1}>
        <animate attributeName="r" values="18;24;18" dur="4s" repeatCount="indefinite"/>
        <animate attributeName="strokeOpacity" values="0.1;0.4;0.1" dur="4s" repeatCount="indefinite"/>
      </circle>
    </g>
  );
}

function FortressKadjimaran() {
  // Sun-temple fortress — golden stone, wide stepped pyramid, desert sandstone
  return (
    <g>
      {/* Wide base step 1 */}
      <rect x={-15} y={4} width={30} height={5} rx={0} fill="#7a5a1a" stroke="#4a3008" strokeWidth={0.8}/>
      {/* Step 2 */}
      <rect x={-12} y={-1} width={24} height={5} rx={0} fill="#8a6a20" stroke="#4a3008" strokeWidth={0.7}/>
      {/* Step 3 */}
      <rect x={-9} y={-6} width={18} height={5} rx={0} fill="#9a7a28" stroke="#4a3008" strokeWidth={0.6}/>
      {/* Step 4 */}
      <rect x={-6} y={-11} width={12} height={5} rx={0} fill="#aa8a30" stroke="#4a3008" strokeWidth={0.5}/>
      {/* Top shrine */}
      <rect x={-4} y={-17} width={8} height={6} rx={0.5} fill="#ba9a38" stroke="#4a3008" strokeWidth={0.5}/>
      {/* Sun disc */}
      <circle cx={0} cy={-20} r={4} fill="#ffcc00" stroke="#d4a020" strokeWidth={0.8}>
        <animate attributeName="fill" values="#ffcc00;#fff080;#ffcc00" dur="2s" repeatCount="indefinite"/>
      </circle>
      {/* Sun rays */}
      {[0,45,90,135,180,225,270,315].map((deg,i) => (
        <line key={i}
          x1={Math.cos(deg*Math.PI/180)*4} y1={-20+Math.sin(deg*Math.PI/180)*4}
          x2={Math.cos(deg*Math.PI/180)*8} y2={-20+Math.sin(deg*Math.PI/180)*8}
          stroke="#ffcc00" strokeWidth={0.8} strokeOpacity={0.7}>
          <animate attributeName="strokeOpacity" values="0.4;1;0.4" dur={`${1.5+i*0.15}s`} repeatCount="indefinite"/>
        </line>
      ))}
      {/* Gate */}
      <rect x={-3} y={0} width={6} height={4} fill="#1a0c00"/>
      {/* Flag */}
      <line x1={0} y1={-17} x2={0} y2={-23} stroke="#8b6a1a" strokeWidth={0.8}/>
      <polygon points="0,-23 7,-20 0,-17" fill="#8b6a1a">
        <animate attributeName="points" values="0,-23 7,-20 0,-17; 0,-23 8,-21 0,-18; 0,-23 7,-20 0,-17" dur="2s" repeatCount="indefinite"/>
      </polygon>
      <circle cx={0} cy={4} r={20} fill="none" stroke="#d4a020" strokeWidth={1.2}>
        <animate attributeName="r" values="18;24;18" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="strokeOpacity" values="0.1;0.5;0.1" dur="3s" repeatCount="indefinite"/>
      </circle>
    </g>
  );
}

function FortressInuvak() {
  // Arctic longhouse + ice spires — rounded sod roof, bone/tusk decorations
  return (
    <g>
      {/* Sod longhouse base */}
      <rect x={-14} y={0} width={28} height={10} rx={2} fill="#2a3a3a" stroke="#1a2a2a" strokeWidth={0.8}/>
      {/* Curved sod roof */}
      <ellipse cx={0} cy={0} rx={15} ry={5} fill="#3a5a5a" stroke="#2a4a4a" strokeWidth={0.7}/>
      {/* Snow layer on roof */}
      <ellipse cx={0} cy={-1} rx={12} ry={3} fill="#ddeeff" fillOpacity={0.6}/>
      {/* Left bone tusk */}
      <path d="M-12,0 Q-16,-6 -14,-12" fill="none" stroke="#ddeeff" strokeWidth={2}/>
      <path d="M-10,0 Q-14,-5 -12,-10" fill="none" stroke="#c0d8e8" strokeWidth={1.5}/>
      {/* Right bone tusk */}
      <path d="M12,0 Q16,-6 14,-12" fill="none" stroke="#ddeeff" strokeWidth={2}/>
      <path d="M10,0 Q14,-5 12,-10" fill="none" stroke="#c0d8e8" strokeWidth={1.5}/>
      {/* Center ice spire */}
      <polygon points="-4,0 4,0 0,-20" fill="#3a6a8a" stroke="#5dade2" strokeWidth={0.7}/>
      <polygon points="-2,0 2,0 0,-14" fill="#aed6f1" fillOpacity={0.25}/>
      {/* Spirit smoke hole */}
      <ellipse cx={0} cy={-2} rx={3} ry={1.5} fill="#88ccff" fillOpacity={0.0}>
        <animate attributeName="fillOpacity" values="0;0.3;0" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="ry" values="1.5;4;1.5" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      {/* Window */}
      <rect x={-2} y={3} width={4} height={3} rx={1} fill="#88ccff" fillOpacity={0.7}>
        <animate attributeName="fillOpacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite"/>
      </rect>
      {/* Flag */}
      <line x1={0} y1={-20} x2={0} y2={-26} stroke="#5dade2" strokeWidth={0.8}/>
      <line x1={0} y1={-26} x2={8} y2={-24} stroke="#5dade2" strokeWidth={1.2}>
        <animate attributeName="x2" values="8;10;8" dur="0.7s" repeatCount="indefinite"/>
      </line>
      <circle cx={0} cy={4} r={19} fill="none" stroke="#5dade2" strokeWidth={1}>
        <animate attributeName="r" values="17;22;17" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="strokeOpacity" values="0.1;0.45;0.1" dur="3s" repeatCount="indefinite"/>
      </circle>
    </g>
  );
}

function FortressNimrudan() {
  // Assyrian fire palace — stepped ziggurat, flame torches on towers, orange glow
  return (
    <g>
      {/* Ziggurat step 1 */}
      <rect x={-14} y={4} width={28} height={6} rx={0} fill="#4a2a08" stroke="#2a1004" strokeWidth={0.8}/>
      {/* Step 2 */}
      <rect x={-11} y={-2} width={22} height={6} rx={0} fill="#5a3510" stroke="#2a1004" strokeWidth={0.7}/>
      {/* Step 3 */}
      <rect x={-8} y={-8} width={16} height={6} rx={0} fill="#6a4018" stroke="#2a1004" strokeWidth={0.6}/>
      {/* Top shrine */}
      <rect x={-5} y={-15} width={10} height={7} rx={0.5} fill="#7a5020" stroke="#2a1004" strokeWidth={0.5}/>
      {/* Left fire torch */}
      <line x1={-12} y1={4} x2={-12} y2={-6} stroke="#6a4018" strokeWidth={1.5}/>
      <ellipse cx={-12} cy={-7} rx={2} ry={3} fill="#ff6600" fillOpacity={0.9}>
        <animate attributeName="ry" values="2.5;4;2.5" dur="0.7s" repeatCount="indefinite"/>
        <animate attributeName="fill" values="#ff6600;#ff9900;#ff4400;#ff6600" dur="0.5s" repeatCount="indefinite"/>
      </ellipse>
      {/* Right fire torch */}
      <line x1={12} y1={4} x2={12} y2={-6} stroke="#6a4018" strokeWidth={1.5}/>
      <ellipse cx={12} cy={-7} rx={2} ry={3} fill="#ff6600" fillOpacity={0.9}>
        <animate attributeName="ry" values="3;4.5;3" dur="0.6s" repeatCount="indefinite"/>
        <animate attributeName="fill" values="#ff9900;#ff4400;#ff6600;#ff9900" dur="0.4s" repeatCount="indefinite"/>
      </ellipse>
      {/* Top eternal flame */}
      <line x1={0} y1={-15} x2={0} y2={-21} stroke="#8a5828" strokeWidth={1}/>
      <ellipse cx={0} cy={-23} rx={3} ry={4} fill="#ffaa00" fillOpacity={0.95}>
        <animate attributeName="ry" values="3.5;6;3.5" dur="0.8s" repeatCount="indefinite"/>
        <animate attributeName="fill" values="#ffaa00;#ff6600;#ffcc00;#ffaa00" dur="0.6s" repeatCount="indefinite"/>
      </ellipse>
      {/* Bull head decoration */}
      <rect x={-2} y={-12} width={4} height={3} rx={0.5} fill="#ffaa44" fillOpacity={0.8}>
        <animate attributeName="fillOpacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
      </rect>
      {/* Gate */}
      <path d="M-3,4 Q0,0 3,4" fill="#1a0800"/>
      <circle cx={0} cy={4} r={20} fill="none" stroke="#e67e22" strokeWidth={1.2}>
        <animate attributeName="r" values="18;24;18" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="strokeOpacity" values="0.1;0.5;0.1" dur="2.5s" repeatCount="indefinite"/>
      </circle>
    </g>
  );
}

function FortressRepublic() {
  // Greek acropolis — white marble columns, teal dome, democratic pillars
  return (
    <g>
      {/* Marble base steps */}
      <rect x={-14} y={5} width={28} height={4} rx={0} fill="#c8c4b0" stroke="#8a8470" strokeWidth={0.7}/>
      <rect x={-12} y={1} width={24} height={4} rx={0} fill="#d8d4c0" stroke="#8a8470" strokeWidth={0.6}/>
      {/* Columns */}
      {[-10,-6,-2,2,6,10].map(x => (
        <g key={x}>
          <rect x={x-1.2} y={-10} width={2.4} height={11} fill="#e8e4d0" stroke="#b0a890" strokeWidth={0.4}/>
          <rect x={x-2} y={-11} width={4} height={1.5} fill="#c8c4b0"/>
          <rect x={x-2} y={1} width={4} height={1.5} fill="#c8c4b0"/>
        </g>
      ))}
      {/* Entablature */}
      <rect x={-12} y={-12} width={24} height={2} fill="#c8c4b0" stroke="#8a8470" strokeWidth={0.6}/>
      {/* Triangular pediment */}
      <polygon points="-12,-12 12,-12 0,-20" fill="#d8d4c0" stroke="#8a8470" strokeWidth={0.6}/>
      {/* Teal dome top */}
      <ellipse cx={0} cy={-20} rx={7} ry={4} fill="#1a7a5a" stroke="#0a5a3a" strokeWidth={0.7}/>
      {/* Dome shine */}
      <ellipse cx={-2} cy={-21} rx={3} ry={1.5} fill="#44ffcc" fillOpacity={0.3}/>
      {/* Spire */}
      <line x1={0} y1={-24} x2={0} y2={-30} stroke="#c8c4b0" strokeWidth={0.8}/>
      <circle cx={0} cy={-31} r={1.5} fill="#44ffcc">
        <animate attributeName="fill" values="#44ffcc;#ffffff;#44ffcc" dur="2s" repeatCount="indefinite"/>
      </circle>
      {/* Flag */}
      <polygon points="0,-30 7,-27 0,-24" fill="#1a7a5a">
        <animate attributeName="points" values="0,-30 7,-27 0,-24; 0,-30 8,-28 0,-25; 0,-30 7,-27 0,-24" dur="2.5s" repeatCount="indefinite"/>
      </polygon>
      <circle cx={0} cy={4} r={20} fill="none" stroke="#1a7a5a" strokeWidth={1.2}>
        <animate attributeName="r" values="18;23;18" dur="4s" repeatCount="indefinite"/>
        <animate attributeName="strokeOpacity" values="0.1;0.45;0.1" dur="4s" repeatCount="indefinite"/>
      </circle>
    </g>
  );
}

function FortressSultanate() {
  // Islamic citadel — crescent on dome, blue tile work, minarets
  return (
    <g>
      {/* Base */}
      <rect x={-13} y={3} width={26} height={8} rx={1} fill="#1a1a3a" stroke="#2a2a5a" strokeWidth={0.8}/>
      {/* Left minaret */}
      <rect x={-14} y={-14} width={5} height={17} rx={1} fill="#2a2a5a" stroke="#3a3a7a" strokeWidth={0.6}/>
      <ellipse cx={-11.5} cy={-14} rx={3} ry={2} fill="#3a3a7a"/>
      <line x1={-11.5} y1={-16} x2={-11.5} y2={-20} stroke="#4488ff" strokeWidth={0.8}/>
      {/* Right minaret */}
      <rect x={9} y={-14} width={5} height={17} rx={1} fill="#2a2a5a" stroke="#3a3a7a" strokeWidth={0.6}/>
      <ellipse cx={11.5} cy={-14} rx={3} ry={2} fill="#3a3a7a"/>
      <line x1={11.5} y1={-16} x2={11.5} y2={-20} stroke="#4488ff" strokeWidth={0.8}/>
      {/* Main dome body */}
      <rect x={-7} y={-12} width={14} height={15} rx={1} fill="#2a2a5a" stroke="#3a3a7a" strokeWidth={0.7}/>
      {/* Blue tile mosaic hint */}
      <rect x={-7} y={-12} width={14} height={15} rx={1} fill="#4488ff" fillOpacity={0.12}/>
      {/* Onion dome */}
      <path d="M-7,-12 Q-8,-22 0,-25 Q8,-22 7,-12 Z" fill="#3a3a7a" stroke="#4488ff" strokeWidth={0.7}/>
      <path d="M-5,-12 Q-5,-20 0,-22 Q5,-20 5,-12 Z" fill="#4488ff" fillOpacity={0.25}/>
      {/* Crescent on dome */}
      <path d="M-3,-25 A4,4 0 0,1 3,-25 A2.5,2.5 0 0,0 -3,-25 Z" fill="#d4a820"/>
      <circle cx={4} cy={-26} r={1.2} fill="#d4a820"/>
      {/* Star */}
      <text x={0} y={-27} textAnchor="middle" fontSize={4} fill="#d4a820" style={{userSelect:'none'}}>✦</text>
      {/* Windows — blue glow */}
      <ellipse cx={0} cy={-7} rx={2.5} ry={3} fill="#88aaff" fillOpacity={0.8}>
        <animate attributeName="fillOpacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
      </ellipse>
      {/* Gate arch */}
      <path d="M-3,3 Q0,-1 3,3 Z" fill="#0a0a1a"/>
      <circle cx={0} cy={4} r={20} fill="none" stroke="#4488ff" strokeWidth={1.2}>
        <animate attributeName="r" values="18;23;18" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="strokeOpacity" values="0.1;0.5;0.1" dur="3s" repeatCount="indefinite"/>
      </circle>
    </g>
  );
}

function FortressTlalocayotlan() {
  // Mesoamerican pyramid-temple — steep stone steps, serpent heads, ritual fire
  return (
    <g>
      {/* Wide base */}
      <rect x={-15} y={4} width={30} height={5} rx={0} fill="#5a2a08" stroke="#2a1004" strokeWidth={0.8}/>
      {/* Step 2 */}
      <rect x={-12} y={-1} width={24} height={5} rx={0} fill="#6a3510" stroke="#2a1004" strokeWidth={0.7}/>
      {/* Step 3 */}
      <rect x={-9} y={-6} width={18} height={5} rx={0} fill="#7a4018" stroke="#2a1004" strokeWidth={0.6}/>
      {/* Step 4 */}
      <rect x={-6} y={-11} width={12} height={5} rx={0} fill="#8a5020" stroke="#2a1004" strokeWidth={0.5}/>
      {/* Temple top */}
      <rect x={-5} y={-16} width={10} height={5} rx={0.3} fill="#9a6028" stroke="#2a1004" strokeWidth={0.5}/>
      {/* Serpent head left */}
      <circle cx={-15} cy={4} r={3} fill="#5a2a08" stroke="#c0392b" strokeWidth={0.8}/>
      <ellipse cx={-15} cy={5.5} rx={2} ry={1} fill="#c0392b" fillOpacity={0.7}/>
      {/* Serpent head right */}
      <circle cx={15} cy={4} r={3} fill="#5a2a08" stroke="#c0392b" strokeWidth={0.8}/>
      <ellipse cx={15} cy={5.5} rx={2} ry={1} fill="#c0392b" fillOpacity={0.7}/>
      {/* Ritual fire on top */}
      <line x1={0} y1={-16} x2={0} y2={-20} stroke="#8a5020" strokeWidth={1.2}/>
      <ellipse cx={0} cy={-22} rx={3} ry={4} fill="#ff6600" fillOpacity={0.95}>
        <animate attributeName="ry" values="3;5.5;3" dur="0.6s" repeatCount="indefinite"/>
        <animate attributeName="fill" values="#ff6600;#ffcc00;#ff3300;#ff6600" dur="0.5s" repeatCount="indefinite"/>
      </ellipse>
      {/* Stone calendar eye */}
      <circle cx={0} cy={-13} r={2.5} fill="#aa7030" stroke="#ffcc00" strokeWidth={0.7}/>
      <circle cx={0} cy={-13} r={1} fill="#ff6600" fillOpacity={0.8}>
        <animate attributeName="fillOpacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      {/* Flag */}
      <line x1={0} y1={-16} x2={0} y2={-22} stroke="#c0392b" strokeWidth={0.7}/>
      <polygon points="0,-22 7,-19 0,-16" fill="#c0392b">
        <animate attributeName="points" values="0,-22 7,-19 0,-16; 0,-22 8,-20 0,-17; 0,-22 7,-19 0,-16" dur="1.3s" repeatCount="indefinite"/>
      </polygon>
      <circle cx={0} cy={4} r={20} fill="none" stroke="#c0392b" strokeWidth={1.2}>
        <animate attributeName="r" values="18;24;18" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="strokeOpacity" values="0.1;0.5;0.1" dur="2.5s" repeatCount="indefinite"/>
      </circle>
    </g>
  );
}

function FortressKintei() {
  // Great-Wall watchtower + dragon — red/orange, multi-tiered with dragon coil
  return (
    <g>
      {/* Wall base */}
      <rect x={-15} y={3} width={30} height={7} rx={0} fill="#2a1208" stroke="#1a0804" strokeWidth={0.8}/>
      <rect x={-15} y={3} width={30} height={2} fill="#4a2010"/>
      {/* Left wall section */}
      <rect x={-15} y={-4} width={8} height={7} fill="#2a1208" stroke="#1a0804" strokeWidth={0.6}/>
      {[-15,-12,-9].map(x => <rect key={x} x={x} y={-8} width={2} height={4} fill="#3a1a0a"/>)}
      {/* Right wall section */}
      <rect x={7} y={-4} width={8} height={7} fill="#2a1208" stroke="#1a0804" strokeWidth={0.6}/>
      {[7,10,13].map(x => <rect key={x} x={x} y={-8} width={2} height={4} fill="#3a1a0a"/>)}
      {/* Center tower — tall */}
      <rect x={-6} y={-18} width={12} height={21} rx={0} fill="#3a1a0a" stroke="#1a0804" strokeWidth={0.7}/>
      {/* Double eave roofs */}
      <polygon points="-8,-18 8,-18 5,-23 -5,-23" fill="#d35400" stroke="#1a0804" strokeWidth={0.5}/>
      <polygon points="-5,-23 5,-23 3,-27 -3,-27" fill="#d35400" stroke="#1a0804" strokeWidth={0.5}/>
      {/* Dragon coil */}
      <path d="M10,0 Q18,-5 14,-12 Q10,-18 4,-14" fill="none" stroke="#d35400" strokeWidth={2} strokeLinecap="round">
        <animate attributeName="d" values="M10,0 Q18,-5 14,-12 Q10,-18 4,-14; M10,0 Q19,-6 15,-13 Q11,-19 5,-15; M10,0 Q18,-5 14,-12 Q10,-18 4,-14" dur="2s" repeatCount="indefinite"/>
      </path>
      <circle cx={4} cy={-14} r={2.5} fill="#d35400"/>
      {/* Dragon eye */}
      <circle cx={4} cy={-14} r={1} fill="#ffcc00">
        <animate attributeName="fill" values="#ffcc00;#ff6600;#ffcc00" dur="1s" repeatCount="indefinite"/>
      </circle>
      {/* Window */}
      <rect x={-2} y={-14} width={4} height={4} rx={0.5} fill="#ff8844" fillOpacity={0.8}>
        <animate attributeName="fillOpacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
      </rect>
      {/* Flag */}
      <line x1={0} y1={-27} x2={0} y2={-33} stroke="#d35400" strokeWidth={0.8}/>
      <polygon points="0,-33 7,-30 0,-27" fill="#d35400">
        <animate attributeName="points" values="0,-33 7,-30 0,-27; 0,-33 8,-31 0,-28; 0,-33 7,-30 0,-27" dur="1.8s" repeatCount="indefinite"/>
      </polygon>
      <circle cx={0} cy={4} r={20} fill="none" stroke="#d35400" strokeWidth={1.2}>
        <animate attributeName="r" values="18;24;18" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="strokeOpacity" values="0.1;0.5;0.1" dur="2.5s" repeatCount="indefinite"/>
      </circle>
    </g>
  );
}

function FortressDefault() {
  // Generic stone castle
  return (
    <g>
      <rect x={-12} y={2} width={24} height={10} rx={1} fill="#4a4a5a" stroke="#2a2a38" strokeWidth={0.8}/>
      <rect x={-12} y={2} width={24} height={2} fill="#7a7a8a"/>
      <rect x={-3} y={6} width={6} height={6} rx={1} fill="#0d0f16"/>
      <rect x={-14} y={-6} width={8} height={10} rx={1} fill="#5a5a6a" stroke="#2a2a38" strokeWidth={0.8}/>
      {[-14,-11,-8].map(x => <rect key={x} x={x} y={-10} width={2} height={4} rx={0.5} fill="#5a5a6a"/>)}
      <rect x={6} y={-6} width={8} height={10} rx={1} fill="#5a5a6a" stroke="#2a2a38" strokeWidth={0.8}/>
      {[6,9,12].map(x => <rect key={x} x={x} y={-10} width={2} height={4} rx={0.5} fill="#5a5a6a"/>)}
      <rect x={-5} y={-12} width={10} height={14} rx={1} fill="#6a6a7a" stroke="#2a2a38" strokeWidth={0.8}/>
      {[-5,-2,1,4].map(x => <rect key={x} x={x} y={-16} width={2} height={4} rx={0.5} fill="#6a6a7a"/>)}
      <rect x={-1.5} y={-8} width={3} height={4} rx={0.5} fill="#ffe080" fillOpacity={0.8}>
        <animate attributeName="fillOpacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite"/>
      </rect>
      <line x1={0} y1={-17} x2={0} y2={-23} stroke="#aaa" strokeWidth={0.8}/>
      <polygon points="0,-23 6,-20 0,-18" fill="#c0392b">
        <animate attributeName="points" values="0,-23 6,-20 0,-18; 0,-23 7,-21 0,-19; 0,-23 6,-20 0,-18" dur="1.5s" repeatCount="indefinite"/>
      </polygon>
      <circle cx={0} cy={4} r={19} fill="none" stroke="#8a8a9a" strokeWidth={1.2}>
        <animate attributeName="r" values="17;22;17" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="strokeOpacity" values="0.15;0.5;0.15" dur="3s" repeatCount="indefinite"/>
      </circle>
    </g>
  );
}

const FORTRESS_MAP = {
  onishiman: FortressOnishiman,
  gojeon: FortressGojeon,
  ruskel: FortressRuskel,
  icebound: FortressIcebound,
  oakhaven: FortressOakhaven,
  kadjimaran: FortressKadjimaran,
  inuvak: FortressInuvak,
  nimrudan: FortressNimrudan,
  republic: FortressRepublic,
  sultanate: FortressSultanate,
  tlalocayotlan: FortressTlalocayotlan,
  kintei: FortressKintei,
};

export function NationFortress({ cx, cy, nationId }) {
  const nid = normNation(nationId);
  const FortressComp = FORTRESS_MAP[nid] || FortressDefault;
  return (
    <g transform={`translate(${cx},${cy - 6})`} style={{ pointerEvents: 'none' }} filter="url(#fortressGlow)">
      <ellipse cx={0} cy={14} rx={16} ry={4} fill="#000" fillOpacity={0.5}/>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="4s" repeatCount="indefinite"/>
        <FortressComp/>
      </g>
    </g>
  );
}

// ══════════════════════════════════════════════
// PORT — nation-specific port structures
// ══════════════════════════════════════════════

const PORT_THEMES = {
  onishiman:     { dock: '#3a1808', pillar: '#2a1008', tower: '#c0392b', stripe1: '#8b1a1a', stripe2: '#2a0808', light: '#ff4400', sail: '#8b1a1a', ring: '#8b1a1a' },
  republic:      { dock: '#1a3a5a', pillar: '#0a2a4a', tower: '#c8c4b8', stripe1: '#e8e0d0', stripe2: '#1a7a5a', light: '#44ffcc', sail: '#1a7a5a', ring: '#1a7a5a' },
  sultanate:     { dock: '#1a1a3a', pillar: '#0a0a2a', tower: '#c0c8e0', stripe1: '#e0e4f0', stripe2: '#1a5a8b', light: '#88aaff', sail: '#1a5a8b', ring: '#4488ff' },
  kintei:        { dock: '#3a2010', pillar: '#2a1008', tower: '#d4a020', stripe1: '#f0c840', stripe2: '#8b4a00', light: '#ffcc00', sail: '#d35400', ring: '#d35400' },
  tlalocayotlan: { dock: '#3a1a08', pillar: '#2a0a00', tower: '#8a5a20', stripe1: '#c09050', stripe2: '#c0392b', light: '#ff6600', sail: '#c0392b', ring: '#c0392b' },
  gojeon:        { dock: '#2a1a3a', pillar: '#1a0a2a', tower: '#8a7aaa', stripe1: '#c0b0e0', stripe2: '#5a4a8a', light: '#cc88ff', sail: '#7b5ea7', ring: '#7b5ea7' },
  ruskel:        { dock: '#3a2a1a', pillar: '#2a1a08', tower: '#7f8c8d', stripe1: '#aabbc0', stripe2: '#4a5a5a', light: '#ff8800', sail: '#7f8c8d', ring: '#7f8c8d' },
  icebound:      { dock: '#1a2a3a', pillar: '#0a1a2a', tower: '#aed6f1', stripe1: '#ddeeff', stripe2: '#2a4a6a', light: '#aaeeff', sail: '#aed6f1', ring: '#aed6f1' },
  nimrudan:      { dock: '#3a2010', pillar: '#2a1008', tower: '#c8a060', stripe1: '#e8c080', stripe2: '#8b4a10', light: '#ffaa44', sail: '#e67e22', ring: '#e67e22' },
  kadjimaran:    { dock: '#4a3010', pillar: '#3a2008', tower: '#c8a020', stripe1: '#f0cc60', stripe2: '#8b6010', light: '#ffcc00', sail: '#8b6a1a', ring: '#d4a020' },
  oakhaven:      { dock: '#2a3a18', pillar: '#1a2a08', tower: '#3a5a2a', stripe1: '#4a7a3a', stripe2: '#1a3a0a', light: '#88ff88', sail: '#27ae60', ring: '#27ae60' },
  inuvak:        { dock: '#1a2a3a', pillar: '#0a1a2a', tower: '#5dade2', stripe1: '#88ccee', stripe2: '#2a5a7a', light: '#88ccff', sail: '#5dade2', ring: '#5dade2' },
  default:       { dock: '#5a3a18', pillar: '#4a2808', tower: '#c8c4b8', stripe1: '#e8e0d0', stripe2: '#2255aa', light: '#ffee80', sail: '#eee0c0', ring: '#2266cc' },
};

function getPortTheme(nationId) {
  const norm = normNation(nationId);
  return PORT_THEMES[norm] || PORT_THEMES.default;
}

export function NationPort({ cx, cy, nationId }) {
  const t = getPortTheme(nationId);
  return (
    <g transform={`translate(${cx},${cy - 4})`} style={{ pointerEvents: 'none' }} filter="url(#portGlow)">
      <ellipse cx={0} cy={14} rx={14} ry={3.5} fill="#0a1a3a" fillOpacity={0.7}/>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-1.5;0,0" dur="3s" repeatCount="indefinite"/>
        {/* Dock planks */}
        <rect x={-13} y={8} width={26} height={4} rx={1} fill={t.dock} stroke="#1a0800" strokeWidth={0.6}/>
        {[-8,-3,3,8].map(x => <line key={x} x1={x} y1={8} x2={x} y2={12} stroke="#1a0800" strokeWidth={0.5}/>)}
        {[-12,-2,10].map(x => <rect key={x} x={x} y={10} width={2} height={6} fill={t.pillar}/>)}
        {/* Lighthouse / watchtower */}
        <rect x={-4} y={-14} width={8} height={22} rx={1} fill={t.tower} stroke="#8a8070" strokeWidth={0.8}/>
        <rect x={-4} y={-14} width={8} height={4} rx={0.5} fill={t.stripe1}/>
        <rect x={-4} y={-6} width={8} height={4} fill={t.stripe2}/>
        <rect x={-4} y={2} width={8} height={4} fill={t.stripe2}/>
        {/* Balcony */}
        <rect x={-6} y={-16} width={12} height={2} rx={1} fill="#9a9080" stroke="#6a6050" strokeWidth={0.5}/>
        {[-5,0,5].map(x => <line key={x} x1={x} y1={-16} x2={x} y2={-14} stroke="#6a6050" strokeWidth={0.6}/>)}
        {/* Light dome */}
        <ellipse cx={0} cy={-18} rx={5} ry={3.5} fill={t.light} stroke="#d4a820" strokeWidth={0.8}>
          <animate attributeName="fill" values={`${t.light};#fff8a0;${t.light}`} dur="1.5s" repeatCount="indefinite"/>
        </ellipse>
        {/* Rotating beam */}
        <path d="M0,-18 L18,4 L12,8 Z" fill={t.light} fillOpacity={0.08}>
          <animate attributeName="fillOpacity" values="0.04;0.18;0.04" dur="2s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="rotate" from="0 0 -18" to="360 0 -18" dur="6s" repeatCount="indefinite"/>
        </path>
        {[0,60,120,180,240,300].map((deg,ri) => (
          <line key={ri} x1={0} y1={-18}
            x2={Math.cos(deg*Math.PI/180)*10} y2={-18+Math.sin(deg*Math.PI/180)*10}
            stroke={t.light} strokeWidth={0.8} strokeOpacity={0.4}>
            <animate attributeName="strokeOpacity" values="0.2;0.7;0.2" dur={`${1.5+ri*0.2}s`} repeatCount="indefinite"/>
          </line>
        ))}
        {/* Sail */}
        <line x1={8} y1={8} x2={8} y2={-8} stroke="#6a4a20" strokeWidth={1.2}/>
        <polygon points="8,-8 16,-4 8,0" fill={t.sail} fillOpacity={0.85}>
          <animate attributeName="points" values="8,-8 16,-4 8,0; 8,-8 15,-5 8,1; 8,-8 16,-4 8,0" dur="2s" repeatCount="indefinite"/>
        </polygon>
        <ellipse cx={-1.5} cy={-19.5} rx={2} ry={1} fill="#ffffff" fillOpacity={0.5}/>
      </g>
      <circle cx={0} cy={10} r={17} fill="none" stroke={t.ring} strokeWidth={1} strokeDasharray="6,4">
        <animate attributeName="strokeDashoffset" from="0" to="20" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="strokeOpacity" values="0.15;0.55;0.15" dur="3s" repeatCount="indefinite"/>
      </circle>
    </g>
  );
}