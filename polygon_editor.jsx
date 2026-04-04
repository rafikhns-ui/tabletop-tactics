import { useState, useRef, useEffect } from "react";

/* ══════ DATA ══════ */
const DEF=[
  {id:"gojeon",name:"Celestial Gojeon Kingdom",color:"#7B3DBE",pts:[[0,0],[2,0],[5,1.5],[8,0],[14,0],[17,1],[20,5],[22,10],[21,15],[20,19],[22,24],[19,27],[15,29],[11,26],[7,29],[4,27],[2,22],[0,18]]},
  {id:"inuvak",name:"Inuvak Polar Confederacy",color:"#2E9E9E",pts:[[22,2],[24,0],[28,0],[34,0],[38,1],[42,4],[43,8],[42,13],[39,17],[35,19],[31,18],[27,16],[24,14],[22,10],[20,5]]},
  {id:"ruskel",name:"Ruskel Iron Federation",color:"#C43030",pts:[[44,1],[48,0],[54,0],[58,2],[60,6],[61,12],[59,18],[56,23],[52,26],[49,24],[46,20],[43,16],[42,13],[43,8],[44,4]]},
  {id:"icebound",name:"Icebound Horde",color:"#D8CFC0",pts:[[66,0],[72,0],[80,0],[85,1],[87,4],[87,8],[85,12],[81,14],[77,13],[73,11],[70,8],[67,4]]},
  {id:"oakhaven",name:"Greenheart Republic",color:"#2E8D32",pts:[[61,17],[65,15],[70,14],[75,15],[78,19],[79,24],[78,28],[75,32],[71,34],[67,33],[63,30],[60,25],[60,21]]},
  {id:"shadowsfall",name:"Order of Shadowsfall",color:"#3C3C3C",pts:[[82,13],[86,11],[90,12],[94,16],[97,22],[98,28],[97,34],[94,38],[90,39],[86,36],[83,30],[81,24],[80,19]]},
  {id:"onishiman",name:"Onishiman Dragon Empire",color:"#8B1525",pts:[[4,27],[8,25],[13,27],[18,26],[22,24],[24,28],[27,33],[30,38],[32,44],[31,50],[28,54],[24,52],[20,54],[16,56],[12,55],[8,52],[4,47],[1,42],[0,36],[0,30]]},
  {id:"silver",name:"Silver Union",color:"#B0B0B0",pts:[[39,39],[42,37],[46,38],[48,41],[48,45],[46,48],[42,49],[39,47],[37,43]]},
  {id:"kadjimaran",name:"Kadjimaran Kingdom",color:"#C49A2A",pts:[[50,26],[55,24],[60,26],[63,30],[65,36],[64,42],[61,47],[57,50],[53,48],[50,44],[49,39],[49,34]]},
  {id:"nimrudan",name:"Sun-Blessed Nimrudan",color:"#B5451B",pts:[[65,38],[69,34],[74,32],[80,34],[84,38],[86,44],[87,50],[85,56],[82,60],[78,63],[74,62],[70,58],[67,53],[65,47]]},
  {id:"kinetic",name:"Greater Kinetic",color:"#E07020",pts:[[20,54],[26,52],[31,50],[36,52],[40,55],[43,59],[44,64],[43,70],[40,74],[36,77],[31,76],[26,73],[22,68],[19,63],[18,58]]},
  {id:"ilalocatotlan",name:"Ilalocatotlan Confederacy",color:"#8B9B30",pts:[[2,70],[7,66],[13,64],[19,66],[23,70],[25,76],[27,82],[28,88],[26,94],[20,97],[14,98],[8,96],[3,91],[0,85],[0,76]]},
  {id:"hestia",name:"Republic of Hestia",color:"#A08050",pts:[[48,68],[53,66],[59,68],[63,72],[65,78],[64,84],[60,89],[55,91],[50,89],[46,84],[44,78],[46,73]]},
  {id:"azure",name:"Azure Moon Sultanate",color:"#7A6AED",pts:[[72,66],[77,64],[83,66],[88,70],[92,76],[94,82],[93,88],[89,93],[84,95],[79,93],[75,88],[72,82],[70,76],[70,72]]},
  {id:"scorched",name:"The Scorched Lands",color:"#8B3A0F",pts:[[87,50],[92,44],[97,42],[100,44],[100,54],[100,62],[98,66],[94,68],[90,68],[86,66],[84,62],[84,58],[85,54]]},
];
const PN={
  gojeon:["Throne of the Purple Lotus","Vale of Eternal Blossoms","The Orceogh Bastion","Shiori's Forbidden Peak","Crimson Crane Marshes","Zsasjx — City of Whispers"],
  inuvak:["Xantvil — Seat of the Ice Council","Nolitres — The Frozen Throne","Frostspire Dominion","The Howling Taiga","Tuvakke's Sacred Tundra","Strait of Frozen Tears"],
  ruskel:["Kazagrad — The Iron Citadel","Escennor — Forge of the East","The Iron Gate Bastion","Boyar Steppe Dominion","Southegit — Wolf's Frontier","Yaroslav's Blood March"],
  icebound:["The Howling Abyss","Frozen Bone Wastes","Valley of the Mammoth Kings","Stormfang Ridge","Glacier's Maw","Skullcrest Pass"],
  oakhaven:["Silverleaf — The Living Throne","Nendon's Emerald Sanctum","Whispering Glade of Elders","The Elder Root Deeps","Misthaven — The Hidden City","Oakwatch — Sentinels' Wall"],
  shadowsfall:["The Forsaken Citadel","Lycus' Eternal Blight","Ashveil — Realm of Woe","Darkspire — The Black Sanctum","The Withered Dominion","Shadow's Edge — The Veil Gate"],
  onishiman:["Kurozan's Obsidian Throne","Katakawa — The Warlord's Seat","Okusannawa — Port of Shadow","The Crimson Temple Reach","Akonsagawa — The Drowned Valley","The Imperial Frontier March"],
  silver:["The Grand Silver Exchange","The Vault of Nations","Coinspire — Merchant Citadel","Haven of the Golden Ledger","The Tradegate Concourse","Market of Ten Thousand Sails"],
  kadjimaran:["The Golden Highlands of Koufou","Koufou — Jewel of the Sands","Kadjimar — The Eternal Oasis","Desert Gate — Warden's Reach","The Sunstone Provinces","Dune Watch — Edge of the Sands"],
  nimrudan:["Nimrud Magna — The Obsidian Palace","Xandios — City of the Philosopher-King","The Obsidian Reach","Crimson Crystal Dominion","Sun Throne — Heart of the Empire","The Eastern Marches of Flame"],
  kinetic:["Yoriku's Sacred Domain","The Kinteï Spirit Heartland","Rune Valley — The Benders' Cradle","Frost Elder — The Ancient Woods","Spirit Peak — Throne of Visions","Nersberg — The Iron March"],
  ilalocatotlan:["Ixtal — Throne of the Jaguar God","The Sacred Flame Temples","Obsidian Lake — Mirror of the Gods","Tlacoatl — The Serpent Lowlands","Jaguar Throne — Blood of Kings","The Serpent River — Mouth of Worlds"],
  hestia:["Hestia — City of the Eternal Flame","The Assembly of Free Men","Silver Sail — Jewel of the Coast","The Eastern Trading Docks","Philosopher's Crown","Van Klanine — The Last Shore"],
  azure:["The Blue Moon Sanctum","Ashur's Light — The Prophet's City","The Prophet's Sacred Desert","Starfall Oasis — Gift of the One God","Faith's Reach — The Pilgrim Road","Crescent Gate — Door to Heaven"],
  scorched:["The Glass Wastes — Kyros' Folly","Kyros' Crater — The Wound of the World","Ember Ridge — Where Mountains Bled","The Forsaken City of Ashes","The Blighted Dominion","Ashwind Flats — The Dead Expanse"],
};
// Province capitals (first province = national capital ★, others = provincial capitals ◆)
const CAPS={
  gojeon:["Bayen","Orchid Gate","Orceogh","Shiori-no-Yama","Crane's Rest","Zsasjx"],
  inuvak:["Xantvil","Nolitres","Frostspire","Taiga Hold","Tuvakke","Frozen Strait Fort"],
  ruskel:["Kazagrad","Escennor","Iron Gate","Boyar's Hall","Southegit","Fort Yaroslav"],
  icebound:["Howl Camp","Bone Fort","Mammoth Hall","Stormfang","Glacier Keep","Skull Fort"],
  oakhaven:["Silverleaf","Nendon's Hall","Elder Glade","Root Sanctum","Misthaven","Oakwatch"],
  shadowsfall:["The Forsaken Spire","Lycus' Tomb","Ashveil","Darkspire","Wither Fort","Veil Gate"],
  onishiman:["Kurozan Palace","Katakawa","Okusannawa","Crimson Temple","Akonsagawa","Imperial Fort"],
  silver:["Silver Exchange","Vault City","Coinspire","Golden Ledger","Tradegate","Market Haven"],
  kadjimaran:["Golden Koufou","Koufou City","Kadjimar","Desert Gate","Sunstone","Dune Fort"],
  nimrudan:["Nimrud Magna","Xandios City","Obsidian Fort","Crystal Mines","Sun Throne","Eastern Fort"],
  kinetic:["Yoriku's Seat","Kinteï Heart","Rune Cradle","Frost Elder","Spirit Peak","Nersberg"],
  ilalocatotlan:["Ixtal","Flame Temple","Obsidian Lake","Tlacoatl","Jaguar Throne","Serpent Mouth"],
  hestia:["Hestia City","Assembly Hall","Silver Sail","Eastern Docks","Philosopher's Hill","Van Klanine"],
  azure:["Blue Moon Temple","Ashur's Light","Prophet's Oasis","Starfall","Faith's Rest","Crescent Gate"],
  scorched:["Glass Citadel","Kyros' Crater","Ember Fort","Ash City","Blight Keep","Ashwind Fort"],
};
const TER={water:{l:"Water",f:"#183a5c",i:"🌊"},coastal:{l:"Coastal",f:"#2a6080",i:"🏖️"},plains:{l:"Plains",f:"#5a7a30",i:"🌾"},forest:{l:"Forest",f:"#1e4a1e",i:"🌲"},hills:{l:"Hills",f:"#6a6030",i:"⛰️"},mountain:{l:"Mountain",f:"#4a4a5a",i:"🏔️"},desert:{l:"Desert",f:"#9a7a30",i:"🏜️"},swamp:{l:"Swamp",f:"#3a4a2a",i:"🪷"},tundra:{l:"Tundra",f:"#7a8a9a",i:"❄️"},scorched:{l:"Scorched",f:"#4a1a0a",i:"🔥"}};

