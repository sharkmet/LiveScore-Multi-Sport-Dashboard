/**
 * Generate MLB win expectancy table via Markov chain simulation.
 *
 * State: (inning 1-9, half T/B, outs 0-2, baseState "000"-"111", runDiff -10 to +10)
 * Output: probability that home team wins from each state.
 *
 * Plate appearance outcome probabilities are 2020-2024 MLB averages.
 * Base runner advancement uses standard MLB run expectancy advancement rules.
 */

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── PA outcome probabilities (2020-2024 MLB averages) ────────────────────────

const PA_OUTCOMES = [
  // Each entry: { type, prob, bases, runsScored(fn) }
  // bases after play: array of which bases are occupied [1,2,3] style
  // We'll model transitions directly

  { type: 'K',   prob: 0.226 },  // strikeout
  { type: 'BB',  prob: 0.086 },  // walk
  { type: 'HBP', prob: 0.011 },  // hit by pitch
  { type: '1B',  prob: 0.148 },  // single
  { type: '2B',  prob: 0.047 },  // double
  { type: '3B',  prob: 0.005 },  // triple
  { type: 'HR',  prob: 0.036 },  // home run
  { type: 'GO',  prob: 0.281 },  // groundout (includes GDP ~10% of GO with runner on 1st)
  { type: 'FO',  prob: 0.160 },  // flyout / lineout
]

// Normalize (should sum to 1)
const total = PA_OUTCOMES.reduce((s, o) => s + o.prob, 0)
PA_OUTCOMES.forEach(o => o.prob /= total)

// ── Base state encoding ───────────────────────────────────────────────────────
// "000" = empty, "100" = runner on 1st, "010" = runner on 2nd, etc.
// bit 0 = 1st, bit 1 = 2nd, bit 2 = 3rd

function encodeBase(first, second, third) {
  return (first ? '1' : '0') + (second ? '1' : '0') + (third ? '1' : '0')
}

function decodeBase(s) {
  return { first: s[0] === '1', second: s[1] === '1', third: s[2] === '1' }
}

// ── PA transition: given current base state + outs, return {newBases, newOuts, runs} ──

function applyPA(outcome, baseStr, outs) {
  const { first, second, third } = decodeBase(baseStr)
  let b1 = first, b2 = second, b3 = third
  let runs = 0
  let newOuts = outs
  let inningOver = false

  switch (outcome.type) {
    case 'K': {
      newOuts++
      break
    }
    case 'FO': {
      // Sacrifice fly: if runner on 3rd and < 2 outs, scores; else just out
      if (outs < 2 && b3) { runs++; b3 = false }
      newOuts++
      break
    }
    case 'GO': {
      // GDP: if runner on 1st and < 2 outs, double play ~35% of the time
      // We simplify: if runner on 1st and 0-1 outs, 35% GDP; else single out
      const gdpChance = (b1 && outs < 2) ? 0.35 : 0
      const isGDP = Math.random() < gdpChance
      if (isGDP) {
        // Double play: batter + runner on 1st out; runners advance
        if (b3) { runs++; b3 = false }
        if (b2) { b3 = true; b2 = false }
        b1 = false
        newOuts += 2
      } else {
        // Single out, runners advance one base
        if (b3) { runs++; b3 = false }
        if (b2) { b3 = true; b2 = false }
        if (b1) { b2 = true; b1 = false }
        newOuts++
      }
      break
    }
    case 'BB':
    case 'HBP': {
      // Force advances only
      if (b1 && b2 && b3) { runs++; }
      else if (b1 && b2)   { b3 = true }
      if (b1)              { b2 = b2 || false; if (!b2) b2 = false } // keep track
      // Proper BB logic:
      if (b1 && b2 && b3) {
        runs++; // already handled above
      }
      // Re-do properly:
      const nb1 = true
      const nb2 = b1 ? true : b2
      const nb3 = (b1 && b2) ? true : b3
      if (b1 && b2 && b3) runs++
      b1 = nb1; b2 = nb2; b3 = nb3
      // the run was already counted correctly above? Let me redo this cleanly:
      break
    }
    case '1B': {
      // Single: runners on 2nd/3rd score; runner on 1st goes to 2nd or 3rd (50/50)
      if (b3) { runs++; b3 = false }
      if (b2) { runs++; b2 = false } // runner on 2nd scores on single
      const r1AdvancesTo3rd = Math.random() < 0.5
      if (b1) {
        if (r1AdvancesTo3rd) b3 = true
        else b2 = true
      }
      b1 = true // batter on 1st
      break
    }
    case '2B': {
      // Double: all runners score; batter on 2nd
      if (b3) { runs++; b3 = false }
      if (b2) { runs++; b2 = false }
      if (b1) { runs++; b1 = false }
      b2 = true
      break
    }
    case '3B': {
      // Triple: all runners score; batter on 3rd
      if (b3) runs++
      if (b2) runs++
      if (b1) runs++
      b1 = false; b2 = false; b3 = true
      break
    }
    case 'HR': {
      // Homer: everyone scores
      runs += 1 + (b1 ? 1 : 0) + (b2 ? 1 : 0) + (b3 ? 1 : 0)
      b1 = false; b2 = false; b3 = false
      break
    }
  }

  if (newOuts >= 3) inningOver = true

  return {
    newBases: inningOver ? '000' : encodeBase(b1, b2, b3),
    newOuts:  Math.min(newOuts, 3),
    runs,
    inningOver,
  }
}

