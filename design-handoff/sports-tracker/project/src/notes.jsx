// ---- Design notes intro (renders above the product mockup) ----

function Swatch({ name, token, hex, note }) {
  return (
    <div className="flex items-center gap-3">
      <div className="swatch-lg" style={{background:hex}} />
      <div>
        <div style={{fontSize:12, fontWeight:600, color:'var(--ink)'}}>{name}</div>
        <div className="mono" style={{fontSize:10.5, color:'var(--muted)'}}>{token} · {hex}</div>
        {note && <div style={{fontSize:11, color:'var(--muted-2)'}}>{note}</div>}
      </div>
    </div>
  );
}

function DesignNotes() {
  return (
    <section className="card" style={{padding:28, marginBottom:24, background:'var(--bg-elev)'}}>
      <div className="flex items-start justify-between gap-8 flex-wrap">
        <div style={{maxWidth:560}}>
          <div className="eyebrow" style={{marginBottom:10}}>LiveScore · Visual redesign</div>
          <h1 style={{fontSize:32, fontWeight:700, letterSpacing:'-0.025em', lineHeight:1.1, marginBottom:10}}>
            A calm, warm dashboard that only raises its voice when a game actually goes live.
          </h1>
          <p style={{fontSize:14, color:'var(--ink-soft)', lineHeight:1.55, marginBottom:8}}>
            Cream paper surface, warm ink, single-accent red for live. Same card sizes at rest and in-play — the only thing that
            changes is a subtle color wash and the status chip. Score updates flash the row, never the layout.
          </p>
          <p style={{fontSize:12.5, color:'var(--muted)'}}>
            Mockup ahead: three heroed screens in the new aesthetic — <b style={{color:'var(--ink-soft)'}}>Scoreboard</b>,
            {' '}<b style={{color:'var(--ink-soft)'}}>Standings</b>, <b style={{color:'var(--ink-soft)'}}>Playoffs</b> — with alerts sidebar and a live toast.
            Use the <span className="kbd">Tweaks</span> panel (bottom-right) to flip palette / density / motion.
          </p>
        </div>

        <div style={{flex:'1 1 320px', minWidth:280}}>
          <div className="eyebrow" style={{marginBottom:10}}>Palette</div>
          <div className="grid grid-cols-2 gap-3" style={{rowGap:12}}>
            <Swatch name="Cream"    token="--bg"       hex="#FAF9F6" note="Page" />
            <Swatch name="Paper"    token="--bg-elev"  hex="#FFFFFF" note="Cards, tables" />
            <Swatch name="Warm ink" token="--ink"      hex="#1F1D1A" note="Primary text" />
            <Swatch name="Warm grey"token="--muted"    hex="#6E6A62" note="Secondary text" />
            <Swatch name="Hairline" token="--line"     hex="#E8E4DC" note="1px dividers" />
            <Swatch name="Live red" token="--live"     hex="#C8372D" note="Single accent" />
          </div>
        </div>
      </div>

      <div className="hairline" style={{margin:'22px 0 18px'}} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="eyebrow" style={{marginBottom:6}}>Typography</div>
          <div style={{fontSize:13, color:'var(--ink-soft)', lineHeight:1.55}}>
            Inter throughout. Display 28–32px with <span className="mono" style={{fontSize:12}}>-0.025em</span> tracking,
            body 13px, tabular-nums for every score and stat. Tiny eyebrow 10.5px / 0.14em for section labels.
          </div>
        </div>
        <div>
          <div className="eyebrow" style={{marginBottom:6}}>Density &amp; motion</div>
          <div style={{fontSize:13, color:'var(--ink-soft)', lineHeight:1.55}}>
            Linear-like balanced spacing, 1px hairlines everywhere, radius 10px. Moderate motion: 180ms fade-ins,
            pulsing live dot, 360ms score-tick, 1.2s row flash on data updates. Layout does not shift when a game goes live.
          </div>
        </div>
        <div>
          <div className="eyebrow" style={{marginBottom:6}}>Live treatment</div>
          <div style={{fontSize:13, color:'var(--ink-soft)', lineHeight:1.55}}>
            Per your note: card keeps the same footprint. A soft live-red wash at the top fades to white; the status chip
            becomes a pulsing red pill. No size bump, no heavy glow.
          </div>
        </div>
      </div>
    </section>
  );
}

window.DesignNotes = DesignNotes;
