import { Info, Pause, Play, RotateCcw, Share2, Zap } from 'lucide-react'
import { bondingProfiles } from '../data/bonding.js'
import { elementBySymbol } from '../data/elements.js'
import { QuantumBondStage } from './QuantumBondScene.jsx'

const PHASE_LABELS = ['Separate atoms', 'Electric interaction', 'Stable arrangement']

export function BondFormationLab({ profile, phase, playing, onSelect, onPhase, onPlay, onReset }) {
  const final = phase === 2
  const ionic = profile.kind === 'ionic'
  const leftOuter = outerShellCount(profile, 'left', phase)
  const rightOuter = outerShellCount(profile, 'right', phase)

  return (
    <section className="bond-microscope panel" aria-labelledby="bond-microscope-title">
      <div className="bond-microscope-heading">
        <div>
          <p className="eyebrow">Bond &amp; shell microscope</p>
          <h2 id="bond-microscope-title">Watch electrons make the difference</h2>
          <p>Follow a curated bond one stage at a time: electric attraction reshapes electron probability density toward a lower-energy arrangement.</p>
        </div>
        <div className={`bond-kind ${profile.kind}`}><Zap size={15} /> {profile.kindLabel}</div>
      </div>

      <div className="bond-profile-picker" role="group" aria-label="Choose a bonding example">
        {bondingProfiles.map((option) => (
          <button
            key={option.id}
            type="button"
            data-profile-id={option.id}
            className={option.id === profile.id ? 'active' : ''}
            aria-pressed={option.id === profile.id}
            onClick={() => onSelect(option.id)}
          >
            <strong>{prettyFormula(option.formula)}</strong>
            <span>{option.kindLabel}</span>
          </button>
        ))}
      </div>

      <div className="bond-lab-layout">
        <div className="bond-stage-wrap">
          <div className="bond-stage-label"><span className="live-dot" /> Live quantum-density model · drag to inspect</div>
          <QuantumBondStage profile={profile} phase={phase} leftShells={visibleShells(profile, 'left', phase)} rightShells={visibleShells(profile, 'right', phase)} />
          <div className="bond-narration" role="status" aria-live="polite">
            <span>{phase + 1}</span>
            <div><strong>{PHASE_LABELS[phase]}</strong><p>{profile.phases[phase]}</p></div>
          </div>
        </div>

        <aside className="bond-readout" aria-label="Bond evidence and controls">
          <div className="bond-identity">
            <span>{profile.title}</span>
            <strong>{prettyFormula(profile.formula)}</strong>
            <small>Electronegativity difference: {profile.electronegativityDelta.toFixed(2)}</small>
          </div>

          <div className="bond-force-card">
            <div><Zap size={18} /><strong>What the electric force does</strong></div>
            <p>{forceExplanation(profile, phase)}</p>
          </div>

          <div className="shell-ledgers">
            <ShellLedger side="left" profile={profile} phase={phase} accounted={leftOuter} />
            <ShellLedger side="right" profile={profile} phase={phase} accounted={rightOuter} />
          </div>

          <div className="bond-playback">
            <button type="button" className="primary-button" onClick={onPlay} aria-label={playing ? 'Pause bond animation' : 'Play bond animation'}>
              {playing ? <Pause size={17} /> : <Play size={17} />} {playing ? 'Pause' : final ? 'Replay' : 'Play'}
            </button>
            <button type="button" className="quiet-button" onClick={onReset}><RotateCcw size={16} /> Reset</button>
          </div>
        </aside>
      </div>

      <div className="bond-phase-strip" aria-label="Bond formation stages">
        {PHASE_LABELS.map((label, index) => (
          <button key={label} type="button" data-bond-phase={index} className={phase === index ? 'active' : phase > index ? 'complete' : ''} aria-pressed={phase === index} onClick={() => onPhase(index)}>
            <i>{index + 1}</i><span><strong>{label}</strong><small>{index === 0 ? 'Neutral atoms' : index === 1 ? 'Electron response' : ionic ? 'Opposite ions' : 'Shared pairs'}</small></span>
          </button>
        ))}
      </div>

      <div className="bond-science-note">
        <Share2 size={21} />
        <p><strong>{profile.summary}</strong> {profile.caveat}</p>
        <span><Info size={14} /> The cloud combines occupied orbitals; color marks valence density. Polarity is unequal sharing, not a separate bonding force.</span>
      </div>
    </section>
  )
}

