import { useState } from 'react'
import StatBadge, { isHighlightERA, isHighlightAVG } from './StatBadge'

function ProbablePitcherCard({ abbr, pitcher }) {
  const s      = pitcher?.seasonStats ?? pitcher ?? {}
  const era    = s.era    ?? pitcher?.era
  const wins   = s.wins   ?? pitcher?.wins
  const losses = s.losses ?? pitcher?.losses
  const ip     = s.ip     ?? pitcher?.ip
  const whip   = s.whip
  const k      = s.k
  const bb     = s.bb
  const goodEra = isHighlightERA(era)

  return (
    <div style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg-sunken)' }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>{abbr}</div>
      {!pitcher ? (
        <div style={{ fontSize: 13, color: 'var(--faint)', fontStyle: 'italic', padding: '2px 0' }}>TBD</div>
      ) : (
        <>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {pitcher.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 8 }}>
            <span className="tabular mono" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: goodEra ? 'var(--win)' : 'var(--ink)' }}>
              {era ?? '–'}
            </span>
            <span className="eyebrow">ERA</span>
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', flexWrap: 'wrap', gap: '2px 12px' }}>
            {wins != null && losses != null && (
              <span><span style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>{wins}–{losses}</span> W-L</span>
            )}
            {ip != null && (
              <span><span style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>{ip}</span> IP</span>
            )}
            {whip != null && (
              <span><span style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>{whip}</span> WHIP</span>
            )}
            {k != null && (
              <span><span style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>{k}</span> K</span>
            )}
            {bb != null && (
              <span><span style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>{bb}</span> BB</span>
            )}
          </div>
          {pitcher.last10 && (
            <div className="mono" style={{ marginTop: 8, padding: '5px 8px', borderRadius: 5, background: 'var(--bg)', fontSize: 10, color: 'var(--muted)', display: 'flex', gap: 10 }}>
              <span className="eyebrow" style={{ color: 'var(--faint)' }}>L10</span>
              <span>{pitcher.last10.wins}–{pitcher.last10.losses}</span>
              <span>{pitcher.last10.era} ERA</span>
              {pitcher.last10.ip && <span>{pitcher.last10.ip} IP</span>}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ProbablePitchersView({ probablePitchers, homeAbbr, awayAbbr }) {
  const { home, away } = probablePitchers ?? {}
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="eyebrow">Probable Pitchers</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <ProbablePitcherCard abbr={awayAbbr} pitcher={away} />
        <ProbablePitcherCard abbr={homeAbbr} pitcher={home} />
      </div>
    </div>
  )
}

function LiveBatterRow({ player, isHeader }) {
  if (isHeader) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 4, paddingBottom: 4, borderBottom: '1px solid var(--line)' }}>
        <span className="eyebrow">#</span>
        <span className="eyebrow">Player</span>
        <span className="eyebrow" style={{ textAlign: 'right' }}>AVG / OPS</span>
      </div>
    )
  }
  if (!player) return null

  const g = player.gameStats
  const s = player.seasonStats
  const hasGameStats = g && (g.atBats > 0 || g.walks > 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 4, padding: '2px 0' }}>
      <span className="mono" style={{ fontSize: 10, color: 'var(--faint)', paddingTop: 2 }}>{player.order}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
          {player.name}
          <span style={{ color: 'var(--faint)', marginLeft: 4, fontSize: 10 }}>{player.position}</span>
        </div>
        {hasGameStats && (
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.3, marginTop: 2 }}>
            {g.atBats}-for-{g.hits}
            {g.homeRuns > 0 && <span style={{ color: 'var(--amber)', marginLeft: 4 }}>{g.homeRuns}HR</span>}
            {g.rbi      > 0 && <span style={{ marginLeft: 4 }}>{g.rbi}RBI</span>}
            {g.walks    > 0 && <span style={{ marginLeft: 4 }}>{g.walks}BB</span>}
          </div>
        )}
      </div>
      {s && (
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="mono" style={{ fontSize: 11, lineHeight: 1.3, color: isHighlightAVG(s.avg) ? 'var(--amber)' : 'var(--ink-soft)' }}>{s.avg}</div>
          <div className="mono" style={{ fontSize: 10, lineHeight: 1.3, color: 'var(--faint)' }}>{s.ops}</div>
        </div>
      )}
      {!s && (
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-soft)', textAlign: 'right' }}>{player.avg}</span>
      )}
    </div>
  )
}

