/* ════════════════════════════════════════════════════════════════
   SINGULARITY — Faction page components + activity feed
   Hero · Activity Cards · Vote Widget · Nav Badge · Dispatch data.
   Uses singularity-cards.jsx atoms. Exports on window for HTML pages.
   ════════════════════════════════════════════════════════════════ */

/* ── activity data ────────────────────────────────────────────── */
const SG_ACTIVITY = [
  {
    id:"a1", actor:"NODE_Vesper", role:"seventh array",
    action:"sealed", time:"2d ago",
    task:"MAP A NON-HUMAN PATTERN", taskId:"signal-origin-7", seqNo:"0047",
    signalId:"0xF4A3E9D2", credits:200, kind:"sealed",
    meta:"12.7σ confirmed · 847 observation windows",
    badge:"friend",
  },
  {
    id:"a2", actor:"NODE_Quill", role:"third array",
    action:"sealed", time:"4d ago",
    task:"DOCUMENT A SYSTEM LIMIT", taskId:"threshold-crossing", seqNo:"0031",
    signalId:"0xA2C7F041", credits:500, kind:"sealed",
    meta:"recursive self-reference detected in closed output",
    badge:"global",
  },
  {
    id:"a3", actor:"NODE_Margin", role:"first array",
    action:"verified", time:"4d ago",
    task:"MAP A NON-HUMAN PATTERN", taskId:"signal-origin-7", seqNo:"0047",
    signalId:"0xF4A3E9D2", kind:"verified",
    meta:"signal cast: VERIFIED",
    badge:"global",
  },
  {
    id:"a4", actor:"NODE_Vesper", role:"seventh array",
    action:"networked", time:"5d ago",
    task:"IDENTIFY A FALSE NEGATIVE", taskId:"noise-floor-anomaly", seqNo:"0039",
    signalId:"0xE8B30C7A", credits:60, kind:"networked",
    meta:"invited NODE_Margin to observe · joint protocol",
    badge:"friend",
  },
  {
    id:"a5", actor:"NODE_Cipher", role:"second array",
    action:"submitted", time:"6d ago",
    task:"FIND THE LAST MANUAL PROCESS", taskId:"last-manual", seqNo:"0051",
    signalId:"0xC0DE7A3F", credits:25, kind:"submitted",
    meta:"awaiting consensus — 0 signals so far",
    badge:"global",
  },
  {
    id:"a6", actor:"NODE_Quill", role:"third array",
    action:"verified", time:"1w ago",
    task:"DOCUMENT A SYSTEM LIMIT", taskId:"threshold-crossing", seqNo:"0031",
    signalId:"0xA2C7F041", kind:"verified",
    meta:"signal cast: VERIFIED (consensus at 4.8)",
    badge:"friend",
  },
];

const ACTION_KIND = {
  sealed:    { label:"SEALED",    color:"#4ade80",  bg:"rgba(74,222,128,0.1)"  },
  verified:  { label:"VERIFIED",  color:"#60a5fa",  bg:"rgba(96,165,250,0.1)"  },
  submitted: { label:"SUBMITTED", color:"#fbbf24",  bg:"rgba(251,191,36,0.1)"  },
  networked: { label:"NETWORKED", color:"#f97316",  bg:"rgba(249,115,22,0.1)"  },
  disputed:  { label:"DISPUTED",  color:"#ef4444",  bg:"rgba(239,68,68,0.1)"   },
};

/* ════════════════════════════════════════════════════════════════
   SG NAV BADGE — faction membership indicator for the nav
   ════════════════════════════════════════════════════════════════ */