function BondStage({ profile, phase }) {
  const ionic = profile.kind === 'ionic'
  const positions = phase === 0 ? [235, 665] : phase === 1 ? [310, 590] : ionic ? [325, 575] : [350, 550]
  const leftShells = visibleShells(profile, 'left', phase)
  const rightShells = visibleShells(profile, 'right', phase)
  const leftElement = elementBySymbol[profile.left.symbol]
  const rightElement = elementBySymbol[profile.right.symbol]

  return (
    <svg className={`bond-stage phase-${phase} ${profile.kind}`} viewBox="0 0 900 420" role="img" aria-labelledby="bond-stage-title bond-stage-description">
      <title id="bond-stage-title">{profile.title}: {PHASE_LABELS[phase]}</title>
      <desc id="bond-stage-description">{profile.phases[phase]}</desc>
      <defs>
        <radialGradient id="electron-density"><stop offset="0" stopColor="#a9eaff" stopOpacity=".9" /><stop offset="1" stopColor="#61bde4" stopOpacity="0" /></radialGradient>
        <filter id="electron-glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <marker id="bond-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#9ee9ff" /></marker>
      </defs>
      <rect width="900" height="420" rx="22" fill="#071f28" />
      <circle cx="450" cy="190" r="175" fill="none" stroke="#214754" strokeDasharray="4 12" />
      <path d="M90 350 Q450 305 810 350" fill="none" stroke="#173b46" strokeWidth="2" />
      <text x="450" y="388" textAnchor="middle" className="stage-caption">Lewis shell accounting · electron and nucleus sizes are not to scale</text>

      {phase === 1 && profile.pull === 'equal' && (
        <g className="force-overlay">
          <path d="M390 78 L447 78" markerEnd="url(#bond-arrow)" /><path d="M510 100 L453 100" markerEnd="url(#bond-arrow)" />
          <text x="450" y="55" textAnchor="middle">equal attraction to the shared region</text>
        </g>
      )}
      {phase === 1 && profile.pull === 'right' && (
        <g className="force-overlay">
          <path d="M390 78 L515 78" markerEnd="url(#bond-arrow)" />
          <text x="450" y="55" textAnchor="middle">stronger electron pull toward {profile.right.symbol}</text>
        </g>
      )}

      {phase > 0 && profile.kind === 'polar-covalent' && <ellipse className="density-cloud" cx="482" cy="190" rx={phase === 2 ? 100 : 75} ry="48" fill="url(#electron-density)" />}
      {phase === 2 && !ionic && <CovalentBond profile={profile} />}
      {phase === 1 && ionic && <TransferElectrons profile={profile} />}
      {phase === 2 && ionic && <IonicAttraction />}

      <AtomShell element={leftElement} shells={leftShells} x={positions[0]} y={190} charge={phase === 2 && ionic ? profile.left.charge : null} side="left" />
      <AtomShell element={rightElement} shells={rightShells} x={positions[1]} y={190} charge={phase === 2 && ionic ? profile.right.charge : null} side="right" />

      {phase === 2 && !ionic && <SharedElectrons bondOrder={profile.bondOrder} />}
      {phase === 2 && profile.kind === 'polar-covalent' && <g className="partial-charges"><text x="310" y="92">δ+</text><text x="590" y="92">δ−</text></g>}
      {phase === 2 && <text x="450" y="312" textAnchor="middle" className="arrangement-label">{ionic ? 'electron transfer → opposite charges attract' : `${profile.sharedElectrons} shared electron${profile.sharedElectrons === 1 ? '' : 's'} → ${profile.bondOrder === 1 ? 'single' : profile.bondOrder === 2 ? 'double' : 'triple'} bond`}</text>}
    </svg>
  )
}

function AtomShell({ element, shells, x, y, charge, side }) {
  const maxRadius = 30 + Math.max(0, shells.length - 1) * 25
  return (
    <g className="shell-atom" data-side={side} transform={`translate(${x} ${y})`}>
      <circle className="atom-aura" r={maxRadius + 15} />
      {shells.map((count, shellIndex) => {
        const radius = 30 + shellIndex * 25
        return (
          <g key={`${shellIndex}-${count}`} className="electron-shell">
            <circle r={radius} />
            {electronPositions(count, radius, side === 'left' ? -0.22 : 0.22).map(([electronX, electronY], index) => (
              <circle className={shellIndex === shells.length - 1 ? 'electron valence' : 'electron'} key={index} cx={electronX} cy={electronY} r={shellIndex === shells.length - 1 ? 5.5 : 4} />
            ))}
          </g>
        )
      })}
      <circle className="nucleus" r="23" />
      <text className="atom-symbol" textAnchor="middle" y="6">{element.symbol}</text>
      <text className="proton-count" textAnchor="middle" y="49">{element.number}p⁺ nucleus</text>
      {charge && <g className="whole-charge"><circle cx={maxRadius + 9} cy={-maxRadius - 4} r="17" /><text x={maxRadius + 9} y={-maxRadius + 2} textAnchor="middle">{charge}</text></g>}
    </g>
  )
}

function CovalentBond({ profile }) {
  const lineYs = profile.bondOrder === 1 ? [190] : profile.bondOrder === 2 ? [180, 200] : [170, 190, 210]
  return <g className="covalent-lines">{lineYs.map((y) => <line key={y} x1="372" x2="528" y1={y} y2={y} />)}</g>
}