function LivePitcherRow({ pitcher }) {
  if (!pitcher) return null
  const g = pitcher.gameStats ?? {}
  const s = pitcher.seasonStats ?? {}
  const isCurrent = pitcher.current === true

  return (
    <div style={{
      borderRadius: 8, padding: '6px 8px', marginBottom: 4,
      ...(isCurrent ? { background: 'var(--live-soft)', border: '1px solid var(--live-line)' } : {}),
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isCurrent ? 'var(--ink)' : 'var(--muted)' }}>
            {pitcher.name}
          </span>
          {isCurrent && (
            <span className="eyebrow" style={{ marginLeft: 6, color: 'var(--live)' }}>pitching</span>
          )}
        </div>
        <StatBadge label="ERA" value={s.era ?? '--'} highlight={isHighlightERA(s.era)} />
      </div>
      <div className="mono" style={{ marginTop: 2, display: 'flex', gap: 8, fontSize: 10, color: 'var(--muted)' }}>
        <span><span style={{ color: 'var(--ink-soft)' }}>{g.inningsPitched ?? '0.0'}</span> IP</span>
        <span>{g.hits ?? 0}H</span>
        <span>{g.earnedRuns ?? 0}ER</span>
        <span>{g.walks ?? 0}BB</span>
        <span>{g.strikeOuts ?? 0}K</span>
        {g.pitchesThrown > 0 && <span style={{ color: 'var(--faint)' }}>{g.pitchesThrown}P</span>}
      </div>
    </div>
  )
}

function SimpleLineupColumns({ lineup, homeAbbr, awayAbbr }) {
  const homeOrder = lineup.home ?? []
  const awayOrder = lineup.away ?? []
  const rowCount  = Math.max(homeOrder.length, awayOrder.length, 9)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[{ abbr: awayAbbr, order: awayOrder }, { abbr: homeAbbr, order: homeOrder }].map(({ abbr, order }) => (
          <div key={abbr}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>{abbr} Lineup</div>
            <LiveBatterRow isHeader />
            {Array.from({ length: rowCount }, (_, i) => (
              <LiveBatterRow key={i} player={order[i]} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function LiveLineupView({ lineup, homeAbbr, awayAbbr }) {
  const [tab, setTab] = useState('lineup')
  const hasPitchers = lineup.homePitchers?.length > 0 || lineup.awayPitchers?.length > 0

  return (
    <div>
      {hasPitchers && (
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--line)', marginBottom: 16 }}>
          {['lineup', 'pitchers'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`navlink${tab === t ? ' on' : ''}`}
              style={{ padding: '8px 12px', textTransform: 'capitalize' }}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {tab === 'lineup' && (
        <SimpleLineupColumns lineup={lineup} homeAbbr={homeAbbr} awayAbbr={awayAbbr} />
      )}

      {tab === 'pitchers' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { abbr: awayAbbr, pitchers: lineup.awayPitchers, fallback: lineup.awayPitcher },
            { abbr: homeAbbr, pitchers: lineup.homePitchers, fallback: lineup.homePitcher },
          ].map(({ abbr, pitchers, fallback }) => (
            <div key={abbr}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>{abbr} Pitchers</div>
              {(pitchers ?? []).map((p, i) => (
                <LivePitcherRow key={p.id ?? i} pitcher={p} />
              ))}
              {!pitchers?.length && fallback && (
                <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{fallback.name}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LineupCard({ lineup, probablePitchers, status, homeTeam, awayTeam }) {
  const homeAbbr = homeTeam?.abbreviation ?? 'HM'
  const awayAbbr = awayTeam?.abbreviation ?? 'AW'

  const showLive     = (status === 'live' || status === 'delayed') && lineup
  const showFinal    = status === 'final' && lineup
  const showProbable = status === 'scheduled' && probablePitchers

  if (!showLive && !showFinal && !showProbable) return null

  return (
    <div className="card" style={{ padding: 16 }}>
      {showLive     && <LiveLineupView lineup={lineup} homeAbbr={homeAbbr} awayAbbr={awayAbbr} />}
      {showFinal    && <SimpleLineupColumns lineup={lineup} homeAbbr={homeAbbr} awayAbbr={awayAbbr} />}
      {showProbable && <ProbablePitchersView probablePitchers={probablePitchers} homeAbbr={homeAbbr} awayAbbr={awayAbbr} />}
    </div>
  )
}
