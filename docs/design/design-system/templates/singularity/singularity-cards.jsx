/* ════════════════════════════════════════════════════════════════
   SINGULARITY — Atoms + Task Card
   Shared visual vocabulary exposed on window for all Singularity
   surfaces. The task card archetype: TERMINAL PRINTOUT — sprocket
   holes, scanlines, corner brackets, blinking cursor, waveform.

   Atoms exported: SingularityMark, Waveform, Sprockets, Scanlines,
   Corners, CircuitTrace, AsciiBar, FileArtifact, SgDivider.
   Task card exported: SingularityCard (window.SingularityCard).
   ════════════════════════════════════════════════════════════════ */

/* ── Consensus scale ── */
const SG_CONSENSUS = [
  { v:1, label:"NOISE",    fill:"#ef4444" },
  { v:2, label:"WEAK",     fill:"#f97316" },
  { v:3, label:"SIGNAL",   fill:"#fbbf24" },
  { v:4, label:"CLEAR",    fill:"#60a5fa" },
  { v:5, label:"VERIFIED", fill:"#4ade80" },
];

const sgDistTotal = d => d.reduce((a,b)=>a+b,0);
const sgDistAvg   = d => { const t=sgDistTotal(d); return t?d.reduce((a,c,i)=>a+c*(i+1),0)/t:0; };
const sgStanding  = avg => SG_CONSENSUS[Math.max(0,Math.min(4,Math.round(avg)-1))];

/* ════════════════════════════════════════════════════════════════
   SINGULARITY MARK — broadcasting node sigil
   Core circle · 8 radial traces · 2 concentric rings · cardinal vias
   ════════════════════════════════════════════════════════════════ */