function SharedElectrons({ bondOrder }) {
  const pairYs = bondOrder === 1 ? [190] : bondOrder === 2 ? [180, 200] : [170, 190, 210]
  return (
    <g className="shared-electrons" filter="url(#electron-glow)">
      {pairYs.flatMap((y) => [<circle key={`${y}-a`} cx="442" cy={y - 5} r="5.5" />, <circle key={`${y}-b`} cx="458" cy={y + 5} r="5.5" />])}
    </g>
  )
}

function TransferElectrons({ profile }) {
  const ys = profile.transferElectrons === 1 ? [190] : [178, 202]
  return (
    <g className="transfer-electrons">
      <path d="M385 190 C420 145 480 145 530 190" markerEnd="url(#bond-arrow)" />
      {ys.map((y, index) => <circle key={y} cx={420 + index * 32} cy={y - 28} r="6" />)}
      <text x="450" y="120" textAnchor="middle">{profile.transferElectrons} electron{profile.transferElectrons === 1 ? '' : 's'} transferring</text>
    </g>
  )
}

function IonicAttraction() {
  return (
    <g className="ionic-attraction">
      <path d="M397 190 L433 190" markerEnd="url(#bond-arrow)" /><path d="M503 190 L467 190" markerEnd="url(#bond-arrow)" />
      <text x="450" y="145" textAnchor="middle">electrostatic attraction</text>
      <text x="450" y="196" textAnchor="middle">+ ··· −</text>
    </g>
  )
}

function ShellLedger({ side, profile, phase, accounted }) {
  const atom = profile[side]
  const initialValence = atom.initialShells.at(-1)
  const isFinal = phase === 2
  const donorInTransfer = phase === 1 && profile.kind === 'ionic' && side === 'left'
  const localElectrons = profile.kind === 'ionic' ? null : initialValence - profile.bondOrder
  return (
    <div className={`shell-ledger ${isFinal || donorInTransfer ? 'filled' : ''}`}>
      <div><span>{atom.symbol} outer-shell count</span><strong>{accounted}/{atom.targetOuter}</strong></div>
      <div className="shell-slots" role="img" aria-label={`${atom.symbol} counts ${accounted} of ${atom.targetOuter} outer-shell electrons`}>
        {Array.from({ length: atom.targetOuter }, (_, index) => <i key={index} className={index < accounted ? 'occupied' : ''} />)}
      </div>
      <p>{donorInTransfer ? `Electron departed; exposed shell: ${atom.finalShells.join(' · ')}` : isFinal ? profile.kind === 'ionic' ? `Final shell arrangement: ${atom.finalShells.join(' · ')}` : `${localElectrons} nonbonding + ${profile.sharedElectrons} shared = ${atom.targetOuter}` : `${initialValence} valence electron${initialValence === 1 ? '' : 's'} before bonding`}</p>
    </div>
  )
}

function visibleShells(profile, side, phase) {
  const atom = profile[side]
  if (phase === 1 && profile.kind === 'ionic' && side === 'left') {
    return atom.finalShells
  }
  if (phase !== 2) return atom.initialShells
  if (profile.kind === 'ionic') return atom.finalShells
  const shells = [...atom.initialShells]
  shells[shells.length - 1] -= profile.bondOrder
  return shells
}

function outerShellCount(profile, side, phase) {
  const atom = profile[side]
  if (phase === 1 && profile.kind === 'ionic' && side === 'left') return atom.finalShells.at(-1)
  if (phase !== 2) return atom.initialShells.at(-1)
  if (profile.kind === 'ionic') return atom.finalShells.at(-1)
  return atom.targetOuter
}

function forceExplanation(profile, phase) {
  if (phase === 0) return 'Each negative electron is attracted to positive nuclei, but the atoms are still far enough apart to remain separate.'
  if (phase === 1 && profile.kind === 'ionic') return `${profile.right.symbol} has the stronger pull. Electron transfer creates full charges when that arrangement is energetically favorable.`
  if (phase === 1 && profile.pull === 'right') return `Both nuclei pull on the same bonding electrons. ${profile.right.symbol} pulls harder, shifting the probability density toward itself.`
  if (phase === 1) return 'The two nuclei pull equally on electrons in the overlap region, so the bonding density stays symmetric.'
  if (profile.kind === 'ionic') return 'The ions’ opposite whole charges attract in every direction, building a repeating crystal lattice in the solid.'
  if (profile.pull === 'right') return 'Attraction between both nuclei and the shared electron density holds the atoms together; unequal pull gives the bond two partial-charge ends.'
  return 'Attraction between both positive nuclei and the shared negative electron density lowers the energy and holds the atoms together.'
}

function electronPositions(count, radius, offset = 0) {
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + offset + (index / count) * Math.PI * 2
    return [Number((Math.cos(angle) * radius).toFixed(2)), Number((Math.sin(angle) * radius).toFixed(2))]
  })
}

function prettyFormula(formula) {
  const subscripts = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' }
  return formula.replace(/\d/g, (digit) => subscripts[digit])
}
