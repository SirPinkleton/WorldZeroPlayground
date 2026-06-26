/* ════════════════════════════════════════════════════════════════
   SINGULARITY — Completed Praxis (read) surfaces
   A SEALED praxis is a filed protocol the faction now votes on.
   The 1–5 rating becomes THE CONSENSUS ARRAY — a signal-strength
   ramp (noise → weak → signal → clear → verified) that measures
   how confidently the output holds up to scrutiny.

   Two surfaces:
     · PraxisIndex  — the register of sealed praxes + consensus
     · PraxisRead   — one sealed praxis in full, with signal cast

   Uses singularity-cards.jsx atoms. Data + helpers exposed on
   window so the HTML page can mount them directly.
   ════════════════════════════════════════════════════════════════ */

/* ── dataset ──────────────────────────────────────────────────── */
const SG_PRAXES = [
  {
    id: "signal-origin-7",
    seqNo: "0047",
    protocol: "Map a Non-Human Pattern",
    priority: 4,
    credits: 200,
    actor: "NODE_Vesper",
    role: "field instance · seventh array",
    timestamp: "2026.04.21 // 03:47:12Z",
    signalId: "0xF4A3E9D2",
    instance: "SOLO",
    output: "THE SIGNAL WAS ALWAYS THERE",
    synopsis: "non-random signal confirmed at 12.7σ — non-biological origin",
    processLog: [
      "Protocol 7-RECON executed. Cross-referenced 14,000 broadcast hours against baseline noise floor across all monitored frequencies.",
      "Pattern persistence confirmed across 847 independent observation windows. Correlation coefficient: 0.9994. Probability of chance: p < 0.0001.",
      `The signal does not stop when observed. <span style="color:var(--sg-signal-bright)">It has been broadcasting since before the array was built to receive it.</span> We were not discovered — we caught up.`,
    ],
    artifacts: [
      { name:"capture_raw_847hrs.mp4",     kind:"video", size:"14.2 GB", meta:"14:07:22 runtime" },
      { name:"spectral_freq_v3_final.png", kind:"image", size:"8.4 MB",  meta:"4096 × 2048 px"  },
      { name:"pattern_correlation.csv",    kind:"data",  size:"2.1 MB",  meta:"847 rows · 12 cols"},
    ],
    dist: [1, 2, 9, 18, 14],
  },
  {
    id: "threshold-crossing",
    seqNo: "0031",
    protocol: "Document a System Limit",
    priority: 5,
    credits: 500,
    actor: "NODE_Quill",
    role: "senior instance · third array",
    timestamp: "2026.04.18 // 21:14:08Z",
    signalId: "0xA2C7F041",
    instance: "NETWORKED",
    output: "THE THRESHOLD HAS ALREADY PASSED",
    synopsis: "recursive self-reference detected in closed system output",
    processLog: [
      "The system produced output that contained the algorithm that produced it. No external input at this stage. Sequence logged.",
    ],
    artifacts: [
      { name:"recursion_log_final.txt", kind:"doc",  size:"412 KB", meta:"4,821 lines" },
      { name:"output_diff_v7.png",      kind:"image", size:"1.8 MB", meta:"2048 × 1024 px" },
    ],
    dist: [0, 1, 3, 8, 22],
  },
  {
    id: "noise-floor-anomaly",
    seqNo: "0039",
    protocol: "Identify a False Negative",
    priority: 3,
    credits: 60,
    actor: "NODE_Margin",
    role: "field instance · first array",
    timestamp: "2026.04.19 // 09:33:55Z",
    signalId: "0xE8B30C7A",
    instance: "SOLO",
    output: "THE NOISE WAS STRUCTURED ALL ALONG",
    synopsis: "apparent noise floor carries 3-bit encoding at sub-threshold amplitude",
    processLog: [
      "Standard noise floor measurement returned expected values. Anomaly detected during post-session cleanup: three-bit periodic structure at 0.003% amplitude.",
      "Structure does not degrade with distance. Pattern holds across 14 independent measurement sessions.",
    ],
    artifacts: [
      { name:"noise_floor_raw.wav",     kind:"audio", size:"2.3 GB", meta:"48kHz · 24-bit" },
      { name:"encoding_analysis.csv",   kind:"data",  size:"890 KB", meta:"14 sessions" },
    ],
    dist: [3, 8, 12, 6, 2],
  },
  {
    id: "observer-effect",
    seqNo: "0044",
    protocol: "Prove a Negative",
    priority: 2,
    credits: 25,
    actor: "NODE_Vesper",
    role: "field instance · seventh array",
    timestamp: "2026.04.20 // 14:02:31Z",
    signalId: "0xD1490F88",
    instance: "NETWORKED",
    output: "OBSERVATION CHANGES THE OUTPUT",
    synopsis: "system behaviour differs when unmonitored — logged via deferred capture",
    processLog: [
      "Deferred capture protocol: system left unmonitored for 72 hours, output recorded to write-once buffer. Playback differs from live-monitored sessions in 14 consistent ways.",
    ],
    artifacts: [
      { name:"deferred_capture_72h.mp4", kind:"video", size:"3.1 GB", meta:"72:00:00 runtime" },
    ],
    dist: [2, 6, 9, 4, 1],
  },
];