/* ══════ MATH ══════ */
const rn=v=>Math.round(v*10)/10;
const ct=p=>{let x=0,y=0;for(let i=0;i<p.length;i++){x+=p[i][0];y+=p[i][1];}return[x/p.length,y/p.length];};
const dst=(x1,y1,x2,y2)=>Math.sqrt((x2-x1)**2+(y2-y1)**2);
const pip=(px,py,po)=>{let ins=false;for(let i=0,j=po.length-1;i<po.length;j=i++){let xi=po[i][0],yi=po[i][1],xj=po[j][0],yj=po[j][1];if((yi>py)!==(yj>py)&&px<((xj-xi)*(py-yi))/(yj-yi)+xi)ins=!ins;}return ins;};
const hxp=(cx,cy,s)=>{let o="";for(let i=0;i<6;i++){let a=Math.PI/3*i;if(i)o+=" ";o+=rn(cx+s*Math.cos(a))+","+rn(cy+s*Math.sin(a));}return o;};
const d2e=(px,py,poly)=>{let mn=9999;for(let i=0;i<poly.length;i++){let j=(i+1)%poly.length,ax=poly[i][0],ay=poly[i][1],bx=poly[j][0],by=poly[j][1],dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy))),d=dst(px,py,ax+t*dx,ay+t*dy);if(d<mn)mn=d;}return mn;};
const hnb=(gc,gr)=>{let e=gc%2===0;return[[gc+1,e?gr-1:gr],[gc+1,e?gr:gr+1],[gc-1,e?gr-1:gr],[gc-1,e?gr:gr+1],[gc,gr-1],[gc,gr+1]];};
const rgb2hsl=(r,g,b)=>{r/=255;g/=255;b/=255;let mx=Math.max(r,g,b),mn=Math.min(r,g,b),h=0,s=0,l=(mx+mn)/2;if(mx!==mn){let d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);if(mx===r)h=((g-b)/d+(g<b?6:0))/6;else if(mx===g)h=((b-r)/d+2)/6;else h=((r-g)/d+4)/6;}return[h,s,l];};
function _hue2(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;}
const hsl2rgb=(h,s,l)=>{let r,g,b;if(s===0){r=g=b=l;}else{let q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;r=_hue2(p,q,h+1/3);g=_hue2(p,q,h);b=_hue2(p,q,h-1/3);}return[Math.round(r*255),Math.round(g*255),Math.round(b*255)];};
const toHx=(r,g,b)=>"#"+(r<16?"0":"")+r.toString(16)+(g<16?"0":"")+g.toString(16)+(b<16?"0":"")+b.toString(16);
const pCol=(nc,pn,tp)=>{let r=parseInt(nc.slice(1,3),16),g=parseInt(nc.slice(3,5),16),b=parseInt(nc.slice(5,7),16),hsl=rgb2hsl(r,g,b),rng=.35,step=tp>1?rng/(tp-1):0,nL=Math.max(.15,Math.min(.85,hsl[2]-rng/2+step*(pn-1))),rgb=hsl2rgb(hsl[0],Math.min(1,hsl[1]+.1),nL);return toHx(rgb[0],rgb[1],rgb[2]);};