// Fix the BB case (was getting messy above)
function applyBB(baseStr) {
  const { first, second, third } = decodeBase(baseStr)
  let b1 = true
  let b2 = first ? true : second
  let b3 = (first && second) ? true : third
  const runs = (first && second && third) ? 1 : 0
  return { newBases: encodeBase(b1, b2, b3), runs }
}

// ── Simulate remaining half-inning, return runs scored ───────────────────────

function simulateHalfInning(baseStr, outs) {
  let currentBase = baseStr
  let currentOuts = outs
  let totalRuns = 0

  while (currentOuts < 3) {
    // Pick outcome
    const r = Math.random()
    let cumulative = 0
    let chosen = PA_OUTCOMES[PA_OUTCOMES.length - 1]
    for (const o of PA_OUTCOMES) {
      cumulative += o.prob
      if (r < cumulative) { chosen = o; break }
    }

    let result
    if (chosen.type === 'BB' || chosen.type === 'HBP') {
      const { newBases, runs } = applyBB(currentBase)
      result = { newBases, newOuts: currentOuts, runs, inningOver: false }
    } else {
      result = applyPA(chosen, currentBase, currentOuts)
    }

    totalRuns += result.runs
    currentBase = result.newBases
    currentOuts = result.newOuts
    if (result.inningOver || result.newOuts >= 3) break
  }

  return totalRuns
}

// ── Simulate remaining game from a state, return 1 if home wins ──────────────

function simulateGame(inning, isTop, outs, baseStr, runDiff, totalInnings = 9) {
  // runDiff = home - away (positive = home leading)
  let homeRuns = 0
  let awayRuns = 0
  // Current score offset so we can track from here
  let curDiff = runDiff // home - away at start

  let curInning = inning
  let curIsTop = isTop
  let curOuts = outs
  let curBase = baseStr
  let awayExtra = 0
  let homeExtra = 0

  // Complete current half-inning
  const runsThisHalf = simulateHalfInning(curBase, curOuts)

  if (curIsTop) {
    awayExtra += runsThisHalf
    curIsTop = false
    curOuts = 0; curBase = '000'
    // Bottom of same inning
    const homeRunsBottom = simulateHalfInning('000', 0)
    homeExtra += homeRunsBottom
    curInning++
    curIsTop = true
    curOuts = 0; curBase = '000'
  } else {
    homeExtra += runsThisHalf
    // Walk-off check: if home now leads after bottom half, they win
    const newDiff = curDiff + homeExtra - awayExtra
    if (curInning >= totalInnings && newDiff > 0) {
      return 1 // home wins walk-off
    }
    curInning++
    curIsTop = true
    curOuts = 0; curBase = '000'
  }

  // Simulate remaining full innings
  for (let inn = curInning; inn <= totalInnings || (curDiff + homeExtra - awayExtra === 0 && inn <= totalInnings + 3); inn++) {
    // Top half (away bats)
    const awayRuns = simulateHalfInning('000', 0)
    awayExtra += awayRuns

    // Bottom half (home bats)
    const homeRunsB = simulateHalfInning('000', 0)
    homeExtra += homeRunsB

    const newDiff = curDiff + homeExtra - awayExtra

    // Check for walk-off in extra innings
    if (inn >= totalInnings) {
      if (newDiff !== 0) break // someone leads after full inning in extras
    }
  }

  const finalDiff = curDiff + homeExtra - awayExtra
  if (finalDiff > 0) return 1
  if (finalDiff < 0) return 0
  // Tie goes to extra innings (simplified: 50/50 + small home advantage)
  return Math.random() < 0.52 ? 1 : 0
}