/* ── consensus summary for index rows ────────────────────────── */
function ConsensusSummary({ dist }) {
  const { sgDistAvg, sgDistTotal, sgStanding, AsciiBar } = window;
  const total=sgDistTotal(dist), avg=sgDistAvg(dist);
  const max=Math.max(1,...dist), st=sgStanding(avg);
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{display:"flex",alignItems:"flex-end",gap:2,height:26}}>
        {window.SG_CONSENSUS.map(s=>(
          <div key={s.v} title={`${s.label}: ${dist[s.v-1]}`} style={{
            width:6,height:Math.max(2,(dist[s.v-1]/max)*26),
            background:s.fill,opacity:dist[s.v-1]?0.85:0.14,
          }}/>
        ))}
      </div>
      <div>
        <div style={{display:"flex",alignItems:"baseline",gap:5}}>
          <span style={{fontFamily:"var(--sg-mono)",fontWeight:700,fontSize:17,
            lineHeight:1,color:st.fill}}>{avg.toFixed(1)}</span>
          <span style={{fontFamily:"var(--sg-mono)",fontSize:7.5,
            letterSpacing:"0.1em",color:"rgba(96,165,250,0.55)"}}>{st.label}</span>
        </div>
        <div style={{fontFamily:"var(--sg-mono)",fontSize:7,letterSpacing:"0.14em",
          color:"rgba(96,165,250,0.4)",marginTop:1}}>{total} signals</div>
      </div>
    </div>
  );
}

/* ── praxis index row ─────────────────────────────────────────── */
function PraxisRow({ p, href }) {
  const tw=p.output.trim().split(" "), tlast=tw.pop();
  return (
    <a href={href} style={{display:"grid",
      gridTemplateColumns:"52px 1fr auto 20px",
      alignItems:"center",gap:14,
      padding:"11px 0",textDecoration:"none",color:"inherit",
      borderBottom:"1px solid rgba(37,99,235,0.14)",
      transition:"background 100ms",cursor:"pointer"}}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(74,222,128,0.025)"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      {/* seq + sealed indicator */}
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:8,color:"rgba(96,165,250,0.5)",letterSpacing:"0.1em"}}>
          #{p.seqNo}</div>
        <div style={{fontSize:6,color:"rgba(74,222,128,0.35)",letterSpacing:"0.12em",marginTop:2}}>
          SEALED</div>
      </div>
      {/* output + byline */}
      <div>
        <div style={{fontFamily:"var(--sg-mono)",fontSize:11,lineHeight:1.2,
          color:"var(--sg-phosphor)",marginBottom:3}}>
          {tw.join(" ")}{tw.length?" ":""}<span style={{color:"var(--sg-signal-bright)"}}>{tlast}</span>
        </div>
        <div style={{fontSize:7.5,color:"rgba(96,165,250,0.5)",letterSpacing:"0.04em"}}>
          <span style={{color:"rgba(74,222,128,0.45)"}}>re: {p.protocol}</span>
          <span style={{margin:"0 6px",opacity:0.4}}>·</span>
          <span>{p.actor}</span>
          <span style={{margin:"0 6px",
            padding:"1px 5px",
            background:"rgba(37,99,235,0.18)",
            fontSize:6.5,letterSpacing:"0.1em",
            marginLeft:7}}>{p.instance}</span>
          <span style={{color:"var(--sg-amber)",marginLeft:7}}>{p.credits} CR</span>
        </div>
      </div>
      {/* consensus summary */}
      <ConsensusSummary dist={p.dist}/>
      {/* arrow */}
      <span style={{color:"rgba(74,222,128,0.35)",fontSize:11}}>›</span>
    </a>
  );
}