function SingularityMark({ size=24, color="#4ade80", glow=false }) {
  const c  = size/2;
  const r0 = size*0.095;
  const r1 = size*0.24;
  const r2 = size*0.43;
  const r3 = size*0.49;
  const traces = Array.from({length:8},(_,i)=>{
    const a=i*Math.PI/4, diag=i%2!==0;
    return { a, diag, rEnd: diag?r2*0.82:r2 };
  });
  const clipId = `sg-mc-${Math.round(size*10)}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      fill="none" style={{display:"block",flexShrink:0}}>
      <defs><clipPath id={clipId}><circle cx={c} cy={c} r={r3}/></clipPath></defs>
      <g clipPath={`url(#${clipId})`}>
        {glow&&<circle cx={c} cy={c} r={r2+5} fill="rgba(74,222,128,0.1)"/>}
        <circle cx={c} cy={c} r={r2} stroke={color} strokeWidth={size*0.026} opacity={0.32}/>
        <circle cx={c} cy={c} r={r1} stroke={color} strokeWidth={size*0.034} opacity={0.68}/>
        {traces.map(({a,diag,rEnd},i)=>(
          <line key={i}
            x1={c+r1*Math.cos(a)} y1={c+r1*Math.sin(a)}
            x2={c+rEnd*Math.cos(a)} y2={c+rEnd*Math.sin(a)}
            stroke={color} strokeWidth={size*(diag?0.024:0.036)}
            opacity={diag?0.36:0.8}/>
        ))}
        {[0,2,4,6].map(i=>{
          const a=i*Math.PI/4;
          return <circle key={`v${i}`}
            cx={c+r2*Math.cos(a)} cy={c+r2*Math.sin(a)}
            r={size*0.05} fill={color} opacity={0.78}/>;
        })}
        <circle cx={c} cy={c} r={r0+1} fill={color} opacity={0.12}/>
        <circle cx={c} cy={c} r={r0}   fill={color} opacity={0.92}/>
        <circle cx={c} cy={c} r={r0*0.38} fill="#050f08"/>
      </g>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   WAVEFORM — oscilloscope signal strip SVG
   ════════════════════════════════════════════════════════════════ */
function Waveform({ width, height, strokeColor="rgba(74,222,128,0.68)",
  dashColor="rgba(37,99,235,0.38)", strokeWidth=1.4 }) {
  const pts=[];
  for(let i=0;i<=100;i++){
    const t=i/100, x=t*width;
    const y=height/2
      +Math.sin(t*8*Math.PI)*height*0.22
      +Math.sin(t*3*Math.PI+1.1)*height*0.13
      +Math.sin(t*23*Math.PI)*height*0.05;
    pts.push(`${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none" style={{display:"block"}}>
      <line x1="0" y1={height/2} x2={width} y2={height/2}
        stroke={dashColor} strokeWidth="0.6" strokeDasharray="5 5"/>
      <path d={pts.join(" ")} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}/>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   SPROCKETS — continuous-feed paper holes
   ════════════════════════════════════════════════════════════════ */
function Sprockets({ n=8, style={} }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",
      alignItems:"center",padding:"4px 10px",...style}}>
      {Array.from({length:n},(_,i)=>(
        <div key={i} style={{width:7,height:5,
          border:"1px solid rgba(74,222,128,0.32)",borderRadius:1}}/>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SCANLINES — CRT phosphor overlay
   ════════════════════════════════════════════════════════════════ */
function Scanlines({ opacity=0.022 }) {
  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:2,
      background:`repeating-linear-gradient(to bottom,
        transparent,transparent 2px,
        rgba(74,222,128,${opacity}) 2px,rgba(74,222,128,${opacity}) 4px)`}}/>
  );
}

/* ════════════════════════════════════════════════════════════════
   CORNERS — bracket corner marks
   ════════════════════════════════════════════════════════════════ */
function Corners({ color="rgba(74,222,128,0.42)", inset=4, size=12 }) {
  const b=`1px solid ${color}`;
  const c=(v,h)=>({position:"absolute",[v]:inset,[h]:inset,width:size,height:size,
    [`border${v[0].toUpperCase()+v.slice(1)}`]:b,
    [`border${h[0].toUpperCase()+h.slice(1)}`]:b,pointerEvents:"none"});
  return(<>
    <div style={c("top","left")}/><div style={c("top","right")}/>
    <div style={c("bottom","left")}/><div style={c("bottom","right")}/>
  </>);
}

/* ════════════════════════════════════════════════════════════════
   CIRCUIT TRACE — PCB corner decoration SVG
   ════════════════════════════════════════════════════════════════ */
function CircuitTrace({ width=130, height=90, color="rgba(37,99,235,0.3)" }) {
  const w=f=>f*width, h=f=>f*height, sw=0.9;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      fill="none" style={{display:"block"}}>
      <path d={`M0 ${h(.68)} L${w(.22)} ${h(.68)} L${w(.22)} ${h(.28)} L${w(.52)} ${h(.28)}`}
        stroke={color} strokeWidth={sw}/>
      <path d={`M0 ${h(.38)} L${w(.12)} ${h(.38)} L${w(.12)} ${h(.08)} L${w(.62)} ${h(.08)} L${w(.62)} ${h(.38)} L${width} ${h(.38)}`}
        stroke={color} strokeWidth={sw*.7}/>
      <path d={`M${w(.32)} ${height} L${w(.32)} ${h(.62)} L${w(.52)} ${h(.62)} L${w(.52)} ${h(.28)}`}
        stroke={color} strokeWidth={sw}/>
      <path d={`M${w(.72)} ${height} L${w(.72)} ${h(.52)} L${width} ${h(.52)}`}
        stroke={color} strokeWidth={sw*.7}/>
      {[[w(.22),h(.28)],[w(.62),h(.08)],[w(.52),h(.28)],[w(.52),h(.62)],[w(.72),h(.52)]]
        .map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r={2.8} fill={color}/>)}
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   ASCII BAR — terminal progress bar
   ════════════════════════════════════════════════════════════════ */
function AsciiBar({ value, max, width=15 }) {
  const filled=Math.round((value/Math.max(1,max))*width);
  return (
    <span style={{letterSpacing:"-0.5px",fontSize:8}}>
      {"█".repeat(filled)}{"░".repeat(width-filled)}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   FILE ARTIFACT — uploaded evidence card
   Shows a file-type thumbnail area + filename + metadata.
   kind: "image" | "video" | "audio" | "data" | "doc"
   ════════════════════════════════════════════════════════════════ */
const FILE_KINDS = {
  image: { label:"IMAGE", color:"#60a5fa" },
  video: { label:"VIDEO", color:"#f97316" },
  audio: { label:"AUDIO", color:"#fbbf24" },
  data:  { label:"DATA",  color:"#4ade80" },
  doc:   { label:"DOC",   color:"#a78bfa" },
};

function FileThumbnail({ kind, width }) {
  const h=62;
  if(kind==="image") return (
    <div style={{width,height:h,
      background:"rgba(37,99,235,0.07)",
      backgroundImage:"repeating-linear-gradient(45deg,rgba(96,165,250,0.08) 0 5px,transparent 5px 10px),repeating-linear-gradient(-45deg,rgba(96,165,250,0.08) 0 5px,transparent 5px 10px)",
      position:"relative"}}>
      {/* faux pixel grid */}
      <div style={{position:"absolute",inset:0,
        backgroundImage:"repeating-linear-gradient(90deg,rgba(96,165,250,0.05) 0 1px,transparent 1px 8px),repeating-linear-gradient(0deg,rgba(96,165,250,0.05) 0 1px,transparent 1px 8px)"}}/>
    </div>
  );
  if(kind==="video") return (
    <div style={{width,height:h,background:"rgba(249,115,22,0.06)",
      position:"relative",overflow:"hidden"}}>
      {/* film strip holes left/right */}
      {[0,1].map(side=>(
        <div key={side} style={{position:"absolute",[side?"right":"left"]:0,
          top:0,bottom:0,width:10,background:"rgba(0,0,0,0.3)",
          display:"flex",flexDirection:"column",justifyContent:"space-around",
          alignItems:"center",padding:"4px 0"}}>
          {Array.from({length:4},(_,i)=>(
            <div key={i} style={{width:5,height:4,background:"rgba(249,115,22,0.25)",borderRadius:1}}/>
          ))}
        </div>
      ))}
      {/* center play indicator */}
      <div style={{position:"absolute",inset:0,display:"flex",
        alignItems:"center",justifyContent:"center"}}>
        <div style={{width:0,height:0,
          borderTop:"9px solid transparent",borderBottom:"9px solid transparent",
          borderLeft:"14px solid rgba(249,115,22,0.45)"}}/>
      </div>
      {/* scan lines */}
      <div style={{position:"absolute",inset:0,
        backgroundImage:"repeating-linear-gradient(0deg,rgba(249,115,22,0.04) 0 1px,transparent 1px 4px)"}}/>
    </div>
  );
  if(kind==="audio") {
    const pts=[];
    for(let i=0;i<=60;i++){
      const t=i/60,amp=Math.sin(t*12)*0.35+Math.sin(t*5+0.8)*0.25+0.05;
      pts.push(`${i===0?"M":"L"}${(t*(width-1)).toFixed(1)},${(h/2-amp*(h/2-4)).toFixed(1)}`);
    }
    for(let i=60;i>=0;i--){
      const t=i/60,amp=Math.sin(t*12)*0.35+Math.sin(t*5+0.8)*0.25+0.05;
      pts.push(`L${(t*(width-1)).toFixed(1)},${(h/2+amp*(h/2-4)).toFixed(1)}`);
    }
    return (
      <div style={{width,height:h,background:"rgba(251,191,36,0.05)",position:"relative"}}>
        <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} style={{position:"absolute",inset:0}}>
          <path d={pts.join(" ")+"Z"} fill="rgba(251,191,36,0.22)" stroke="rgba(251,191,36,0.6)" strokeWidth="0.8"/>
          <line x1="0" y1={h/2} x2={width} y2={h/2} stroke="rgba(251,191,36,0.25)" strokeWidth="0.5" strokeDasharray="4 4"/>
        </svg>
      </div>
    );
  }
  if(kind==="data") return (
    <div style={{width,height:h,background:"rgba(74,222,128,0.04)",
      backgroundImage:"repeating-linear-gradient(0deg,rgba(74,222,128,0.07) 0 1px,transparent 1px 12px),repeating-linear-gradient(90deg,rgba(74,222,128,0.07) 0 1px,transparent 1px 36px)",
      position:"relative"}}>
      <div style={{position:"absolute",inset:"8px 10px",display:"grid",
        gridTemplateColumns:"repeat(3,1fr)",gap:3}}>
        {Array.from({length:9},(_,i)=>(
          <div key={i} style={{height:6,background:`rgba(74,222,128,${0.1+Math.random()*0.25})`,borderRadius:1}}/>
        ))}
      </div>
    </div>
  );
  /* doc */
  return (
    <div style={{width,height:h,background:"rgba(167,139,250,0.05)",padding:"8px 10px"}}>
      {Array.from({length:5},(_,i)=>(
        <div key={i} style={{height:2,marginBottom:5,
          background:`rgba(167,139,250,${0.12+i*0.04})`,
          width:`${65+Math.sin(i*1.7)*28}%`}}/>
      ))}
    </div>
  );
}

function FileArtifact({ name, size, kind, meta, width=160 }) {
  const fk=FILE_KINDS[kind]||FILE_KINDS.data;
  return (
    <div style={{border:"1px solid rgba(37,99,235,0.28)",
      background:"rgba(37,99,235,0.04)",overflow:"hidden"}}>
      <div style={{position:"relative"}}>
        <FileThumbnail kind={kind} width={width}/>
        <div style={{position:"absolute",top:5,right:6,
          fontSize:6.5,letterSpacing:"0.14em",
          color:fk.color,background:"rgba(5,15,8,0.7)",
          padding:"1px 5px"}}>{fk.label}</div>
      </div>
      <div style={{padding:"8px 10px",borderTop:"1px solid rgba(37,99,235,0.18)"}}>
        <div style={{fontSize:8.5,color:"var(--sg-phosphor)",letterSpacing:"0.03em",
          marginBottom:3,wordBreak:"break-all",lineHeight:1.3}}>{name}</div>
        <div style={{display:"flex",gap:8,alignItems:"baseline"}}>
          <span style={{fontSize:7,color:"rgba(96,165,250,0.6)",letterSpacing:"0.06em"}}>{size}</span>
          {meta&&<span style={{fontSize:7,color:"rgba(74,222,128,0.4)",letterSpacing:"0.04em"}}>{meta}</span>}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SG DIVIDER — section label with flanking rules
   ════════════════════════════════════════════════════════════════ */
function SgDivider({ label, style={} }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,...style}}>
      <div style={{flex:1,height:1,background:"rgba(37,99,235,0.25)"}}/>
      <span style={{fontSize:6.5,letterSpacing:"0.24em",
        color:"rgba(74,222,128,0.36)",textTransform:"uppercase",
        whiteSpace:"nowrap"}}>{label}</span>
      <div style={{flex:1,height:1,background:"rgba(37,99,235,0.25)"}}/>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SINGULARITY TASK CARD — the small faction card
   Shown in the global task list. Always dark, sprockets, waveform.
   ════════════════════════════════════════════════════════════════ */
function SingularityCard({ title, description, level, points, onSignup }) {
  const tw=title.trim().split(" "), tlast=tw.pop();
  return (
    <div style={{width:214,background:"var(--sg-void)",
      border:"1px solid var(--sg-border-hard)",
      fontFamily:"var(--sg-mono)",color:"var(--sg-phosphor)",
      position:"relative",overflow:"hidden",display:"flex",
      flexDirection:"column"}}>
      <Scanlines/>
      <Corners size={10}/>

      <Sprockets n={7} style={{borderBottom:"1px solid rgba(37,99,235,0.4)"}}/>

      {/* card header */}
      <div style={{padding:"7px 12px 6px",borderBottom:"1px solid rgba(37,99,235,0.3)",
        position:"relative",zIndex:3}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
          <SingularityMark size={13}/>
          <span style={{fontSize:6.5,letterSpacing:"0.28em",
            color:"rgba(74,222,128,0.5)"}}>SINGULARITY</span>
        </div>
        <div style={{fontSize:6.5,color:"rgba(96,165,250,0.45)",letterSpacing:"0.12em"}}>
          PROTOCOL // SEALED
        </div>
      </div>

      {/* waveform strip */}
      <div style={{borderBottom:"1px solid rgba(37,99,235,0.25)",
        background:"rgba(74,222,128,0.02)",position:"relative",zIndex:3}}>
        <Waveform width={214} height={30} strokeWidth={1}/>
      </div>

      {/* content */}
      <div style={{padding:"8px 12px 10px",flex:1,position:"relative",zIndex:3,
        display:"flex",flexDirection:"column",gap:6}}>
        <div style={{fontSize:6.5,color:"rgba(96,165,250,0.45)",
          letterSpacing:"0.14em"}}>{"> OUTPUT:"}</div>
        <div style={{fontSize:14,lineHeight:1.15,letterSpacing:"0.03em",
          color:"var(--sg-phosphor-bright)"}}>
          {tw.join(" ")}{tw.length?" ":""}<span style={{color:"var(--sg-signal-bright)"}}>{tlast}</span>
          <span className="sg-blink" style={{display:"inline-block",width:5,height:12,
            background:"var(--sg-phosphor)",marginLeft:2,verticalAlign:"middle"}}/>
        </div>
        {description&&(
          <div style={{fontSize:7,color:"rgba(74,222,128,0.55)",lineHeight:1.55,
            overflow:"hidden",display:"-webkit-box",
            WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{description}</div>
        )}
        <div style={{marginTop:"auto",display:"flex",
          justifyContent:"space-between",alignItems:"center",
          paddingTop:6,borderTop:"1px solid rgba(37,99,235,0.22)"}}>
          <div style={{fontSize:7,color:"rgba(96,165,250,0.5)",letterSpacing:"0.1em"}}>
            LVL <span style={{color:"var(--sg-phosphor)"}}>{level}</span>
          </div>
          <div style={{fontSize:14,lineHeight:1,color:"var(--sg-amber)",
            letterSpacing:"0.04em"}}>{points}
            <span style={{fontSize:6.5,color:"rgba(251,191,36,0.5)",
              marginLeft:3}}>CR</span>
          </div>
        </div>
      </div>

      {onSignup&&(
        <button onClick={onSignup} style={{
          background:"transparent",color:"var(--sg-phosphor)",
          border:"none",borderTop:"1px solid rgba(37,99,235,0.35)",
          fontFamily:"var(--sg-mono)",fontSize:7.5,letterSpacing:"0.18em",
          textTransform:"uppercase",padding:"7px 0",cursor:"pointer",
          position:"relative",zIndex:3,
          transition:"background 100ms",
        }}
        onMouseEnter={e=>e.target.style.background="rgba(74,222,128,0.06)"}
        onMouseLeave={e=>e.target.style.background="transparent"}>
          {">"} JOIN PROTOCOL
        </button>
      )}

      <Sprockets n={7} style={{borderTop:"1px solid rgba(37,99,235,0.4)"}}/>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   EXPORTS
   ════════════════════════════════════════════════════════════════ */
Object.assign(window, {
  SingularityMark, Waveform, Sprockets, Scanlines, Corners,
  CircuitTrace, AsciiBar, FileArtifact, SgDivider, SingularityCard,
  SG_CONSENSUS, sgDistTotal, sgDistAvg, sgStanding,
});