// ── Monte Carlo over all states ───────────────────────────────────────────────

const SIMS_PER_STATE = 800  // enough for ~2% std error per state
const INNINGS = [1,2,3,4,5,6,7,8,9]
const HALVES = ['T', 'B']
const OUTS_LIST = [0, 1, 2]
const BASE_STATES = ['000','100','010','001','110','101','011','111']
const RUN_DIFFS = Array.from({length: 21}, (_, i) => i - 10)  // -10 to +10

const table = {}
let totalStates = INNINGS.length * HALVES.length * OUTS_LIST.length * BASE_STATES.length * RUN_DIFFS.length
let done = 0
const startTime = Date.now()

console.log(`Generating ${totalStates} states × ${SIMS_PER_STATE} sims = ${(totalStates * SIMS_PER_STATE).toLocaleString()} simulations...`)

for (const inning of INNINGS) {
  for (const half of HALVES) {
    const isTop = half === 'T'
    for (const outs of OUTS_LIST) {
      for (const baseStr of BASE_STATES) {
        for (const runDiff of RUN_DIFFS) {
          // Final-state shortcuts
          if (inning === 9 && !isTop && runDiff > 0) {
            // Home already winning in bottom 9 — they've already won (walk-off)
            const key = `${inning}_${half}_${outs}_${baseStr}_${runDiff}`
            table[key] = 0.999
            done++
            continue
          }
          if (inning === 9 && !isTop && runDiff < -2) {
            // Home losing by 3+ in bottom 9 with no runners — very unlikely
            // Still simulate; don't shortcut
          }

          let wins = 0
          for (let s = 0; s < SIMS_PER_STATE; s++) {
            wins += simulateGame(inning, isTop, outs, baseStr, runDiff)
          }

          const key = `${inning}_${half}_${outs}_${baseStr}_${runDiff}`
          // Clamp away from exact 0/1
          table[key] = Math.max(0.005, Math.min(0.995, wins / SIMS_PER_STATE))
          done++
        }
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`  Inning ${inning} done — ${done}/${totalStates} states (${elapsed}s elapsed)`)
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
console.log(`\nDone in ${elapsed}s. Writing ${Object.keys(table).length} states...`)

const outPath = join(__dirname, '../src/services/winProbability/lookupTables/mlb-win-expectancy.json')
writeFileSync(outPath, JSON.stringify(table, null, 0))
console.log(`Written to ${outPath}`)

// Quick sanity checks
console.log('\nSanity checks:')
console.log('  Top 1st, 0 outs, empty, tied (1_T_0_000_0):', table['1_T_0_000_0']?.toFixed(3), '(expect ~0.500)')
console.log('  Bot 9th, 0 outs, empty, home +1 (9_B_0_000_1):', table['9_B_0_000_1']?.toFixed(3), '(expect ~0.999)')
console.log('  Bot 9th, 2 outs, empty, home -1 (9_B_2_000_-1):', table['9_B_2_000_-1']?.toFixed(3), '(expect ~0.12-0.18)')
console.log('  Top 7th, 0 outs, bases loaded, home +1 (7_T_0_111_1):', table['7_T_0_111_1']?.toFixed(3), '(expect ~0.60-0.70)')