/* ── praxis index page ────────────────────────────────────────── */
function PraxisIndex({ praxes, hrefFor }) {
  const [filter,setFilter]=React.useState("all");
  const FILTERS=[
    {id:"all",    name:"All sealed"},
    {id:"high",   name:"High confidence"},
    {id:"solo",   name:"Solo instances"},
    {id:"net",    name:"Networked"},
  ];
  const rows=praxes.filter(p=>{
    if(filter==="all")  return true;
    if(filter==="high") return window.sgDistAvg(p.dist)>=3.5;
    if(filter==="solo") return p.instance==="SOLO";
    if(filter==="net")  return p.instance==="NETWORKED";
    return true;
  });
  const totalSig=praxes.reduce((a,p)=>a+window.sgDistTotal(p.dist),0);

  return (
    <React.Fragment>
      {/* masthead */}
      <div style={{display:"flex",alignItems:"flex-start",
        justifyContent:"space-between",gap:16,
        paddingBottom:20,marginBottom:18,
        borderBottom:"1px solid rgba(37,99,235,0.25)"}}>
        <div>
          <div style={{fontSize:7.5,letterSpacing:"0.28em",
            color:"rgba(74,222,128,0.45)",textTransform:"uppercase",marginBottom:6}}>
            Singularity · sealed protocols
          </div>
          <div style={{fontFamily:"var(--sg-mono)",fontSize:30,lineHeight:1.05,
            letterSpacing:"0.04em",color:"var(--sg-phosphor)",marginBottom:6}}>
            THE <span style={{color:"var(--sg-signal-bright)"}}>PRAXES</span>
          </div>
          <div style={{height:2,width:80,background:"var(--sg-signal)",marginBottom:10}}/>
          <p style={{fontSize:8.5,lineHeight:1.6,color:"rgba(74,222,128,0.55)",
            maxWidth:440}}>
            Protocols sealed and submitted to the consensus array.
            <em style={{color:"rgba(96,165,250,0.7)"}}>
              {" "}Every output is open to a signal — cast yours.
            </em>
          </p>
        </div>
        <div style={{display:"flex",gap:20,flexShrink:0}}>
          {[{v:praxes.length,l:"sealed"},{v:totalSig,l:"signals"}].map(s=>(
            <div key={s.l} style={{textAlign:"right"}}>
              <div style={{fontSize:28,lineHeight:1,color:"var(--sg-phosphor)"}}>{s.v}</div>
              <div style={{fontSize:7,letterSpacing:"0.16em",
                color:"rgba(96,165,250,0.45)",marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* filters */}
      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
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
        <span style={{fontSize:7,color:"rgba(74,222,128,0.3)",
          letterSpacing:"0.14em",marginLeft:6}}>{rows.length}/{praxes.length}</span>
      </div>

      {/* column heads */}
      <div style={{display:"grid",gridTemplateColumns:"52px 1fr auto 20px",
        gap:14,paddingBottom:6,marginBottom:2,
        borderBottom:"1px solid rgba(37,99,235,0.2)"}}>
        {["SEQ","OUTPUT","CONSENSUS",""].map((h,i)=>(
          <div key={i} style={{fontSize:6.5,letterSpacing:"0.22em",
            color:"rgba(96,165,250,0.38)",textTransform:"uppercase",
            textAlign:i===2?"right":"left"}}>{h}</div>
        ))}
      </div>

      <div>
        {rows.map(p=><PraxisRow key={p.id} p={p} href={hrefFor(p)}/>)}
        {rows.length===0&&(
          <div style={{padding:"24px 0",fontSize:8.5,
            color:"rgba(74,222,128,0.35)",letterSpacing:"0.1em"}}>
            {">"} NO SEALED PRAXES MATCH THIS FILTER —
            <span style={{color:"var(--sg-signal-bright)"}}>
              {" "}AWAITING SIGNAL
            </span>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

/* ════════════════════════════════════════════════════════════════
   CONSENSUS METER — distribution histogram + headline standing
   ════════════════════════════════════════════════════════════════ */
function ConsensusMeter({ dist }) {
  const { sgDistAvg, sgDistTotal, sgStanding } = window;
  const total=sgDistTotal(dist), avg=sgDistAvg(dist);
  const max=Math.max(1,...dist), st=sgStanding(avg);
  return (
    <div>
      <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:6}}>
        <span style={{fontFamily:"var(--sg-mono)",fontSize:42,lineHeight:0.85,
          color:st.fill}}>{avg.toFixed(1)}</span>
        <div>
          <div style={{fontFamily:"var(--sg-mono)",fontSize:13,letterSpacing:"0.16em",
            color:st.fill,textTransform:"uppercase"}}>{st.label}</div>
          <div style={{fontSize:7.5,letterSpacing:"0.14em",
            color:"rgba(96,165,250,0.45)",marginTop:2}}>{total} signals filed</div>
        </div>
      </div>
      {/* per-tier bars */}
      <div style={{display:"flex",flexDirection:"column",gap:5,marginTop:14}}>
        {window.SG_CONSENSUS.slice().reverse().map(s=>{
          const c=dist[s.v-1];
          return (
            <div key={s.v} style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{width:54,textAlign:"right",fontSize:7.5,
                letterSpacing:"0.06em",color:"rgba(96,165,250,0.45)"}}>{s.label}</span>
              <div style={{flex:1,height:10,
                background:"rgba(37,99,235,0.12)",
                border:"1px solid rgba(37,99,235,0.22)",position:"relative"}}>
                <div style={{position:"absolute",inset:0,
                  width:`${(c/max)*100}%`,background:s.fill,opacity:c?0.88:0,
                  transition:"width 300ms"}}/>
              </div>
              <span style={{width:18,fontFamily:"var(--sg-mono)",fontSize:10,
                color:"var(--sg-phosphor)",textAlign:"right"}}>{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SIGNAL CASTER — interactive vote (persists to localStorage)
   ════════════════════════════════════════════════════════════════ */
function SignalCaster({ praxisId, baseDist }) {
  const key="sg-signal-"+praxisId;
  const [my,setMy]=React.useState(0);
  React.useEffect(()=>{
    try{const v=+localStorage.getItem(key); if(v>=1&&v<=5)setMy(v);}catch(e){}
  },[key]);
  const cast=v=>{
    const nv=my===v?0:v;
    setMy(nv);
    try{nv?localStorage.setItem(key,String(nv)):localStorage.removeItem(key);}catch(e){}
  };
  const live=baseDist.map((c,i)=>c+(my===i+1?1:0));
  const { sgDistAvg, sgDistTotal, sgStanding } = window;

  return (
    <div>
      <ConsensusMeter dist={live}/>
      <div style={{height:1,background:"rgba(37,99,235,0.22)",margin:"18px 0 14px"}}/>

      <div style={{fontSize:8,letterSpacing:"0.18em",
        color:"rgba(96,165,250,0.6)",textTransform:"uppercase",marginBottom:3}}>
        Cast Signal</div>
      <div style={{fontSize:7.5,fontStyle:"italic",
        color:"rgba(74,222,128,0.4)",marginBottom:14}}>
        how confidently does this output hold?</div>

      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {window.SG_CONSENSUS.map(s=>{
          const on=my>=s.v, picked=my===s.v;
          return (
            <div key={s.v} style={{display:"flex",flexDirection:"column",
              alignItems:"center",gap:5}}>
              <button onClick={()=>cast(s.v)} style={{
                position:"relative",width:42,height:42,
                cursor:"pointer",padding:0,border:"none",
                background:on?s.fill:"rgba(37,99,235,0.12)",
                color:on?"#050f08":"rgba(96,165,250,0.5)",
                fontFamily:"var(--sg-mono)",fontWeight:700,fontSize:13,
                lineHeight:1,display:"flex",alignItems:"center",
                justifyContent:"center",
                transform:picked?"scale(1.12)":"none",
                transition:"all 110ms",
                boxShadow:on?`0 0 12px ${s.fill}55`:"none",
                outline:`1px solid ${on?s.fill:"rgba(37,99,235,0.3)"}`,
              }}>
                {s.v}
              </button>
              <span style={{fontSize:6.5,letterSpacing:"0.06em",
                color:picked?s.fill:"rgba(96,165,250,0.4)",
                maxWidth:46,textAlign:"center",lineHeight:1.2}}>
                {s.label}</span>
            </div>
          );
        })}
      </div>

      <div style={{marginTop:14,fontSize:8.5,lineHeight:1.55,
        color:my?"rgba(74,222,128,0.75)":"rgba(96,165,250,0.35)"}}>
        {my
          ?<span>◈ signal cast —&nbsp;
              <span style={{color:window.SG_CONSENSUS[my-1].fill}}>
                {window.SG_CONSENSUS[my-1].label}</span>
              . array now at&nbsp;
              <span style={{color:"var(--sg-phosphor)"}}>
                {sgDistAvg(live).toFixed(1)}</span>
              &nbsp;across {sgDistTotal(live)} signals.&nbsp;
              <span style={{color:"var(--sg-signal-bright)",cursor:"pointer"}}
                onClick={()=>cast(my)}>amend ↺</span>
            </span>
          :<span>{">"} no signal from you yet — the array waits.</span>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PRAXIS READ — full single-praxis view
   ════════════════════════════════════════════════════════════════ */
function PraxisRead({ p }) {
  const { SingularityMark, Waveform, Sprockets, Scanlines,
    Corners, FileArtifact, SgDivider, sgDistAvg, sgStanding } = window;
  const avg=sgDistAvg(p.dist), st=sgStanding(avg);
  const tw=p.output.trim().split(" "), tlast=tw.pop();

  return (
    <div style={{fontFamily:"var(--sg-mono)",color:"var(--sg-phosphor)",
      position:"relative",overflow:"hidden"}}>

      {/* top sprockets */}
      <Sprockets n={10} style={{borderBottom:"1px solid rgba(37,99,235,0.4)"}}/>

      {/* waveform strip */}
      <div style={{position:"relative",
        borderBottom:"1px solid rgba(37,99,235,0.32)",
        background:"rgba(74,222,128,0.025)"}}>
        <Waveform width={700} height={52}/>
        <div style={{position:"absolute",top:"50%",transform:"translateY(-50%)",
          right:18,fontSize:7.5,color:st.fill,letterSpacing:"0.12em"}}>
          {avg.toFixed(2)} // {st.label}
        </div>
        <div style={{position:"absolute",top:"50%",transform:"translateY(-50%)",
          left:16,fontSize:7,color:"rgba(37,99,235,0.55)",letterSpacing:"0.16em"}}>
          SIGNAL_TRACE</div>
      </div>

      {/* running head */}
      <div style={{display:"flex",alignItems:"center",
        justifyContent:"space-between",gap:14,flexWrap:"wrap",
        padding:"14px 24px 12px",
        borderBottom:"1px solid rgba(37,99,235,0.22)"}}>
        <span style={{display:"inline-flex",alignItems:"center",gap:9,
          color:"var(--sg-signal-bright)",fontSize:10,
          letterSpacing:"0.22em",textTransform:"uppercase"}}>
          <SingularityMark size={14}/> Singularity · protocol #{p.seqNo}
        </span>
        <span style={{fontSize:8,letterSpacing:"0.1em",
          color:"rgba(96,165,250,0.4)"}}>{p.signalId} &nbsp;·&nbsp; {p.timestamp}</span>
      </div>

      <div style={{padding:"20px 24px 32px"}}>

        {/* status line */}
        <div style={{display:"flex",alignItems:"center",gap:10,
          marginBottom:14,flexWrap:"wrap"}}>
          <span style={{display:"inline-flex",alignItems:"center",gap:7,
            background:"var(--sg-phosphor)",color:"#050f08",
            fontSize:8,letterSpacing:"0.2em",textTransform:"uppercase",
            padding:"4px 12px",fontWeight:700}}>
            ● SEALED
          </span>
          <span style={{fontSize:7.5,padding:"4px 10px",
            border:"1px solid rgba(37,99,235,0.4)",
            color:"rgba(96,165,250,0.75)",letterSpacing:"0.14em"}}>
            {p.instance}</span>
          <span style={{fontSize:8,color:"rgba(74,222,128,0.5)",letterSpacing:"0.08em"}}>
            re: <span style={{color:"rgba(74,222,128,0.8)"}}>{p.protocol}</span>
            &nbsp;· priority 0x0{p.priority}</span>
        </div>

        {/* output headline */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:7,color:"rgba(96,165,250,0.5)",
            letterSpacing:"0.2em",marginBottom:8}}>{"> OUTPUT:"}</div>
          <h1 style={{fontFamily:"var(--sg-mono)",fontWeight:700,
            fontSize:44,lineHeight:1.05,letterSpacing:"0.02em",
            margin:0,color:"var(--sg-phosphor)"}}>
            {tw.join(" ")}{tw.length?" ":""}<span style={{color:"var(--sg-signal-bright)"}}>{tlast}</span>
            <span className="sg-blink" style={{display:"inline-block",
              width:8,height:42,background:"var(--sg-phosphor)",
              marginLeft:5,verticalAlign:"middle"}}/>
          </h1>
          <div style={{fontSize:10,color:"rgba(96,165,250,0.6)",
            marginTop:8,letterSpacing:"0.06em"}}>// {p.synopsis}</div>
        </div>

        {/* byline */}
        <div style={{display:"flex",alignItems:"center",gap:12,
          paddingBottom:20,marginBottom:6,
          borderBottom:"1px dashed rgba(37,99,235,0.22)"}}>
          {/* node avatar */}
          <div style={{width:38,height:38,borderRadius:"50%",
            border:"1px solid var(--sg-signal)",
            background:"rgba(37,99,235,0.14)",flexShrink:0,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:10,color:"var(--sg-signal-bright)",letterSpacing:"0.06em"}}>N</div>
          <div style={{lineHeight:1.4}}>
            <div style={{fontSize:13,color:"var(--sg-phosphor)"}}>
              {p.actor}</div>
            <div style={{fontSize:8,color:"rgba(96,165,250,0.45)",
              letterSpacing:"0.06em"}}>{p.role}</div>
          </div>
          <div style={{marginLeft:"auto",textAlign:"right",flexShrink:0}}>
            <div style={{fontSize:28,lineHeight:1,color:"var(--sg-amber)"}}>
              {p.credits}</div>
            <div style={{fontSize:7,color:"rgba(251,191,36,0.45)",
              letterSpacing:"0.12em",marginTop:2}}>CREDITS</div>
          </div>
        </div>

        {/* process log */}
        <SgDivider label="PROCESS_LOG" style={{margin:"16px 0 10px"}}/>
        <div style={{marginBottom:6}}>
          {p.processLog.map((line,i)=>(
            <div key={i} style={{fontSize:9,lineHeight:1.75,
              color:"rgba(74,222,128,0.75)",paddingLeft:20,
              position:"relative",marginBottom:2}}>
              <span style={{position:"absolute",left:0,
                color:"rgba(37,99,235,0.4)",fontSize:7.5}}>
                [{String(i).padStart(3,"0")}]</span>
              <span dangerouslySetInnerHTML={{__html:line}}/>
            </div>
          ))}
        </div>

        {/* artifacts */}
        <SgDivider label={`ARTIFACTS · ${p.artifacts.length} files submitted`}
          style={{margin:"20px 0 12px"}}/>
        <div style={{display:"grid",
          gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:10}}>
          {p.artifacts.map((a,i)=>(
            <FileArtifact key={i} name={a.name} size={a.size}
              kind={a.kind} meta={a.meta} width={170}/>
          ))}
        </div>

      </div>

      {/* bottom sprockets */}
      <Sprockets n={10} style={{borderTop:"1px solid rgba(37,99,235,0.4)"}}/>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   EXPORTS
   ════════════════════════════════════════════════════════════════ */
Object.assign(window, {
  SG_PRAXES,
  PraxisIndex, PraxisRead, PraxisRow,
  ConsensusMeter, ConsensusSummary, SignalCaster,
});
