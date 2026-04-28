import { useState } from 'react'
import StatBadge, { isHighlightAVG, isHighlightERA } from './StatBadge'

function normBatter(b) {
  if (b.gameStats) return b
  return {
    ...b,
    order: b.battingOrder ?? b.order,
    gameStats: {
      atBats: b.atBats ?? 0, runs: b.runs ?? 0, hits: b.hits ?? 0,
      doubles: b.doubles ?? 0, triples: b.triples ?? 0, homeRuns: b.homeRuns ?? 0,
      rbi: b.rbi ?? 0, walks: b.walks ?? 0, strikeOuts: b.strikeOuts ?? 0,
    },
    seasonStats: { avg: b.seasonAvg ?? b.avg ?? '.---' },
  }
}

function normPitcher(p) {
  if (p.gameStats) return p
  return {
    ...p,
    gameStats: {
      inningsPitched: p.inningsPitched ?? '0.0', hits: p.hits ?? 0, runs: p.runs ?? 0,
      earnedRuns: p.earnedRuns ?? 0, walks: p.walks ?? 0, strikeOuts: p.strikeOuts ?? 0,
      pitchesThrown: p.pitchesThrown ?? 0,
    },
    seasonStats: { era: p.seasonEra ?? '--', wins: p.seasonWins, losses: p.seasonLosses },
  }
}