/* ══════ GRID ══════ */
function buildGrid(sz,nations){
  let hexes=[],w=sz*2,h=sz*Math.sqrt(3),cols=Math.ceil(106/(w*.75))+1,rows=Math.ceil(106/h)+1,lk={},nCt={};
  for(let n=0;n<nations.length;n++){let c=ct(nations[n].pts);nCt[nations[n].id]={cx:c[0],cy:c[1]};}
  for(let c=-1;c<cols;c++)for(let r=-1;r<rows;r++){
    let cx=c*w*.75,cy=r*h+(c%2!==0?h/2:0);if(cx<-sz*2||cx>102+sz||cy<-sz*2||cy>102+sz)continue;
    let cands=[];for(let n=0;n<nations.length;n++){if(pip(cx,cy,nations[n].pts))cands.push(nations[n]);}
    let ow=null;if(cands.length===1)ow=cands[0];else if(cands.length>1){let bd=999999;for(let k=0;k<cands.length;k++){let nc=nCt[cands[k].id],d=dst(cx,cy,nc.cx,nc.cy);if(d<bd){bd=d;ow=cands[k];}}}
    let hex={gc:c,gr:r,cx:rn(cx),cy:rn(cy),nid:ow?ow.id:null,nc:ow?ow.color:null,nn:ow?ow.name:null,ter:"water",prov:0};hexes.push(hex);lk[c+","+r]=hex;
  }
  // Terrain
  for(let i=0;i<hexes.length;i++){let h=hexes[i];if(!h.nid){h.ter="water";continue;}
    let nat=null;for(let n=0;n<nations.length;n++){if(nations[n].id===h.nid){nat=nations[n];break;}}if(!nat){h.ter="plains";continue;}
    let isC=false,nb=hnb(h.gc,h.gr);for(let k=0;k<nb.length;k++){let n2=lk[nb[k][0]+","+nb[k][1]];if(!n2||!n2.nid){isC=true;break;}}
    let de=d2e(h.cx,h.cy,nat.pts),nc=ct(nat.pts),mx=0;for(let p=0;p<nat.pts.length;p++){let d=dst(nc[0],nc[1],nat.pts[p][0],nat.pts[p][1]);if(d>mx)mx=d;}
    let dp=mx>0?Math.min(1,de/(mx*.5)):.5,lat=h.cy/100,sd=Math.sin(h.cx*127.1+h.cy*311.7)*43758.5453,rnd=(sd-Math.floor(sd));
    if(h.nid==="scorched"){h.ter=isC?(rnd<.3?"coastal":"scorched"):dp<.15?"mountain":rnd<.2?"mountain":rnd<.35?"desert":"scorched";}
    else if(isC&&dp<.3)h.ter=rnd<.3?"swamp":"coastal";
    else if(dp<.15)h.ter="mountain";else if(dp<.3)h.ter=rnd<.4?"mountain":"hills";
    else if(lat<.15)h.ter=rnd<.3?"hills":"tundra";else if(lat>.75)h.ter=rnd<.3?"hills":"desert";
    else if(dp>.6)h.ter=rnd<.4?"forest":"plains";else{if(rnd<.3)h.ter="forest";else if(rnd<.5)h.ter="hills";else h.ter="plains";}
    if(isC&&h.ter!=="swamp"&&h.ter!=="mountain"&&h.ter!=="scorched"&&rnd<.6)h.ter="coastal";
  }
  // Provinces
  let nH={};for(let i=0;i<hexes.length;i++){if(hexes[i].nid){if(!nH[hexes[i].nid])nH[hexes[i].nid]=[];nH[hexes[i].nid].push(hexes[i]);}}
  let nids=Object.keys(nH);for(let ni=0;ni<nids.length;ni++){let nh=nH[nids[ni]],np=Math.max(2,Math.min(6,Math.round(nh.length/7))),seeds=[];
    for(let s=0;s<np;s++){let idx=Math.floor((s+.5)*nh.length/np);seeds.push([nh[idx].cx,nh[idx].cy]);}
    for(let it=0;it<5;it++){for(let h2=0;h2<nh.length;h2++){let bd=99999,bs=0;for(let s=0;s<seeds.length;s++){let d=dst(nh[h2].cx,nh[h2].cy,seeds[s][0],seeds[s][1]);if(d<bd){bd=d;bs=s;}}nh[h2].prov=bs+1;}
      for(let s=0;s<seeds.length;s++){let sx=0,sy=0,cn=0;for(let h2=0;h2<nh.length;h2++){if(nh[h2].prov===s+1){sx+=nh[h2].cx;sy+=nh[h2].cy;cn++;}}if(cn>0)seeds[s]=[sx/cn,sy/cn];}}}
  return hexes;
}

/* ══════ FONTS ══════ */
const FONT_CSS = "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');";