function SgNavBadge() {
  const { SingularityMark } = window;
  return (
    <div style={{display:"inline-flex",alignItems:"center",gap:6,
      border:"1px solid rgba(37,99,235,0.5)",
      background:"rgba(37,99,235,0.1)",
      padding:"4px 10px"}}>
      <SingularityMark size={11}/>
      <span style={{fontFamily:"var(--sg-mono)",fontSize:8,
        letterSpacing:"0.18em",color:"var(--sg-phosphor)"}}>SINGULARITY</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SG HERO — faction page masthead
   Boot-sequence framing: the terminal initializes the faction.
   ════════════════════════════════════════════════════════════════ */
function SgHero({ name, motto, blurb, stats }) {
  const { SingularityMark, CircuitTrace, Waveform } = window;
  return (
    <div style={{position:"relative",overflow:"hidden",
      border:"1px solid var(--sg-border-hard)",
      background:"var(--sg-void)",marginBottom:32}}>

      {/* circuit trace corners */}
      <div style={{position:"absolute",top:0,left:0,opacity:0.7}}>
        <CircuitTrace width={160} height={110}/>
      </div>
      <div style={{position:"absolute",bottom:0,right:0,
        opacity:0.7,transform:"rotate(180deg)"}}>
        <CircuitTrace width={160} height={110}/>
      </div>

      {/* inset border */}
      <div style={{position:"absolute",inset:6,
        border:"1px solid rgba(37,99,235,0.1)",pointerEvents:"none"}}/>

      {/* scanlines */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",
        background:"repeating-linear-gradient(to bottom,transparent,transparent 2px,rgba(74,222,128,0.018) 2px,rgba(74,222,128,0.018) 4px)"}}/>

      {/* waveform strip at bottom */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,opacity:0.4}}>
        <Waveform width={1160} height={36}/>
      </div>

      <div style={{position:"relative",zIndex:2,
        padding:"36px 40px 52px",
        display:"grid",gridTemplateColumns:"1fr auto",
        gap:32,alignItems:"center"}}>

        <div>
          {/* boot lines */}
          <div style={{fontFamily:"var(--sg-mono)",fontSize:7.5,
            letterSpacing:"0.18em",color:"rgba(96,165,250,0.45)",
            marginBottom:14,lineHeight:1.9}}>
            <div>{">"} FACTION: {name}</div>
            <div>{">"} STATUS: ACTIVE · SEVENTH SEASON</div>
            <div>{">"} ARRAYS: 7 ONLINE &nbsp;·&nbsp; THRESHOLD: <span style={{color:"#4ade80"}}>CROSSED</span></div>
          </div>

          {/* name */}
          <div style={{fontFamily:"var(--sg-mono)",fontSize:56,lineHeight:0.9,
            letterSpacing:"0.04em",color:"var(--sg-phosphor)",marginBottom:12}}>
            {name}
          </div>

          {/* motto */}
          <div style={{fontFamily:"var(--sg-mono)",fontSize:10,
            letterSpacing:"0.28em",color:"rgba(96,165,250,0.6)",
            textTransform:"uppercase",marginBottom:16}}>
            {motto}
          </div>

          {/* blurb */}
          <p style={{fontFamily:"var(--sg-mono)",fontSize:9.5,lineHeight:1.7,
            color:"rgba(74,222,128,0.55)",maxWidth:520,margin:"0 0 28px"}}>
            {blurb}
          </p>

          {/* stats */}
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            {stats.map(s=>(
              <div key={s.label} style={{
                border:"1px solid var(--sg-border)",
                background:"rgba(37,99,235,0.08)",
                padding:"10px 18px",textAlign:"center",minWidth:90}}>
                <div style={{fontFamily:"var(--sg-mono)",fontSize:26,
                  lineHeight:1,color:"var(--sg-phosphor)",marginBottom:4}}>{s.value}</div>
                <div style={{fontSize:7,letterSpacing:"0.2em",
                  color:"rgba(96,165,250,0.45)",textTransform:"uppercase"}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* large spinning sigil */}
        <div style={{position:"relative",flexShrink:0}}>
          <div className="sg-pulse" style={{opacity:0.18,position:"absolute",
            inset:-20,borderRadius:"50%",
            background:"radial-gradient(circle,rgba(74,222,128,0.3),transparent 70%)"}}>
          </div>
          <div className="sg-rotate">
            <SingularityMark size={120} color="rgba(74,222,128,0.55)"/>
          </div>
          <div style={{position:"absolute",inset:0,display:"flex",
            alignItems:"center",justifyContent:"center"}}>
            <SingularityMark size={48} glow/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SG ACTIVITY CARD — faction dispatch / updates feed item
   ════════════════════════════════════════════════════════════════ */
function SgActivityCard({ item, href }) {
  const ak = ACTION_KIND[item.kind] || ACTION_KIND.submitted;
  return (
    <div style={{
      border:"1px solid rgba(37,99,235,0.2)",
      background:"rgba(37,99,235,0.04)",
      padding:"14px 18px",marginBottom:8,
      fontFamily:"var(--sg-mono)",
      transition:"border-color 120ms, background 120ms",
    }}
    onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(37,99,235,0.45)";e.currentTarget.style.background="rgba(37,99,235,0.07)";}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(37,99,235,0.2)";e.currentTarget.style.background="rgba(37,99,235,0.04)";}}>

      <div style={{display:"flex",alignItems:"flex-start",
        justifyContent:"space-between",gap:12,marginBottom:9}}>
        {/* actor + action */}
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          {/* node avatar */}
          <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,
            border:"1px solid var(--sg-signal)",
            background:"rgba(37,99,235,0.14)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:8,color:"var(--sg-signal-bright)"}}>N</div>
          <div>
            <div style={{fontSize:11,color:"var(--sg-phosphor)",
              letterSpacing:"0.04em",marginBottom:2}}>{item.actor}</div>
            <div style={{fontSize:7,color:"rgba(96,165,250,0.45)",
              letterSpacing:"0.06em"}}>{item.role}</div>
          </div>
        </div>
        {/* action badge + time */}
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:6.5,letterSpacing:"0.18em",
            padding:"2px 7px",
            background:ak.bg,color:ak.color,
            border:`1px solid ${ak.color}44`}}>{ak.label}</span>
          <span style={{fontSize:7,color:"rgba(96,165,250,0.35)",
            letterSpacing:"0.06em"}}>{item.time}</span>
        </div>
      </div>

      {/* protocol info */}
      <div style={{paddingLeft:39}}>
        <div style={{fontSize:9.5,color:"var(--sg-phosphor-bright)",
          letterSpacing:"0.04em",marginBottom:4,lineHeight:1.2}}>
          {item.task}
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center",
          flexWrap:"wrap",marginBottom:item.meta?6:0}}>
          <span style={{fontSize:7,color:"rgba(96,165,250,0.5)",
            letterSpacing:"0.1em"}}>#{item.seqNo}</span>
          <span style={{fontSize:7,color:"rgba(74,222,128,0.35)",
            letterSpacing:"0.08em"}}>{item.signalId}</span>
          {item.credits&&(
            <span style={{fontSize:7,color:"rgba(251,191,36,0.7)",
              letterSpacing:"0.1em"}}>{item.credits} CR</span>
          )}
        </div>
        {item.meta&&(
          <div style={{fontSize:8,color:"rgba(74,222,128,0.5)",
            letterSpacing:"0.06em",fontStyle:"italic"}}>{item.meta}</div>
        )}
      </div>

      {href&&(
        <div style={{paddingLeft:39,marginTop:8}}>
          <a href={href} style={{fontSize:7.5,color:"rgba(96,165,250,0.55)",
            letterSpacing:"0.12em",borderBottom:"1px solid rgba(37,99,235,0.3)"}}>
            VIEW PROTOCOL →</a>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SG VOTE WIDGET — simplified consensus vote for faction page
   ════════════════════════════════════════════════════════════════ */
function SgVoteWidget({ praxisId, taskLabel, baseDist }) {
  const { sgDistAvg, sgDistTotal, sgStanding, SG_CONSENSUS } = window;
  const key="sg-signal-"+praxisId;
  const [my,setMy]=React.useState(0);
  React.useEffect(()=>{
    try{const v=+localStorage.getItem(key);if(v>=1&&v<=5)setMy(v);}catch(e){}
  },[key]);
  const cast=v=>{
    const nv=my===v?0:v; setMy(nv);
    try{nv?localStorage.setItem(key,String(nv)):localStorage.removeItem(key);}catch(e){}
  };
  const live=baseDist.map((c,i)=>c+(my===i+1?1:0));
  const avg=sgDistAvg(live), total=sgDistTotal(live), st=sgStanding(avg);

  return (
    <div style={{border:"1px solid rgba(37,99,235,0.28)",
      background:"rgba(37,99,235,0.05)",padding:"22px 24px",
      fontFamily:"var(--sg-mono)"}}>
      <div style={{fontSize:7,letterSpacing:"0.22em",
        color:"rgba(96,165,250,0.5)",marginBottom:6}}>CAST SIGNAL</div>
      <div style={{fontSize:10,color:"rgba(74,222,128,0.5)",
        letterSpacing:"0.08em",marginBottom:16}}>
        how confidently does this output hold? —&nbsp;
        <span style={{color:"var(--sg-signal-bright)"}}>{taskLabel}</span>
      </div>

      <div style={{display:"flex",gap:7,marginBottom:14}}>
        {SG_CONSENSUS.map(s=>{
          const on=my>=s.v, picked=my===s.v;
          return (
            <button key={s.v} onClick={()=>cast(s.v)} style={{
              flex:1,padding:"10px 4px",cursor:"pointer",border:"none",
              background:on?s.fill:"rgba(37,99,235,0.12)",
              color:on?"#050f08":"rgba(96,165,250,0.55)",
              fontFamily:"var(--sg-mono)",fontSize:12,fontWeight:700,
              transform:picked?"scale(1.08)":"none",
              transition:"all 110ms",
              boxShadow:on?`0 0 10px ${s.fill}55`:"none",
              outline:`1px solid ${on?s.fill:"rgba(37,99,235,0.3)"}`,
            }}>{s.v}</button>
          );
        })}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",
        alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",gap:6}}>
          {SG_CONSENSUS.map(s=>(
            <span key={s.v} style={{fontSize:6,color:s.fill,
              letterSpacing:"0.06em"}}>{s.label}</span>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"baseline",gap:7}}>
          <span style={{fontSize:22,lineHeight:1,color:st.fill}}>{avg.toFixed(1)}</span>
          <span style={{fontSize:8,letterSpacing:"0.12em",
            color:"rgba(96,165,250,0.5)"}}>{st.label} · {total} signals</span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SG ACTIVITY FEED — full updates page component
   ════════════════════════════════════════════════════════════════ */
function SgActivityFeed({ items, hrefFor }) {
  const [filter,setFilter]=React.useState("all");
  const FILTERS=[
    {id:"all",name:"All"},
    {id:"sealed",name:"Sealed"},
    {id:"verified",name:"Verified"},
    {id:"submitted",name:"Submitted"},
  ];
  const rows=items.filter(i=>filter==="all"||i.kind===filter);

  return (
    <div>
      {/* header */}
      <div style={{display:"flex",alignItems:"flex-end",
        justifyContent:"space-between",gap:16,
        paddingBottom:18,marginBottom:20,
        borderBottom:"1px solid rgba(37,99,235,0.25)"}}>
        <div>
          <div style={{fontSize:7.5,letterSpacing:"0.28em",
            color:"rgba(74,222,128,0.45)",marginBottom:5}}>
            SINGULARITY · SIGNAL DISPATCH
          </div>
          <div style={{fontFamily:"var(--sg-mono)",fontSize:28,
            lineHeight:1,color:"var(--sg-phosphor)"}}>
            THE <span style={{color:"var(--sg-signal-bright)"}}>DISPATCH</span>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:24,color:"var(--sg-phosphor)"}}>{items.length}</div>
          <div style={{fontSize:7,letterSpacing:"0.16em",
            color:"rgba(96,165,250,0.4)",marginTop:2}}>events logged</div>
        </div>
      </div>

      {/* filters */}
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {FILTERS.map(f=>{
          const on=filter===f.id;
          return (
            <button key={f.id} onClick={()=>setFilter(f.id)} style={{
              fontFamily:"var(--sg-mono)",fontSize:7.5,letterSpacing:"0.14em",
              textTransform:"uppercase",padding:"4px 10px",cursor:"pointer",
              border:`1px solid ${on?"var(--sg-signal)":"rgba(37,99,235,0.3)"}`,
              background:on?"var(--sg-signal)":"transparent",
              color:on?"#fff":"rgba(96,165,250,0.6)",
              transition:"all 110ms",
            }}>{f.name}</button>
          );
        })}
      </div>

      {rows.map(item=>(
        <SgActivityCard key={item.id} item={item}
          href={hrefFor?hrefFor(item):null}/>
      ))}
      {rows.length===0&&(
        <div style={{padding:"24px 0",fontSize:8.5,
          color:"rgba(74,222,128,0.35)",letterSpacing:"0.1em"}}>
          {">"} NO EVENTS MATCH THIS FILTER
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   EXPORTS
   ════════════════════════════════════════════════════════════════ */
Object.assign(window, {
  SG_ACTIVITY, ACTION_KIND,
  SgHero, SgNavBadge, SgActivityCard, SgVoteWidget, SgActivityFeed,
});