const th = { padding: '6px 8px', textAlign: 'right', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', borderBottom: '1px solid var(--line)', fontFamily: 'monospace' }
const td = { padding: '6px 8px', textAlign: 'right', fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'monospace' }

function BattingTab({ batters, label }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 24 }} />
            <col />
            {['AB','R','H','2B','3B','HR','RBI','BB','K','AVG'].map(c => (
              <col key={c} style={{ width: c === 'AVG' ? 52 : c.length > 2 ? 40 : 34 }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {['#','Player','AB','R','H','2B','3B','HR','RBI','BB','K','AVG'].map((h, i) => (
                <th key={h} style={{ ...th, textAlign: i <= 1 ? 'left' : 'right' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {batters.map(normBatter).map((b, i) => {
              const g = b.gameStats ?? {}
              const s = b.seasonStats ?? {}
              const highlight = isHighlightAVG(s.avg)
              return (
                <tr key={b.id ?? i} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ ...td, textAlign: 'left', color: 'var(--faint)' }}>{b.order ?? i + 1}</td>
                  <td style={{ ...td, textAlign: 'left' }}>
                    <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{b.name}</span>
                    <span style={{ color: 'var(--faint)', marginLeft: 4 }}>{b.position}</span>
                  </td>
                  <td style={{ ...td, textAlign: 'center' }}>{g.atBats ?? 0}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{g.runs ?? 0}</td>
                  <td style={{ ...td, textAlign: 'center', fontWeight: 600, color: 'var(--ink)' }}>{g.hits ?? 0}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{g.doubles ?? 0}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{g.triples ?? 0}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{g.homeRuns ?? 0}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{g.rbi ?? 0}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{g.walks ?? 0}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{g.strikeOuts ?? 0}</td>
                  <td style={{ ...td, paddingLeft: 8 }}>
                    <StatBadge value={s.avg ?? '.---'} highlight={highlight} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PitchingTab({ pitchers, label }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col />
            {['IP','H','R','ER','BB','K','P','ERA'].map(c => (
              <col key={c} style={{ width: c === 'ERA' ? 52 : 36 }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {['Pitcher','IP','H','R','ER','BB','K','P','ERA'].map((h, i) => (
                <th key={h} style={{ ...th, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pitchers.map(normPitcher).map((p, i) => {
              const g = p.gameStats ?? {}
              const s = p.seasonStats ?? {}
              const highlight = isHighlightERA(s.era)
              const decStyle = p.decision === 'W'
                ? { background: 'rgba(34,197,94,0.12)', color: '#22c55e' }
                : p.decision === 'L'
                ? { background: 'var(--live-soft)', color: 'var(--live)' }
                : { background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }
              return (
                <tr key={p.id ?? i} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ ...td, textAlign: 'left' }}>
                    <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{p.name}</span>
                    {p.decision && (
                      <span style={{ marginLeft: 6, padding: '1px 5px', borderRadius: 4, fontSize: 10, fontWeight: 700, ...decStyle }}>{p.decision}</span>
                    )}
                  </td>
                  <td style={{ ...td, textAlign: 'center', fontWeight: 600, color: 'var(--ink)' }}>{g.inningsPitched ?? '0.0'}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{g.hits ?? 0}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{g.runs ?? 0}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{g.earnedRuns ?? 0}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{g.walks ?? 0}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{g.strikeOuts ?? 0}</td>
                  <td style={{ ...td, textAlign: 'center', color: 'var(--faint)' }}>{g.pitchesThrown ?? 0}</td>
                  <td style={{ ...td, paddingLeft: 8 }}>
                    <StatBadge value={s.era ?? '--'} highlight={highlight} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DecisionsLine({ decisions }) {
  if (!decisions) return null
  const { winner, loser, save } = decisions
  if (!winner && !loser) return null

  return (
    <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
      {winner && (
        <span>
          <span style={{ color: 'var(--faint)' }}>W: </span>
          <span style={{ color: 'var(--ink)' }}>{winner.name}</span>
          {winner.record && <span style={{ color: 'var(--faint)' }}> ({winner.record})</span>}
          {winner.era && <span style={{ color: 'var(--faint)' }}> {winner.era} ERA</span>}
        </span>
      )}
      {loser && (
        <span>
          <span style={{ color: 'var(--faint)' }}>· L: </span>
          <span style={{ color: 'var(--ink)' }}>{loser.name}</span>
          {loser.record && <span style={{ color: 'var(--faint)' }}> ({loser.record})</span>}
        </span>
      )}
      {save && (
        <span>
          <span style={{ color: 'var(--faint)' }}>· S: </span>
          <span style={{ color: 'var(--ink)' }}>{save.name}</span>
          {save.record && <span style={{ color: 'var(--faint)' }}> ({save.record})</span>}
        </span>
      )}
    </div>
  )
}

function GameInfoFooter({ gameInfo }) {
  if (!gameInfo) return null
  const { duration, attendance, hpUmpire } = gameInfo
  if (!duration && !attendance && !hpUmpire) return null

  return (
    <div className="mono" style={{ fontSize: 11, color: 'var(--faint)', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)', display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
      {duration   && <span><span style={{ color: 'var(--muted)' }}>T: </span>{duration}</span>}
      {attendance && <span><span style={{ color: 'var(--muted)' }}>Att: </span>{attendance}</span>}
      {hpUmpire   && <span><span style={{ color: 'var(--muted)' }}>HP: </span>{hpUmpire}</span>}
    </div>
  )
}

export default function BoxScoreTable({ boxScore, homeTeam, awayTeam }) {
  const [activeTab, setActiveTab] = useState('batting')
  if (!boxScore) return null

  const tabs = [{ id: 'batting', label: 'Batting' }, { id: 'pitching', label: 'Pitching' }]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--line)', paddingBottom: 0 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`navlink${activeTab === t.id ? ' on' : ''}`}
            style={{ padding: '8px 12px' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'batting' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <BattingTab batters={boxScore.away?.batters ?? []} label={awayTeam?.abbreviation ?? 'Away'} />
          <BattingTab batters={boxScore.home?.batters ?? []} label={homeTeam?.abbreviation ?? 'Home'} />
        </div>
      )}

      {activeTab === 'pitching' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <PitchingTab pitchers={boxScore.away?.pitchers ?? []} label={awayTeam?.abbreviation ?? 'Away'} />
          <PitchingTab pitchers={boxScore.home?.pitchers ?? []} label={homeTeam?.abbreviation ?? 'Home'} />
          <DecisionsLine decisions={boxScore.decisions} />
        </div>
      )}

      <GameInfoFooter gameInfo={boxScore.gameInfo} />
    </div>
  )
}