/* ══════ COMPONENT ══════ */
export default function MapEditor(){
  const[nations,setNations]=useState(DEF);
  const[mapImg,setMapImg]=useState(null);
  const[sel,setSel]=useState(null);
  const[hov,setHov]=useState(null);
  const[polyOp,setPolyOp]=useState(.15);
  const[showPolys,setShowPolys]=useState(true);
  const[panel,setPanel]=useState(true);
  const[tab,setTab]=useState("hex");
  const[modal,setModal]=useState(null);
  const[modTxt,setModTxt]=useState("");
  const[hexOn,setHexOn]=useState(true);
  const[hexSz,setHexSz]=useState(2.5);
  const[hexOp,setHexOp]=useState(.55);
  const[grid,setGrid]=useState([]);
  const[showProv,setShowProv]=useState(true);
  const[cMode,setCMode]=useState("province");
  const[selHex,setSelHex]=useState(null);
  const[selProv,setSelProv]=useState(null);
  const svgRef=useRef(null),imgRef=useRef(null),dragRef=useRef(null),gtRef=useRef(null),fRef=useRef(null);
  const nRef=useRef(nations);nRef.current=nations;

  // Grid
  useEffect(()=>{if(!hexOn){setGrid([]);return;}if(gtRef.current)clearTimeout(gtRef.current);gtRef.current=setTimeout(()=>{setGrid(buildGrid(hexSz,nRef.current));},150);return()=>{if(gtRef.current)clearTimeout(gtRef.current);};},[nations,hexSz,hexOn]);

  function toS(cx,cy){let e=svgRef.current;if(!e)return null;let r=e.getBoundingClientRect();if(r.width<1)return null;return[((cx-r.left)/r.width)*100,((cy-r.top)/r.height)*100];}

  function onM(e){let d=dragRef.current;if(!d)return;let c=toS(e.clientX,e.clientY);if(!c)return;let[mx,my]=c;
    if(d.t==="v")setNations(p=>p.map(n=>n.id!==d.i?n:{...n,pts:n.pts.map((pt,j)=>j===d.v?[rn(mx),rn(my)]:pt)}));
    if(d.t==="m"){let dx=mx-d.lx,dy=my-d.ly;d.lx=mx;d.ly=my;setNations(p=>p.map(n=>n.id!==d.i?n:{...n,pts:n.pts.map(pt=>[rn(pt[0]+dx),rn(pt[1]+dy)])}));}
    if(d.t==="rot"){
      // Get current nation from state via ref
      let nat=nRef.current.find(n=>n.id===d.i);
      if(!nat||!nat.pts||nat.pts.length<3)return;
      let cc=ct(nat.pts);
      // Compute angle delta
      let prevA=Math.atan2(d.ly-cc[1],d.lx-cc[0]);
      let curA=Math.atan2(my-cc[1],mx-cc[0]);
      let delta=curA-prevA;
      // Clamp tiny deltas to avoid jitter
      if(Math.abs(delta)<0.001)return;
      d.lx=mx;d.ly=my;
      let cosD=Math.cos(delta),sinD=Math.sin(delta);
      setNations(p=>p.map(n=>{
        if(n.id!==d.i)return n;
        let c2=ct(n.pts);
        return{...n,pts:n.pts.map(pt=>{
          let rx=pt[0]-c2[0],ry=pt[1]-c2[1];
          return[rn(c2[0]+rx*cosD-ry*sinD),rn(c2[1]+rx*sinD+ry*cosD)];
        })};
      }));
    }}
  function onU(){dragRef.current=null;}
  function loadFile(f){if(!f)return;let rd=new FileReader();rd.onload=e=>{setMapImg(e.target.result);};rd.readAsDataURL(f);}

  // Hex fill
  // Pre-compute nation province counts for province coloring
  let nationProvCounts = {};
  for(let i=0;i<grid.length;i++){
    let h=grid[i];if(!h.nid)continue;
    if(!nationProvCounts[h.nid]) nationProvCounts[h.nid] = new Set();
    nationProvCounts[h.nid].add(h.prov);
  }
  let nationProvTotals = {};
  Object.keys(nationProvCounts).forEach(k=>{nationProvTotals[k]=nationProvCounts[k].size;});

  function hxFl(h){if(!h.nid)return TER.water.f;if(cMode==="terrain")return TER[h.ter]?TER[h.ter].f:TER.plains.f;if(cMode==="nation")return h.nc;
    let nat=nations.find(n=>n.id===h.nid),nc=nat?nat.color:h.nc||"#888",tp=nationProvTotals[h.nid]||2;return pCol(nc,h.prov,tp);}

  // Lookups
  let gLk={};for(let i=0;i<grid.length;i++)gLk[grid[i].gc+","+grid[i].gr]=grid[i];

  // Province centroids
  let pCtr=[];if(grid.length>0){let pm={};for(let i=0;i<grid.length;i++){let h=grid[i];if(!h.nid)continue;let k=h.nid+"-"+h.prov;if(!pm[k])pm[k]={sx:0,sy:0,cnt:0,nid:h.nid,prov:h.prov};pm[k].sx+=h.cx;pm[k].sy+=h.cy;pm[k].cnt++;}
    Object.keys(pm).forEach(k=>{let p=pm[k],nat=nations.find(n=>n.id===p.nid);pCtr.push({cx:rn(p.sx/p.cnt),cy:rn(p.sy/p.cnt),nid:p.nid,prov:p.prov,cnt:p.cnt,name:(PN[p.nid]&&PN[p.nid][p.prov-1])||("P"+p.prov),color:nat?nat.color:"#888"});});}

  // Exports
  function mkJSON(){let nd={};nations.forEach(n=>{nd[n.name]={id:n.id,color:n.color,polygon:n.pts};});let hx=grid.map(h=>({col:h.gc,row:h.gr,cx:h.cx,cy:h.cy,type:h.nid?"land":"water",terrain:h.ter,nation:h.nn||"water",province:h.prov,province_name:(PN[h.nid]&&PN[h.nid][h.prov-1])||"",color:h.nid?h.nc:"#183a5c"}));return JSON.stringify({nations:nd,hex_grid:{size:hexSz,total:grid.length,hexes:hx}},null,2);}
  function mkCSV(){let s="type,nation_id,nation,color,terrain,province,province_name,col,row,cx,cy\n";grid.forEach(h=>{let pn=(PN[h.nid]&&PN[h.nid][h.prov-1])||"";s+=(h.nid?"land":"water")+","+(h.nid||"")+","+(h.nn||"water")+","+(h.nid?h.nc:"#183a5c")+","+h.ter+","+h.prov+","+pn+","+h.gc+","+h.gr+","+h.cx+","+h.cy+"\n";});return s;}
  function mkSVG(){let W=1200,H=900,im=imgRef.current;if(im){if(im.naturalWidth>10)W=im.naturalWidth;if(im.naturalHeight>10)H=im.naturalHeight;}let L=[];L.push('<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">');if(mapImg)L.push('<image href="'+mapImg+'" width="'+W+'" height="'+H+'"/>');L.push('<g id="hexes">');grid.forEach(h=>{let fl=TER[h.ter]?TER[h.ter].f:TER.water.f,pts="";for(let i=0;i<6;i++){let a=Math.PI/3*i;if(i)pts+=" ";pts+=rn(h.cx/100*W+hexSz/100*W*Math.cos(a))+","+rn(h.cy/100*H+hexSz/100*H*Math.sin(a));}L.push('<polygon points="'+pts+'" fill="'+fl+'" fill-opacity="0.5" stroke="'+fl+'" stroke-width="1" data-terrain="'+h.ter+'" data-nation="'+(h.nid||"water")+'" data-province="'+h.prov+'" data-province-name="'+((PN[h.nid]&&PN[h.nid][h.prov-1])||"")+'"/>');});L.push('</g><g id="borders" fill="none">');let svLk={};grid.forEach(h=>{svLk[h.gc+","+h.gr]=h;});grid.forEach(h=>{if(!h.nid)return;let nb=hnb(h.gc,h.gr);for(let k=0;k<6;k++){let n2=svLk[nb[k][0]+","+nb[k][1]];if(!n2||n2.nid!==h.nid){let a1=Math.PI/3*k,a2=Math.PI/3*((k+1)%6);L.push('<line x1="'+rn(h.cx/100*W+hexSz/100*W*Math.cos(a1))+'" y1="'+rn(h.cy/100*H+hexSz/100*H*Math.sin(a1))+'" x2="'+rn(h.cx/100*W+hexSz/100*W*Math.cos(a2))+'" y2="'+rn(h.cy/100*H+hexSz/100*H*Math.sin(a2))+'" stroke="#111" stroke-width="3"/>');}}});L.push('</g><g id="labels" font-family="Cinzel, serif" font-weight="700" text-anchor="middle" dominant-baseline="middle">');nations.forEach(n=>{let c=ct(n.pts);L.push('<text x="'+rn(c[0]/100*W)+'" y="'+rn(c[1]/100*H)+'" font-size="'+Math.max(14,Math.round(W/55))+'" fill="#fff" stroke="#000" stroke-width="4" paint-order="stroke" letter-spacing="2">'+n.name.toUpperCase()+'</text>');});L.push('</g></svg>');return L.join("\n");}
  function dl(c,n,m){let b=new Blob([c],{type:m}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=n;a.click();URL.revokeObjectURL(u);}

  let polyMode=tab==="poly";
  let sN=nations.find(n=>n.id===sel);
  let landN=grid.filter(h=>h.nid).length;
  let tCnt={};grid.forEach(h=>{tCnt[h.ter]=(tCnt[h.ter]||0)+1;});

  /* ══════ STYLES ══════ */
  const S={
    root:{fontFamily:"'Cormorant Garamond',serif",background:"#0a0c12",minHeight:"100vh",color:"#c8c0b0",display:"flex",flexDirection:"column",overflow:"hidden",userSelect:"none"},
    toolbar:{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",background:"linear-gradient(180deg,#1a1c24 0%,#12141a 100%)",borderBottom:"1px solid #2a2520",fontSize:11,flexShrink:0,flexWrap:"wrap"},
    title:{fontFamily:"'Cinzel',serif",color:"#d4a853",fontWeight:700,fontSize:14,letterSpacing:2,textTransform:"uppercase"},
    btn:{padding:"4px 10px",borderRadius:2,border:"1px solid #3a3530",background:"linear-gradient(180deg,#252320 0%,#1a1815 100%)",color:"#b8a888",cursor:"pointer",fontSize:10,fontFamily:"'Cormorant Garamond',serif",letterSpacing:.5,transition:"all .15s"},
    btnGold:{padding:"4px 10px",borderRadius:2,border:"1px solid #8a7530",background:"linear-gradient(180deg,#3a3018 0%,#2a2010 100%)",color:"#d4a853",cursor:"pointer",fontSize:10,fontFamily:"'Cinzel',serif",letterSpacing:1,fontWeight:700},
    panel:{width:220,background:"linear-gradient(180deg,#141618 0%,#0e1014 100%)",borderLeft:"1px solid #2a2520",display:"flex",flexDirection:"column",flexShrink:0,fontSize:10},
    tabBtn:(active)=>({flex:1,padding:"8px 0",border:"none",borderBottom:active?"2px solid #d4a853":"2px solid transparent",background:"none",color:active?"#d4a853":"#666",cursor:"pointer",fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:1,fontWeight:active?700:400}),
    card:{background:"linear-gradient(135deg,#1a1c22 0%,#14161c 100%)",borderRadius:4,padding:8,marginBottom:6,border:"1px solid #2a2520"},
    heading:{fontFamily:"'Cinzel',serif",color:"#d4a853",fontWeight:700,fontSize:11,letterSpacing:1,textTransform:"uppercase",marginBottom:4},
    sub:{fontFamily:"'Cormorant Garamond',serif",color:"#888070",fontSize:9,fontStyle:"italic"},
    input:{flex:1,background:"#0e1014",border:"1px solid #3a3530",borderRadius:2,color:"#d4a853",fontSize:11,fontFamily:"'Cinzel',serif",padding:"3px 6px",outline:"none",letterSpacing:.5},
    range:{width:"100%",accentColor:"#d4a853"},
    hexInfo:{background:"linear-gradient(135deg,#1a1a10 0%,#12140a 100%)",borderRadius:4,padding:8,marginBottom:6,border:"2px solid #d4a853"},
  };

  /* ══════ NO IMAGE ══════ */
  if(!mapImg)return(
    <div style={{...S.root,justifyContent:"center",alignItems:"center",padding:20}}>
      <style>{FONT_CSS}</style>
      <div onClick={()=>{if(fRef.current)fRef.current.click();}} onDrop={e=>{e.preventDefault();let f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(f)loadFile(f);}} onDragOver={e=>e.preventDefault()}
        style={{border:"2px solid #2a2520",borderRadius:8,padding:"60px 40px",textAlign:"center",cursor:"pointer",background:"linear-gradient(135deg,#1a1c24,#0e1014)",maxWidth:500,width:"100%",boxShadow:"0 0 60px #d4a85310"}}>
        <input ref={fRef} type="file" accept="image/*,.svg" style={{display:"none"}} onChange={e=>{let f=e.target.files[0];if(f)loadFile(f);}}/>
        <div style={{fontSize:60,marginBottom:16,filter:"drop-shadow(0 0 20px #d4a85340)"}}>🗺️</div>
        <p style={{...S.title,fontSize:22,margin:"0 0 8px"}}>Rulers of Ardonia</p>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"#888070",fontStyle:"italic",margin:0}}>Load your map to begin — PNG, JPG or SVG</p>
      </div>
    </div>
  );

  /* ══════ RENDER ══════ */
  return(
    <div style={S.root} onPointerMove={onM} onPointerUp={onU}>
      <style>{FONT_CSS}</style>
      {/* Toolbar */}
      <div style={S.toolbar}>
        <button style={S.btn} onClick={()=>setPanel(v=>!v)}>{panel?"◀":"▶"}</button>
        <span style={S.title}>Ardonia</span>
        <div style={{width:1,height:16,background:"#2a2520"}}/>
        <span style={{color:"#666",fontSize:9}}>Op</span>
        <input type="range" min={0} max={100} value={hexOp*100} onChange={e=>setHexOp(+e.target.value/100)} style={{width:50,accentColor:"#d4a853"}}/>
        <span style={{color:"#888070",fontSize:9}}>{Math.round(hexOp*100)}%</span>
        <div style={{width:1,height:16,background:"#2a2520"}}/>
        <button style={S.btnGold} onClick={()=>{setNations(DEF);setSel(null);setSelHex(null);setSelProv(null);}}>Reset</button>
        <button style={S.btn} onClick={()=>setMapImg(null)}>Change Map</button>
        <div style={{flex:1}}/>
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* ── CANVAS ── */}
        <div style={{flex:1,overflow:"auto",position:"relative",background:"#080a10"}}>
          <div style={{position:"relative",display:"inline-block"}}>
            <img ref={imgRef} src={mapImg} style={{display:"block",height:"calc(100vh - 38px)",maxWidth:"none",filter:"brightness(0.7) saturate(0.8)"}} draggable={false}/>
            <svg ref={svgRef} viewBox="0 0 100 100" preserveAspectRatio="none" style={{position:"absolute",top:0,left:0,width:"100%",height:"100%"}}>
              {/* SVG defs for hex effects */}
              <defs>
                <filter id="hexGlow"><feGaussianBlur stdDeviation="0.15" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="selGlow"><feDropShadow dx="0" dy="0" stdDeviation="0.3" floodColor="#d4a853" floodOpacity="0.8"/></filter>
              </defs>
              {/* Hex fills with subtle inner lines */}
              {hexOn&&grid.map((h,i)=>{let fl=hxFl(h),isSel=selHex===i,pk=h.nid?h.nid+"-"+h.prov:null,isPS=selProv&&pk===selProv;
                return(<g key={i}>
                  <polygon points={hxp(h.cx,h.cy,hexSz)} fill={isSel?"#d4a853":fl} fillOpacity={isSel?.85:isPS?hexOp+.15:hexOp}
                    stroke={h.nid?"#ffffff10":"#ffffff06"} strokeWidth={.06}
                    style={{pointerEvents:"all",cursor:"pointer"}}
                    onClick={e=>{e.stopPropagation();setSelHex(selHex===i?null:i);setSel(null);if(h.nid)setSelProv(selProv===pk?null:pk);else setSelProv(null);}}/>
                  {/* Inner hex highlight line for 3D feel */}
                  <polygon points={hxp(h.cx,h.cy,hexSz*.88)} fill="none" stroke={h.nid?"#ffffff":"#ffffff"} strokeWidth={.02} strokeOpacity={h.nid?.08:.03} style={{pointerEvents:"none"}}/>
                </g>);})}
              {/* Province borders — golden dashed */}
              {hexOn&&showProv&&grid.map((h,i)=>{if(!h.nid)return null;let nb=hnb(h.gc,h.gr),edges=[];for(let k=0;k<6;k++){let n2=gLk[nb[k][0]+","+nb[k][1]];if(n2&&n2.nid===h.nid&&n2.prov!==h.prov){let a1=Math.PI/3*k,a2=Math.PI/3*((k+1)%6);edges.push([h.cx+hexSz*Math.cos(a1),h.cy+hexSz*Math.sin(a1),h.cx+hexSz*Math.cos(a2),h.cy+hexSz*Math.sin(a2)]);}}
                return edges.map((ed,ei)=><line key={"pb"+i+"-"+ei} x1={rn(ed[0])} y1={rn(ed[1])} x2={rn(ed[2])} y2={rn(ed[3])} stroke="#d4a853" strokeWidth={.14} strokeOpacity={.55} strokeDasharray=".25,.12" style={{pointerEvents:"none"}}/>);})}
              {/* Nation borders — dark embossed */}
              {hexOn&&grid.map((h,i)=>{if(!h.nid)return null;let nb=hnb(h.gc,h.gr),edges=[];for(let k=0;k<6;k++){let n2=gLk[nb[k][0]+","+nb[k][1]];if(!n2||n2.nid!==h.nid){let a1=Math.PI/3*k,a2=Math.PI/3*((k+1)%6);edges.push([h.cx+hexSz*Math.cos(a1),h.cy+hexSz*Math.sin(a1),h.cx+hexSz*Math.cos(a2),h.cy+hexSz*Math.sin(a2)]);}}
                return edges.map((ed,ei)=><line key={"nb"+i+"-"+ei} x1={rn(ed[0])} y1={rn(ed[1])} x2={rn(ed[2])} y2={rn(ed[3])} stroke="#0a0806" strokeWidth={.28} strokeOpacity={.95} style={{pointerEvents:"none"}}/>);})}
              {/* Selected hex glow ring */}
              {selHex!==null&&grid[selHex]&&<g>
                <polygon points={hxp(grid[selHex].cx,grid[selHex].cy,hexSz*1.05)} fill="none" stroke="#d4a853" strokeWidth={.15} strokeOpacity={.4} filter="url(#selGlow)" style={{pointerEvents:"none"}}/>
                <polygon points={hxp(grid[selHex].cx,grid[selHex].cy,hexSz)} fill="none" stroke="#d4a853" strokeWidth={.25} style={{pointerEvents:"none"}}/>
              </g>}
              {/* Province labels + Capital city icons */}
              {hexOn&&showProv&&pCtr.map((pc,i)=>{
                let pk=pc.nid+"-"+pc.prov,isPS=selProv===pk;
                let nat=nations.find(n=>n.id===pc.nid),nc=nat?nat.color:"#888";
                let nh=nationProvTotals[pc.nid]||2,tp=nh;
                let pcol=pCol(nc,pc.prov,tp);
                let capName=(CAPS[pc.nid]&&CAPS[pc.nid][pc.prov-1])||"";
                let isNatCap=pc.prov===1; // First province = national capital
                let iconSize=hexSz*0.45;
                // Short display: capital name
                let label=capName.split(" ")[0];if(label.length>8)label=label.slice(0,7)+".";
                return(<g key={"pl"+i} style={{cursor:"pointer",pointerEvents:"all"}} onClick={e=>{e.stopPropagation();setSelProv(selProv===pk?null:pk);setSelHex(null);setSel(null);}}>
                  {/* Province territory marker */}
                  <circle cx={pc.cx} cy={pc.cy} r={hexSz*.9} fill={pcol} fillOpacity={isPS?.85:.45} stroke={isPS?"#d4a853":"#0006"} strokeWidth={isPS?.2:.08}/>
                  {/* City icon: ★ for national capital, ◆ for provincial */}
                  <text x={pc.cx} y={pc.cy-hexSz*.3} fill={isNatCap?"#d4a853":"#c8c0b0"} fontSize={iconSize} textAnchor="middle" dominantBaseline="middle"
                    style={{pointerEvents:"none",filter:isNatCap?"drop-shadow(0 0 1px #d4a853)":"none"}}>{isNatCap?"★":"◆"}</text>
                  {/* City name */}
                  <text x={pc.cx} y={pc.cy+hexSz*.25} fill="#fff" fontSize={hexSz*.35} fontWeight="600" textAnchor="middle" dominantBaseline="middle"
                    fontFamily="Cinzel, serif" letterSpacing=".02" style={{pointerEvents:"none",paintOrder:"stroke",stroke:"#000",strokeWidth:".1px"}}>{label}</text>
                </g>);})}
              {/* Nation labels */}
              {nations.map(n=>{let c=ct(n.pts);return(<g key={"nl"+n.id} style={{pointerEvents:"none"}}>
                <text x={c[0]} y={c[1]} fill="none" stroke={n.color} strokeWidth=".5" fontSize="1.8" fontWeight="900" textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" letterSpacing=".15" opacity={.3}>{n.name.toUpperCase().split(" ").slice(0,2).join(" ")}</text>
                <text x={c[0]} y={c[1]} fill="#fff" fontSize="1.4" fontWeight="900" textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, serif" letterSpacing=".1" style={{paintOrder:"stroke",stroke:"#0009",strokeWidth:".25px"}} opacity={.95}>{n.name.toUpperCase().split(" ").slice(0,2).join(" ")}</text>
              </g>);})}
              {/* Polygon guides (poly mode only) */}
              {polyMode&&nations.map(n=>{
                let is=sel===n.id,ih=hov===n.id;
                if(!showPolys&&!is)return null;
                let pts=n.pts.map(pt=>pt[0]+","+pt[1]).join(" ");
                let c=ct(n.pts);
                // Rotate handle position: above the centroid, clamped to stay visible
                let hy=Math.max(1.5, c[1]-8);

                return(<g key={"pg"+n.id}>
                  <polygon points={pts} fill={n.color} fillOpacity={is?.2:ih?.12:.06}
                    stroke={is?"#d4a853":n.color} strokeWidth={is?.3:.12}
                    strokeDasharray={is?"none":".5,.3"}
                    style={{cursor:is?"move":"pointer",pointerEvents:"all"}}
                    onPointerDown={e=>{
                      if(is){
                        e.stopPropagation();
                        let c2=toS(e.clientX,e.clientY);
                        if(c2)dragRef.current={t:"m",i:n.id,lx:c2[0],ly:c2[1]};
                      }
                    }}
                    onClick={e=>{e.stopPropagation();setSel(sel===n.id?null:n.id);setSelHex(null);setSelProv(null);}}
                    onPointerEnter={()=>setHov(n.id)} onPointerLeave={()=>setHov(null)}/>

                  {/* Vertices */}
                  {is&&n.pts.map((pt,vi)=>(
                    <circle key={vi} cx={pt[0]} cy={pt[1]} r={.5}
                      fill="#d4a853" stroke="#fff" strokeWidth={.12}
                      style={{cursor:"grab",pointerEvents:"all"}}
                      onPointerDown={e=>{e.stopPropagation();dragRef.current={t:"v",i:n.id,v:vi};}}
                      onDoubleClick={e=>{e.stopPropagation();if(n.pts.length>3)setNations(p=>p.map(x=>x.id!==n.id?x:{...x,pts:x.pts.filter((_,j)=>j!==vi)}));}}/>
                  ))}

                  {/* Midpoints */}
                  {is&&n.pts.map((pt,vi)=>{
                    let ni=(vi+1)%n.pts.length;
                    let mx2=(pt[0]+n.pts[ni][0])/2, my2=(pt[1]+n.pts[ni][1])/2;
                    return(<circle key={"m"+vi} cx={mx2} cy={my2} r={.25}
                      fill={n.color} stroke="#d4a853" strokeWidth={.06} opacity={.6}
                      style={{cursor:"copy",pointerEvents:"all"}}
                      onClick={e=>{e.stopPropagation();setNations(p=>p.map(x=>x.id!==n.id?x:{...x,pts:[...x.pts.slice(0,vi+1),[rn(mx2),rn(my2)],...x.pts.slice(vi+1)]}));}}/>);
                  })}

                  {/* Rotate handle */}
                  {is&&(
                    <g>
                      <line x1={c[0]} y1={c[1]} x2={c[0]} y2={hy+.6}
                        stroke="#d4a853" strokeWidth={.08} strokeDasharray=".2,.1"
                        style={{pointerEvents:"none"}}/>
                      <circle cx={c[0]} cy={hy} r={.7}
                        fill="#d4a853" stroke="#fff" strokeWidth={.12}
                        style={{cursor:"grab",pointerEvents:"all"}}
                        onPointerDown={e=>{
                          e.stopPropagation();
                          let cc=toS(e.clientX,e.clientY);
                          if(cc) dragRef.current={t:"rot",i:n.id,lx:cc[0],ly:cc[1]};
                        }}/>
                      <text x={c[0]} y={hy} fill="#000" fontSize=".5"
                        textAnchor="middle" dominantBaseline="middle"
                        style={{pointerEvents:"none"}}>↻</text>
                    </g>
                  )}
                </g>);
              })}            </svg>
          </div>
        </div>

        {/* ── PANEL ── */}
        {panel?(<div style={S.panel}>
          <div style={{display:"flex",borderBottom:"1px solid #2a2520"}}>
            {[["poly","🏰"],["hex","⬡"],["terrain","🌍"],["exp","📦"]].map(([k,ic])=>(
              <button key={k} onClick={()=>{setTab(k);if(k==="poly"){setSelHex(null);setSelProv(null);}else{setSel(null);setHov(null);}}} style={S.tabBtn(tab===k)}>{ic}</button>
            ))}
          </div>
          <div style={{flex:1,overflowY:"auto",padding:6}}>
            {/* Hex info */}
            {selHex!==null&&grid[selHex]&&(()=>{let h=grid[selHex],t=TER[h.ter]||TER.water,isL=!!h.nid,nat=isL?nations.find(n=>n.id===h.nid):null,pn=isL?(PN[h.nid]&&PN[h.nid][h.prov-1])||("Province "+h.prov):"";
              return(<div style={S.hexInfo}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><span style={{fontSize:16}}>{t.i}</span><div><div style={{...S.heading,fontSize:12,margin:0}}>{t.l}</div>{isL&&<div style={S.sub}>{pn}</div>}</div><button onClick={()=>setSelHex(null)} style={{marginLeft:"auto",background:"none",border:"none",color:"#666",cursor:"pointer"}}>✕</button></div>
                <div style={{fontSize:10,lineHeight:1.8,color:"#999"}}>
                  {isL?<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:nat.color}}/><span style={{color:"#d4a853",fontFamily:"Cinzel,serif"}}>{nat.name}</span></div>:<div style={{color:"#4488bb"}}>Ocean / Sea</div>}
                  {isL&&<div>Province: <span style={{color:"#c8c0b0"}}>{pn}</span></div>}
                  <div style={{color:"#666"}}>Grid [{h.gc}, {h.gr}] · Pos {h.cx}%, {h.cy}%</div>
                </div></div>);})()}
            {/* Province info */}
            {selProv&&(()=>{let pts=selProv.split("-"),nid=pts[0],pn=parseInt(pts[1]),nat=nations.find(n=>n.id===nid);if(!nat)return null;let ph=grid.filter(h=>h.nid===nid&&h.prov===pn),tp=nationProvTotals[nid]||2,pc=pCol(nat.color,pn,tp),pvn=(PN[nid]&&PN[nid][pn-1])||("Province "+pn),tc={};ph.forEach(h=>{tc[h.ter]=(tc[h.ter]||0)+1;});
              return(<div style={{...S.card,border:"2px solid "+pc}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><div style={{width:14,height:14,borderRadius:3,background:pc}}/><div><div style={{...S.heading,margin:0,color:pc}}>{pvn}</div><div style={S.sub}>{nat.name}</div></div><button onClick={()=>setSelProv(null)} style={{marginLeft:"auto",background:"none",border:"none",color:"#666",cursor:"pointer"}}>✕</button></div>
                <div style={{fontSize:10,lineHeight:1.7,color:"#999"}}><div>Hexes: <b style={{color:"#c8c0b0"}}>{ph.length}</b></div><div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:3}}>{Object.keys(tc).map(t=><span key={t} style={{fontSize:9,background:"#1a1a10",borderRadius:2,padding:"1px 5px",color:"#b8a888",border:"1px solid #2a2520"}}>{TER[t]?TER[t].i:""} {TER[t]?TER[t].l:t}: {tc[t]}</span>)}</div></div></div>);})()}

            {/* ── POLY TAB ── */}
            {tab==="poly"&&(<div>
              {sN&&(<div style={{...S.card,border:"1px solid "+sN.color}}><div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
                <div style={{width:14,height:14,borderRadius:3,background:sN.color,cursor:"pointer",position:"relative",border:"1px solid #3a3530"}}><input type="color" value={sN.color} onChange={e=>{let nc=e.target.value;setNations(p=>p.map(n=>n.id!==sN.id?n:{...n,color:nc}));}} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:0,cursor:"pointer"}}/></div>
                <input type="text" value={sN.name} onChange={e=>{let nv=e.target.value;setNations(p=>p.map(n=>n.id!==sN.id?n:{...n,name:nv}));}} style={S.input}/></div>
                <div style={S.sub}>{sN.pts.length} vertices · {grid.filter(h=>h.nid===sN.id).length} hexes</div></div>)}
              {nations.map(n=><div key={n.id} onClick={()=>{setSel(sel===n.id?null:n.id);setSelHex(null);setSelProv(null);}} onPointerEnter={()=>setHov(n.id)} onPointerLeave={()=>setHov(null)}
                style={{display:"flex",alignItems:"center",gap:4,padding:"3px 6px",borderRadius:2,cursor:"pointer",background:sel===n.id?"#1a1a10":"transparent",borderLeft:sel===n.id?"2px solid #d4a853":"2px solid transparent"}}>
                <div style={{width:8,height:8,borderRadius:2,background:n.color,flexShrink:0}}/><span style={{fontSize:10,color:(sel===n.id||hov===n.id)?"#d4a853":"#888070",fontFamily:"'Cinzel',serif",letterSpacing:.5}}>{n.name}</span></div>)}
              <div style={{...S.card,marginTop:8,fontSize:9,color:"#555",lineHeight:1.5,fontStyle:"italic"}}>Drag polygon = move · Vertex = reshape<br/>Orange ↻ = rotate · ⬡/🌍 = click hexes</div>
            </div>)}

            {/* ── HEX TAB ── */}
            {tab==="hex"&&(<div>
              <label style={{display:"flex",alignItems:"center",gap:4,marginBottom:8,cursor:"pointer"}}><input type="checkbox" checked={hexOn} onChange={()=>setHexOn(v=>!v)} style={{accentColor:"#d4a853"}}/><span style={S.heading}>Hex Grid</span></label>
              <div style={{marginBottom:8}}><div style={{...S.sub,marginBottom:2}}>Size: <b style={{color:"#d4a853"}}>{hexSz}</b></div><input type="range" min={10} max={50} value={hexSz*10} onChange={e=>setHexSz(+e.target.value/10)} style={S.range}/></div>
              <div style={{marginBottom:8}}><div style={S.sub}>Color mode:</div>{["terrain","nation","province"].map(m=><label key={m} style={{display:"flex",alignItems:"center",gap:4,margin:"3px 0",cursor:"pointer"}}><input type="radio" name="cm" checked={cMode===m} onChange={()=>setCMode(m)} style={{accentColor:"#d4a853"}}/><span style={{color:cMode===m?"#d4a853":"#888070",fontFamily:"'Cinzel',serif",fontSize:10}}>{m}</span></label>)}</div>
              <label style={{display:"flex",alignItems:"center",gap:4,marginBottom:6,cursor:"pointer"}}><input type="checkbox" checked={showProv} onChange={()=>setShowProv(v=>!v)} style={{accentColor:"#d4a853"}}/><span style={{color:"#999",fontSize:10}}>Province borders</span></label>
              <label style={{display:"flex",alignItems:"center",gap:4,marginBottom:8,cursor:"pointer"}}><input type="checkbox" checked={showPolys} onChange={()=>setShowPolys(v=>!v)} style={{accentColor:"#d4a853"}}/><span style={{color:"#999",fontSize:10}}>Nation polygons (edit mode)</span></label>
              <div style={S.card}><div style={S.heading}>Grid Stats</div><div style={{fontSize:10,lineHeight:1.8,color:"#999"}}>Total: <b style={{color:"#c8c0b0"}}>{grid.length}</b> · Land: <b style={{color:"#7a9a3a"}}>{landN}</b> · Water: <b style={{color:"#4488bb"}}>{grid.length-landN}</b></div></div>
            </div>)}

            {/* ── TERRAIN TAB ── */}
            {tab==="terrain"&&(<div>
              <div style={S.heading}>Terrain Distribution</div>
              {Object.keys(TER).map(k=>{let cnt=tCnt[k]||0;if(!cnt)return null;let t=TER[k],pct=grid.length?Math.round(cnt/grid.length*100):0;
                return<div key={k} style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}><span style={{fontSize:13}}>{t.i}</span><div style={{width:10,height:10,borderRadius:2,background:t.f}}/><span style={{fontSize:10,color:"#c8c0b0",flex:1,fontFamily:"'Cinzel',serif"}}>{t.l}</span><span style={{fontSize:10,color:"#d4a853",fontWeight:700}}>{cnt}</span><span style={{fontSize:9,color:"#666"}}>{pct}%</span></div>;})}
              <div style={{...S.heading,marginTop:10}}>Nations &amp; Provinces</div>
              {nations.map(n=>{let nh=grid.filter(h=>h.nid===n.id);if(!nh.length)return null;let provs={};nh.forEach(h=>{if(!provs[h.prov])provs[h.prov]={hexes:0,terrains:{}};provs[h.prov].hexes++;provs[h.prov].terrains[h.ter]=(provs[h.prov].terrains[h.ter]||0)+1;});let pks=Object.keys(provs).sort((a,b)=>+a-+b);
                return<div key={n.id} style={{...S.card,borderLeft:"3px solid "+n.color}}><div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}><div style={{width:8,height:8,borderRadius:2,background:n.color}}/><span style={{...S.heading,margin:0}}>{n.name}</span></div><div style={S.sub}>{nh.length} hexes · {pks.length} provinces</div>
                  {pks.map(pk=>{let pv=provs[pk],pvn=(PN[n.id]&&PN[n.id][+pk-1])||("Province "+pk),pcol=pCol(n.color,+pk,pks.length);
                    return<div key={pk} style={{background:"#0e1014",borderRadius:3,padding:4,marginTop:3,borderLeft:"3px solid "+pcol}}><div style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:6,height:6,borderRadius:1,background:pcol}}/><b style={{fontSize:10,color:"#c8c0b0",fontFamily:"'Cinzel',serif"}}>{pvn}</b><span style={{marginLeft:"auto",fontSize:9,color:"#666"}}>{pv.hexes}</span></div><div style={{display:"flex",flexWrap:"wrap",gap:2,marginTop:2}}>{Object.keys(pv.terrains).map(t=><span key={t} style={{fontSize:8,color:"#888070",background:"#1a1a10",borderRadius:2,padding:"0 4px"}}>{TER[t]?TER[t].i:""}{pv.terrains[t]}</span>)}</div></div>;})}</div>;})}
            </div>)}

            {/* ── EXPORT TAB ── */}
            {tab==="exp"&&(<div style={{display:"flex",flexDirection:"column",gap:6}}>
              <button onClick={()=>{setModTxt(mkSVG());setModal("svg");}} style={{...S.btnGold,padding:12,fontSize:12,textAlign:"center"}}>🗺️ Generate SVG Map</button>
              <button onClick={()=>{setModTxt(mkJSON());setModal("json");}} style={{...S.btn,padding:10,textAlign:"center",color:"#7a9a3a",borderColor:"#3a4a2a"}}>📋 Export JSON</button>
              <button onClick={()=>{setModTxt(mkCSV());setModal("csv");}} style={{...S.btn,padding:10,textAlign:"center",color:"#6a8acc",borderColor:"#2a3a5a"}}>📊 Export CSV</button>
              <div style={{...S.card,fontSize:9,color:"#555",lineHeight:1.6,fontStyle:"italic"}}><b style={{color:"#d4a853"}}>SVG</b> — vector map for Inkscape/Illustrator<br/><b style={{color:"#7a9a3a"}}>JSON</b> — all data with province names<br/><b style={{color:"#6a8acc"}}>CSV</b> — spreadsheet rows</div>
            </div>)}
          </div>
        </div>):(<div style={{width:28,background:"#141618",borderLeft:"1px solid #2a2520",display:"flex",flexDirection:"column",alignItems:"center",gap:8,paddingTop:8,flexShrink:0}}>
          <button style={{...S.btn,padding:"2px 4px",color:"#d4a853"}} onClick={()=>setPanel(true)}>▶</button>
          {[["poly","🏰"],["hex","⬡"],["terrain","🌍"],["exp","📦"]].map(([k,ic])=><div key={k} style={{cursor:"pointer",fontSize:14,opacity:.5}} onClick={()=>{setPanel(true);setTab(k);if(k==="poly"){setSelHex(null);setSelProv(null);}else{setSel(null);}}}>{ic}</div>)}
        </div>)}
      </div>

      {/* ── MODAL ── */}
      {modal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,backdropFilter:"blur(4px)"}} onClick={()=>setModal(null)}>
        <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(135deg,#1a1c24,#0e1014)",borderRadius:8,padding:20,maxWidth:700,width:"92%",maxHeight:"85vh",display:"flex",flexDirection:"column",border:"1px solid #2a2520",boxShadow:"0 0 60px #0008"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{...S.title,fontSize:16}}>{modal==="svg"?"SVG Map":modal==="json"?"JSON Data":"CSV Data"}</span>
            <div style={{display:"flex",gap:6}}>
              {modal==="svg"&&<button style={S.btnGold} onClick={()=>dl(modTxt,"ardonia_map.svg","image/svg+xml")}>⬇ Download SVG</button>}
              {modal==="json"&&<button style={S.btn} onClick={()=>dl(modTxt,"ardonia.json","application/json")}>⬇ .json</button>}
              {modal==="csv"&&<button style={S.btn} onClick={()=>dl(modTxt,"ardonia.csv","text/csv")}>⬇ .csv</button>}
              <button style={S.btn} onClick={()=>navigator.clipboard.writeText(modTxt)}>📋 Copy</button>
              <button style={S.btn} onClick={()=>setModal(null)}>✕</button>
            </div></div>
          <div style={{background:"#0e1014",borderRadius:4,padding:6,marginBottom:8,textAlign:"center",color:"#666",fontSize:10,fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif"}}>{Math.round(modTxt.length/1024)} KB · {grid.length} hexes · {nations.length} nations</div>
          <textarea readOnly value={modTxt} style={{flex:1,minHeight:250,background:"#080a10",border:"1px solid #2a2520",borderRadius:4,color:modal==="svg"?"#d4a853":modal==="json"?"#7a9a3a":"#6a8acc",fontFamily:"monospace",fontSize:10,padding:12,resize:"none"}}/>
        </div>
      </div>}
    </div>
  );
}
