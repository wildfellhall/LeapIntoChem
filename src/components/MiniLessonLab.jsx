import { Atom, CheckCircle2, ChevronRight, Flame, RotateCcw, Sparkles, Target, Zap } from 'lucide-react'
import { useState } from 'react'

const smallElements = [
  { symbol: 'H', name: 'Hydrogen', number: 1, period: 1, group: 1 },
  { symbol: 'C', name: 'Carbon', number: 6, period: 2, group: 14 },
  { symbol: 'O', name: 'Oxygen', number: 8, period: 2, group: 16 },
  { symbol: 'Na', name: 'Sodium', number: 11, period: 3, group: 1 },
  { symbol: 'Cl', name: 'Chlorine', number: 17, period: 3, group: 17 },
]
const elementNames = ['Hydrogen', 'Helium', 'Lithium', 'Beryllium', 'Boron', 'Carbon', 'Nitrogen', 'Oxygen', 'Fluorine', 'Neon', 'Sodium', 'Magnesium']
const formulas = {
  H2O: { H: 2, O: 1 }, CO2: { C: 1, O: 2 }, NaCl: { Na: 1, Cl: 1 }, NH3: { N: 1, H: 3 }, H2O2: { H: 2, O: 2 },
}

const labComponents = {
  periodic: PeriodicMini,
  atom: AtomMini,
  shell: ShellMini,
  formula: FormulaMini,
  matter: MatterMini,
  scale: ScaleMini,
  bond: BondMini,
  polarity: PolarityMini,
  reaction: ReactionMini,
  equation: EquationMini,
  energy: EnergyMini,
  orbital: OrbitalMini,
  fission: FissionMini,
  reactor: ReactorMini,
  star: StarMini,
  fusion: FusionMini,
  tokamak: TokamakMini,
}

export default function MiniLessonLab({ mini, interactions = 0, onInteract }) {
  const Lab = labComponents[mini.type]
  const recordControl = (event) => {
    if (event.target.closest('button, input, select')) onInteract?.()
  }
  return (
    <section className="lesson-mini panel" data-mini-type={mini.type} aria-label={`Mini interactive: ${mini.label}`} onPointerUp={recordControl}>
      <div className="mini-heading"><span><Sparkles size={16} /> Try the idea</span><h2>{mini.label}</h2></div>
      <div className="mini-challenge"><Target size={18} /><div><strong>Investigation challenge</strong><p>{mini.challenge}</p></div></div>
      {Lab ? <Lab mode={mini.mode} initialPathway={mini.pathway} /> : <p className="mini-status">This model is being prepared.</p>}
      <div className={`mini-evidence ${interactions > 0 ? 'active' : ''}`}><span>{interactions > 0 ? 'Evidence collected' : 'Predict, then change one control'}</span><strong>{interactions} adjustment{interactions === 1 ? '' : 's'}</strong></div>
    </section>
  )
}

function PeriodicMini() {
  const clues = [
    { prompt: 'Find atomic number 8.', answer: 'O' },
    { prompt: 'Find the period 3, group 1 element.', answer: 'Na' },
    { prompt: 'Find the element with 6 protons.', answer: 'C' },
  ]
  const [selected, setSelected] = useState(smallElements[2])
  const [clueIndex, setClueIndex] = useState(0)
  const solved = selected.symbol === clues[clueIndex].answer
  return <div className="mini-periodic"><div className="mini-task-row"><span>{clues[clueIndex].prompt}</span><button onClick={() => setClueIndex((value) => (value + 1) % clues.length)}>New clue</button></div><div className="mini-element-row">{smallElements.map((item) => <button key={item.symbol} className={selected.symbol === item.symbol ? 'active' : ''} aria-pressed={selected.symbol === item.symbol} onClick={() => setSelected(item)}><small>{item.number}</small><strong>{item.symbol}</strong></button>)}</div><div className="mini-readout"><span>{selected.number}</span><div><strong>{selected.name}</strong><small>Period {selected.period} · Group {selected.group} · {selected.number} proton{selected.number === 1 ? '' : 's'}</small></div></div><p className={`mini-status ${solved ? 'success' : ''}`}>{solved ? 'Clue solved: the table position and proton count agree.' : 'Use both the atomic number and table position as evidence.'}</p></div>
}

function AtomMini() {
  const targets = [
    { label: 'neutral carbon-14', protons: 6, neutrons: 8, electrons: 6 },
    { label: 'sodium-23 ion, Na⁺', protons: 11, neutrons: 12, electrons: 10 },
    { label: 'oxygen-18 ion, O²⁻', protons: 8, neutrons: 10, electrons: 10 },
  ]
  const [targetIndex, setTargetIndex] = useState(0)
  const [protons, setProtons] = useState(6)
  const [neutrons, setNeutrons] = useState(6)
  const [electrons, setElectrons] = useState(6)
  const target = targets[targetIndex]
  const charge = protons - electrons
  const solved = protons === target.protons && neutrons === target.neutrons && electrons === target.electrons
  return <div className="mini-atom"><div className="mini-task-row"><span>Build <strong>{target.label}</strong>.</span><button onClick={() => setTargetIndex((value) => (value + 1) % targets.length)}>New atom</button></div><div className="mini-nucleus" aria-hidden="true"><span>p⁺ {protons}</span><span>n⁰ {neutrons}</span><i className="mini-electron-orbit" /></div><div className="mini-sliders"><MiniRange label="Protons" value={protons} setValue={setProtons} min={1} max={12} /><MiniRange label="Neutrons" value={neutrons} setValue={setNeutrons} min={0} max={16} /><MiniRange label="Electrons" value={electrons} setValue={setElectrons} min={0} max={12} /></div><p className={`mini-status ${solved ? 'success' : ''}`}><strong>{elementNames[protons - 1] || `Element ${protons}`}-{protons + neutrons}</strong> · {charge === 0 ? 'neutral atom' : `${Math.abs(charge)}${charge > 0 ? '+' : '−'} ion`}{solved ? ' · target matched' : ''}</p></div>
}

function ShellMini() {
  const targets = [{ count: 2, label: 'helium' }, { count: 10, label: 'neon' }, { count: 17, label: 'chlorine' }]
  const [targetIndex, setTargetIndex] = useState(1)
  const [electrons, setElectrons] = useState(0)
  const target = targets[targetIndex]
  const shells = [Math.min(2, electrons), Math.min(8, Math.max(0, electrons - 2)), Math.min(8, Math.max(0, electrons - 10))]
  const outer = [...shells].reverse().find((count) => count > 0) || 0
  return <div className="mini-shell"><div className="mini-task-row"><span>Fill shells for <strong>{target.label}</strong> ({target.count} e⁻).</span><button onClick={() => setTargetIndex((value) => (value + 1) % targets.length)}>New target</button></div><div className="shell-rows">{shells.map((count, shell) => { const capacity = shell === 0 ? 2 : 8; return <div key={shell}><strong>n = {shell + 1}</strong><span>{Array.from({ length: capacity }, (_, index) => <i key={index} className={index < count ? 'filled' : ''} />)}</span><small>{count}/{capacity}</small></div> })}</div><div className="mini-actions"><button onClick={() => setElectrons((value) => Math.max(0, value - 1))}>Remove e⁻</button><button onClick={() => setElectrons((value) => Math.min(18, value + 1))}>Add e⁻</button><button onClick={() => setElectrons(0)}><RotateCcw size={15} /> Reset</button></div><p className={`mini-status ${electrons === target.count ? 'success' : ''}`}>{electrons} electron{electrons === 1 ? '' : 's'} · outer count {outer}{electrons === target.count ? ' · shell target reached' : ''}</p></div>
}

function FormulaMini() {
  const [formula, setFormula] = useState('H2O')
  const [answer, setAnswer] = useState('')
  const composition = formulas[formula]
  const total = Object.values(composition).reduce((sum, count) => sum + count, 0)
  const checked = answer !== ''
  const correct = Number(answer) === total
  return <div className="mini-formula"><label>Formula<select value={formula} onChange={(event) => { setFormula(event.target.value); setAnswer('') }}>{Object.keys(formulas).map((item) => <option key={item}>{item}</option>)}</select></label><div className="formula-atoms">{Object.entries(composition).flatMap(([symbol, count]) => Array.from({ length: count }, (_, index) => <span key={`${symbol}-${index}`} className={`atom-${symbol.toLowerCase()}`}>{symbol}</span>))}</div><div className="formula-counts">{Object.entries(composition).map(([symbol, count]) => <span key={symbol}><strong>{symbol}</strong> × {count}</span>)}</div><div className="mini-question"><label>Total atoms in one formula unit<input aria-label="Total atom prediction" type="number" min="1" max="12" value={answer} onChange={(event) => setAnswer(event.target.value)} /></label></div><p className={`mini-status ${checked && correct ? 'success' : ''}`}>{!checked ? 'Count every atom shown; an omitted subscript means one.' : correct ? `Correct: one ${formula} unit contains ${total} atoms.` : 'Recheck each subscript and add the counts.'}</p></div>
}

function MatterMini() {
  const [temperature, setTemperature] = useState(35)
  const [pressure, setPressure] = useState(50)
  const meltPoint = 22 - (pressure - 50) * .04
  const boilPoint = 70 + (pressure - 50) * .24
  const phase = temperature < meltPoint ? 'solid' : temperature < boilPoint ? 'liquid' : 'gas'
  return <div className={`mini-matter ${phase}`}><div className="mini-dual-controls"><label>Relative temperature <strong>{temperature}</strong><input aria-label="Relative temperature" type="range" min="0" max="100" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} /></label><label>Relative pressure <strong>{pressure}</strong><input aria-label="Relative pressure" type="range" min="10" max="90" value={pressure} onChange={(event) => setPressure(Number(event.target.value))} /></label></div><div className="particle-box" aria-label={`${phase} particle model`}>{Array.from({ length: 16 }, (_, index) => <i key={index} style={{ '--particle-index': index }} />)}</div><p className="mini-status"><strong>{phase}</strong> · {phase === 'solid' ? 'organized positions with vibration' : phase === 'liquid' ? 'close particles changing neighbors' : 'widely traveling particles'} · boundaries are qualitative</p></div>
}

function ScaleMini() {
  const samples = {
    water: { label: 'water', formula: 'H₂O', bulk: 'colorless liquid', particle: 'bent, discrete molecules', atoms: ['H', 'O', 'H'] },
    salt: { label: 'sodium chloride', formula: 'NaCl', bulk: 'white crystalline solid', particle: 'repeating Na⁺/Cl⁻ lattice', atoms: ['Na⁺', 'Cl⁻', 'Na⁺', 'Cl⁻'] },
    quartz: { label: 'quartz', formula: 'SiO₂', bulk: 'hard crystalline solid', particle: 'extended Si–O network', atoms: ['O', 'Si', 'O', 'Si'] },
  }
  const [view, setView] = useState('bulk')
  const [sampleId, setSampleId] = useState('water')
  const sample = samples[sampleId]
  return <div className="mini-scale"><label>Sample<select value={sampleId} onChange={(event) => setSampleId(event.target.value)}>{Object.entries(samples).map(([key, item]) => <option value={key} key={key}>{item.label} · {item.formula}</option>)}</select></label><div className="mini-segmented" role="group" aria-label="Choose model scale"><button className={view === 'bulk' ? 'active' : ''} aria-pressed={view === 'bulk'} onClick={() => setView('bulk')}>Bulk sample</button><button className={view === 'particles' ? 'active' : ''} aria-pressed={view === 'particles'} onClick={() => setView('particles')}>Particle model</button></div><div className={`scale-stage ${view} sample-${sampleId}`}>{view === 'bulk' ? <div className={`mini-vessel ${sampleId}`}><i /></div> : <div className="mini-particle-model">{sample.atoms.map((atom, index) => <span key={`${atom}-${index}`}>{atom}</span>)}</div>}</div><p className="mini-status"><strong>{sample.formula}</strong> · {view === 'bulk' ? sample.bulk : sample.particle}. The views describe the same material at different scales.</p></div>
}

function BondMini({ mode: initialMode = 'covalent' }) {
  const [mode, setMode] = useState(initialMode === 'ionic' ? 'ionic' : 'covalent')
  const [stage, setStage] = useState(0)
  const [order, setOrder] = useState(1)
  const ionic = mode === 'ionic'
  const labels = ionic ? ['Separate neutral atoms', 'One valence electron transfers', 'Na⁺ and Cl⁻ attract in a lattice'] : ['Separate neutral atoms', 'Valence orbitals overlap', `${order * 2} shared electrons stabilize the bond`]
  return <div className={`mini-bond ${ionic ? 'ionic' : 'covalent'} stage-${stage}`}><div className="mini-segmented"><button className={!ionic ? 'active' : ''} onClick={() => { setMode('covalent'); setStage(0) }}>Covalent</button><button className={ionic ? 'active' : ''} onClick={() => { setMode('ionic'); setStage(0) }}>Ionic</button></div>{!ionic && <label className="compact-select">Bond order<select value={order} onChange={(event) => setOrder(Number(event.target.value))}><option value="1">Single · 2 shared e⁻</option><option value="2">Double · 4 shared e⁻</option><option value="3">Triple · 6 shared e⁻</option></select></label>}<div className="bond-stage"><div className="mini-bond-atom left">{ionic ? 'Na' : order === 1 ? 'H' : 'N'}<i /></div><span className="travel-electron">e⁻</span><div className="bond-cloud">{!ionic && stage > 0 ? `${order} shared pair${order === 1 ? '' : 's'}` : ''}</div><div className="mini-bond-atom right">{ionic ? 'Cl' : order === 1 ? 'H' : 'N'}<i /></div></div><div className="mini-stage-picker" aria-label="Bonding stages">{labels.map((label, index) => <button key={label} className={index === stage ? 'active' : ''} onClick={() => setStage(index)}><span>{index + 1}</span>{label}</button>)}</div><p className={`mini-status ${stage === 2 ? 'success' : ''}`}><strong>Electron ledger:</strong> {ionic ? stage < 2 ? 'Na and Cl begin neutral; one electron is tracked during transfer.' : 'electron count conserved; ion charges are +1 and −1.' : `${order * 2} electrons occupy the modeled bonding region; they are shared, not stationary.`}</p></div>
}

function PolarityMini() {
  const molecules = {
    H2: { label: 'H–H', left: 'H', right: 'H', difference: 0, note: 'equal sharing; no bond dipole' },
    CH: { label: 'C–H', left: 'H', right: 'C', difference: .35, note: 'very small electronegativity difference' },
    HCl: { label: 'H–Cl', left: 'H', right: 'Cl', difference: .96, note: 'polar covalent bond' },
    HF: { label: 'H–F', left: 'H', right: 'F', difference: 1.78, note: 'strongly polar covalent bond' },
  }
  const [id, setId] = useState('HCl')
  const molecule = molecules[id]
  const polar = molecule.difference >= .4
  const shift = Math.min(38, molecule.difference * 18)
  return <div className="mini-polarity"><label>Bond to compare<select value={id} onChange={(event) => setId(event.target.value)}>{Object.entries(molecules).map(([key, item]) => <option value={key} key={key}>{item.label} · ΔEN {item.difference.toFixed(2)}</option>)}</select></label><div className="polarity-stage"><strong>δ{polar ? '+' : '0'}</strong><span className="polarity-cloud" style={{ transform: `translateX(${shift}px)` }} /><i>{molecule.left}</i><span className="dipole-arrow">→</span><i>{molecule.right}</i><strong>δ{polar ? '−' : '0'}</strong></div><p className="mini-status"><strong>ΔEN {molecule.difference.toFixed(2)}</strong> · {molecule.note}. The cloud shift represents probability density, not an electron’s path.</p></div>
}

function ReactionMini() {
  const scenarios = {
    water: { name: 'Water formation', equation: '2H₂ + O₂ → 2H₂O', reactants: '4 H · 2 O', products: '4 H · 2 O', energy: 'energy released' },
    ammonia: { name: 'Ammonia formation', equation: 'N₂ + 3H₂ ⇌ 2NH₃', reactants: '2 N · 6 H', products: '2 N · 6 H', energy: 'heat and pressure affect equilibrium' },
    magnesium: { name: 'Magnesium oxidation', equation: '2Mg + O₂ → 2MgO', reactants: '2 Mg · 2 O', products: '2 Mg · 2 O', energy: 'bright light and heat released' },
  }
  const [scenarioId, setScenarioId] = useState('water')
  const [stage, setStage] = useState(0)
  const scenario = scenarios[scenarioId]
  const stages = ['Count reactant atoms', 'Bring particles together', 'Break and form bonds', 'Inspect products']
  return <div className={`mini-reaction reaction-step-${stage}`}><label>Reaction<select value={scenarioId} onChange={(event) => { setScenarioId(event.target.value); setStage(0) }}>{Object.entries(scenarios).map(([key, item]) => <option value={key} key={key}>{item.name}</option>)}</select></label><div className="reaction-equation" aria-label={scenario.equation}><span>{scenario.equation.split(/[→⇌]/)[0]}</span><Zap size={18} /><strong>{scenario.equation.split(/[→⇌]/)[1]}</strong></div><div className="reaction-particles" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} style={{ '--reaction-particle': index }} />)}</div><div className="mini-stage-picker">{stages.map((label, index) => <button className={stage === index ? 'active' : ''} key={label} onClick={() => setStage(index)}><span>{index + 1}</span>{label}</button>)}</div><p className={`mini-status ${stage === 3 ? 'success' : ''}`}>{stage === 0 ? `Reactant ledger: ${scenario.reactants}` : stage === 1 ? 'Only correctly oriented, energetic collisions can follow the shown pathway.' : stage === 2 ? 'Old bonds reorganize while atoms and total charge remain accounted for.' : `Product ledger: ${scenario.products} · ${scenario.energy}.`}</p></div>
}

function EquationMini() {
  const equations = {
    water: { labels: ['H₂', 'O₂', 'H₂O'], target: [2, 1, 2], atoms: [{ symbol: 'H', factors: [2, 0, 2] }, { symbol: 'O', factors: [0, 2, 1] }] },
    ammonia: { labels: ['N₂', 'H₂', 'NH₃'], target: [1, 3, 2], atoms: [{ symbol: 'N', factors: [2, 0, 1] }, { symbol: 'H', factors: [0, 2, 3] }] },
    magnesium: { labels: ['Mg', 'O₂', 'MgO'], target: [2, 1, 2], atoms: [{ symbol: 'Mg', factors: [1, 0, 1] }, { symbol: 'O', factors: [0, 2, 1] }] },
  }
  const [equationId, setEquationId] = useState('water')
  const [coefficients, setCoefficients] = useState([1, 1, 1])
  const equation = equations[equationId]
  const balanced = coefficients.every((value, index) => value === equation.target[index])
  const update = (index, delta) => setCoefficients((current) => current.map((value, itemIndex) => itemIndex === index ? Math.max(1, Math.min(4, value + delta)) : value))
  return <div className="mini-equation"><label>Equation set<select value={equationId} onChange={(event) => { setEquationId(event.target.value); setCoefficients([1, 1, 1]) }}><option value="water">Hydrogen + oxygen</option><option value="ammonia">Nitrogen + hydrogen</option><option value="magnesium">Magnesium + oxygen</option></select></label><div className="equation-controls">{equation.labels.map((formula, index) => <div key={formula}><button aria-label={`Decrease ${formula} coefficient`} onClick={() => update(index, -1)}>−</button><strong>{coefficients[index]} {formula}</strong><button aria-label={`Increase ${formula} coefficient`} onClick={() => update(index, 1)}>+</button>{index < 2 ? <span>{index === 0 ? '+' : '→'}</span> : null}</div>)}</div><div className="atom-ledger">{equation.atoms.map((atom) => { const left = coefficients[0] * atom.factors[0] + coefficients[1] * atom.factors[1]; const right = coefficients[2] * atom.factors[2]; return <span className={left === right ? 'matched' : ''} key={atom.symbol}>{atom.symbol}: {left} → {right}</span> })}</div><p className={`mini-status ${balanced ? 'success' : ''}`}>{balanced ? 'Balanced: every atom is conserved using the smallest whole-number ratio.' : 'Adjust coefficients only—never change a substance’s subscripts.'}</p></div>
}

function EnergyMini() {
  const [input, setInput] = useState(35)
  const [catalyst, setCatalyst] = useState(false)
  const [thermal, setThermal] = useState('exo')
  const threshold = catalyst ? 42 : 62
  const crossed = input >= threshold
  return <div className="mini-energy"><div className="mini-dual-controls"><label>Collision energy <strong>{input}</strong><input aria-label="Collision energy" type="range" min="0" max="100" value={input} onChange={(event) => setInput(Number(event.target.value))} /></label><label>Energy outcome<select value={thermal} onChange={(event) => setThermal(event.target.value)}><option value="exo">Exothermic products lower</option><option value="endo">Endothermic products higher</option></select></label></div><label className="mini-check"><input type="checkbox" checked={catalyst} onChange={(event) => setCatalyst(event.target.checked)} /> Add catalyst pathway</label><div className={`energy-track ${catalyst ? 'catalyzed' : ''} ${thermal}`} style={{ '--barrier': `${threshold}%` }}><span style={{ left: `${input}%` }}><Atom size={18} /></span><i className="energy-barrier">activation barrier</i></div><p className={`mini-status ${crossed ? 'success' : ''}`}>{crossed ? `Barrier crossed; the modeled ${thermal === 'exo' ? 'exothermic' : 'endothermic'} pathway is accessible.` : `Input is below the ${catalyst ? 'lower catalytic' : 'uncatalyzed'} barrier.`} A catalyst changes the pathway, not ΔH.</p></div>
}

function OrbitalMini() {
  const metadata = { s: { count: 1, max: 2 }, p: { count: 3, max: 6 }, d: { count: 5, max: 10 }, f: { count: 7, max: 14 } }
  const [orbital, setOrbital] = useState('p')
  const [electrons, setElectrons] = useState(3)
  const selected = metadata[orbital]
  const occupancy = Array.from({ length: selected.count }, (_, index) => (electrons > index ? 1 : 0) + (electrons > selected.count + index ? 1 : 0))
  const choose = (item) => { setOrbital(item); setElectrons(Math.min(metadata[item].max, metadata[item].count)) }
  return <div className="mini-orbital"><div className="mini-segmented">{Object.keys(metadata).map((item) => <button key={item} className={orbital === item ? 'active' : ''} onClick={() => choose(item)}>{item}</button>)}</div><div className={`orbital-shape orbital-${orbital}`} aria-label={`${orbital} qualitative probability shape`}><i /><i /><i /><i /></div><MiniRange label={`${orbital} subshell electrons`} value={electrons} setValue={setElectrons} min={0} max={selected.max} /><div className="orbital-boxes" aria-label="Orbital occupancy diagram">{occupancy.map((count, index) => <span key={index}>{count > 0 ? '↑' : ''}{count > 1 ? '↓' : ''}</span>)}</div><p className="mini-status"><strong>{orbital} subshell:</strong> {selected.count} orbital{selected.count === 1 ? '' : 's'} · {selected.max} e⁻ maximum. Equal-energy orbitals fill singly before pairing.</p></div>
}

function FissionMini() {
  const isotopes = {
    U235: { label: 'uranium-235', compound: 'U-236*', products: 'typical fragments + 2–3 n + energy' },
    Pu239: { label: 'plutonium-239', compound: 'Pu-240*', products: 'typical fragments + 2–3 n + energy' },
    U233: { label: 'uranium-233', compound: 'U-234*', products: 'typical fragments + neutrons + energy' },
  }
  const [isotopeId, setIsotopeId] = useState('U235')
  const [stage, setStage] = useState(0)
  const isotope = isotopes[isotopeId]
  const labels = [`${isotope.label} nucleus ready`, 'slow neutron approaches', `${isotope.compound} deforms`, isotope.products, 'released neutrons can enter a next generation']
  return <div className={`mini-fission fission-step-${stage}`}><label>Fissile example<select value={isotopeId} onChange={(event) => { setIsotopeId(event.target.value); setStage(0) }}>{Object.entries(isotopes).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></label><div className="fission-mini-stage"><span className="incoming-neutron">n</span><div className="fission-nucleus"><i /><i /><i /></div><div className="fission-fragment one" /><div className="fission-fragment two" /><span className="outgoing-neutrons">n · n · n</span></div><div className="mini-stage-picker compact">{labels.map((label, index) => <button className={stage === index ? 'active' : ''} key={label} onClick={() => setStage(index)}><span>{index + 1}</span>{label}</button>)}</div><p className={`mini-status ${stage === 4 ? 'success' : ''}`}>Stage {stage + 1}/5 · Nucleons and total energy are conserved; the pictured fragments are a representative event, not a single guaranteed split.</p></div>
}

function ReactorMini() {
  const [rods, setRods] = useState(55)
  const [coolant, setCoolant] = useState('water')
  const [moderator, setModerator] = useState('water')
  const modifier = { water: .0, graphite: .03, none: -.18 }[moderator]
  const k = Number((1.275 - rods * .005 + modifier).toFixed(2))
  const status = coolant === 'none' ? 'Cooling unavailable' : k < .95 ? 'Subcritical' : k > 1.05 ? 'Supercritical' : 'Critical and cooled'
  const generations = Array.from({ length: 5 }, (_, index) => Math.max(3, Math.min(100, 10 * k ** index)))
  return <div className="mini-reactor"><div><MiniRange label="Control-rod insertion (%)" value={rods} setValue={setRods} min={0} max={100} /><label>Moderator<select value={moderator} onChange={(event) => setModerator(event.target.value)}><option value="water">Light water</option><option value="graphite">Graphite</option><option value="none">No moderator</option></select></label><label>Coolant<select value={coolant} onChange={(event) => setCoolant(event.target.value)}><option value="water">Water loop</option><option value="gas">Helium loop</option><option value="none">None</option></select></label></div><div className="reactor-mini-core"><span style={{ height: `${rods}%` }} /><i className={coolant === 'none' ? 'hot' : ''} /></div><div className="generation-bars" aria-label="Relative neutron population over five generations">{generations.map((height, index) => <i key={index} style={{ height: `${height}%` }}><span>{index + 1}</span></i>)}</div><p className={`mini-status ${status === 'Critical and cooled' ? 'success' : ''}`}><strong>k = {k.toFixed(2)}</strong> · {status}. Rods absorb neutrons; the moderator changes neutron energies; coolant removes heat.</p></div>
}

function StarMini() {
  const stars = {
    'red-dwarf': { label: 'Red dwarf', temp: '3,200 K', lum: '0.006 L☉', radius: '0.25 R☉', color: '#ff6a2b', scale: .65, interior: 'slow proton–proton fusion; fully convective in low-mass examples' },
    sun: { label: 'Sun-like dwarf', temp: '5,770 K', lum: '1 L☉', radius: '1 R☉', color: '#ffe18b', scale: .85, interior: 'proton–proton fusion in a hydrogen-rich core' },
    'blue-supergiant': { label: 'Blue supergiant', temp: '12,000 K', lum: '120,000 L☉', radius: '80 R☉', color: '#b9dcff', scale: 1.25, interior: 'rapid fusion with strong temperature dependence and a short lifetime' },
    'red-supergiant': { label: 'Red supergiant', temp: '3,600 K', lum: '120,000 L☉', radius: '890 R☉', color: '#ff4f26', scale: 1.42, interior: 'layered shell burning around an evolved core' },
    'white-dwarf': { label: 'White dwarf', temp: '25,000 K', lum: '0.03 L☉', radius: '0.009 R☉', color: '#e9f4ff', scale: .42, interior: 'no sustained core fusion; electron degeneracy supports the remnant' },
    'neutron-star': { label: 'Neutron star', temp: '600,000 K', lum: '0.2 L☉', radius: '≈10 km', color: '#88c8ff', scale: .28, interior: 'ultradense neutron-rich matter; no ordinary stellar core fusion' },
  }
  const [id, setId] = useState('sun')
  const [view, setView] = useState('surface')
  const star = stars[id]
  return <div className="mini-star"><label>Stellar example<select value={id} onChange={(event) => setId(event.target.value)}>{Object.entries(stars).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></label><div className="mini-segmented"><button className={view === 'surface' ? 'active' : ''} onClick={() => setView('surface')}>Surface</button><button className={view === 'interior' ? 'active' : ''} onClick={() => setView('interior')}>Look inside</button></div><div className={`star-mini-stage ${view}`}><i style={{ '--star-color': star.color, '--star-scale': star.scale }} className={id === 'neutron-star' ? 'pulsar' : ''} />{view === 'interior' && <div className="star-core-layers"><span /><span /><span /></div>}</div><div className="star-readouts"><span>{star.temp}<small>surface</small></span><span>{star.lum}<small>luminosity</small></span><span>{star.radius}<small>radius</small></span></div><p className="mini-status">{view === 'surface' ? 'Surface color follows temperature qualitatively; display sizes are compressed so every class remains visible.' : star.interior}</p></div>
}

function FusionMini({ initialPathway = 'pp' }) {
  const initial = ['pp', 'cno', 'triple', 'dt'].includes(initialPathway) ? initialPathway : 'pp'
  const [pathway, setPathway] = useState(initial)
  const [stage, setStage] = useState(0)
  const pathways = {
    pp: { equation: '4 ¹H → ⁴He + 2e⁺ + 2νₑ + energy', steps: ['protons begin a multistep chain', 'deuterium and helium-3 form', 'helium-4 plus positrons, neutrinos, and energy'] },
    cno: { equation: '4 ¹H → ⁴He + 2e⁺ + 2νₑ + energy (CNO catalysts)', steps: ['carbon-12 captures a proton', 'nitrogen and oxygen isotopes cycle', 'helium-4 exits; carbon-12 returns'] },
    triple: { equation: '3 ⁴He → ¹²C + γ + energy', steps: ['two helium-4 nuclei form brief beryllium-8', 'a third helium reaches a carbon-12 resonance', 'carbon-12 and gamma energy emerge'] },
    dt: { equation: '²H + ³H → ⁴He + n + 17.6 MeV', steps: ['deuterium and tritium approach', 'quantum tunneling permits close approach and binding', 'helium-4, a neutron, and 17.6 MeV emerge'] },
  }
  const model = pathways[pathway]
  return <div className="mini-fusion"><label>Fusion pathway<select value={pathway} onChange={(event) => { setPathway(event.target.value); setStage(0) }}>{Object.keys(pathways).map((item) => <option key={item} value={item}>{item === 'pp' ? 'Proton–proton chain' : item === 'cno' ? 'CNO cycle' : item === 'triple' ? 'Triple-alpha' : 'D–T collision'}</option>)}</select></label><div className="fusion-equation">{model.equation}</div><div className="fusion-mini-stage">{model.steps.map((step, index) => <button key={step} className={index <= stage ? 'active' : ''} onClick={() => setStage(index)}><i>{index + 1}</i><small>{step}</small></button>)}</div><div className="mini-actions"><button onClick={() => setStage((value) => (value + 1) % 3)}>{stage === 2 ? 'Replay pathway' : 'Advance nuclei'} <ChevronRight size={15} /></button></div><p className={`mini-status ${stage === 2 ? 'success' : ''}`}>{stage === 2 ? 'Products reached. The mass difference appears as released energy; charge and nucleon bookkeeping still balance.' : 'Select a stage to inspect the nuclear sequence.'}</p></div>
}

function TokamakMini() {
  const fuels = { dt: { label: 'D–T', factor: 1 }, dd: { label: 'D–D', factor: .38 }, dhe3: { label: 'D–³He', factor: .23 } }
  const [fuel, setFuel] = useState('dt')
  const [temperature, setTemperature] = useState(100)
  const [density, setDensity] = useState(70)
  const [confinement, setConfinement] = useState(3)
  const [magnetic, setMagnetic] = useState(true)
  const [tested, setTested] = useState(false)
  const margin = (temperature / 100) * (density / 70) * (confinement / 3) * fuels[fuel].factor * (magnetic ? 1.05 : .08)
  const ready = margin >= 1
  return <div className="mini-tokamak"><label>Fuel pair<select value={fuel} onChange={(event) => { setFuel(event.target.value); setTested(false) }}>{Object.entries(fuels).map(([key, item]) => <option value={key} key={key}>{item.label}</option>)}</select></label><div className={`tokamak-mini-stage ${tested && ready ? 'ignited' : ''}`}><span /><i /><b>{tested && ready ? <Flame /> : <Atom />}</b></div><MiniRange label="Temperature (relative)" value={temperature} setValue={(value) => { setTemperature(value); setTested(false) }} min={40} max={180} /><MiniRange label="Density (relative)" value={density} setValue={(value) => { setDensity(value); setTested(false) }} min={20} max={100} /><MiniRange label="Confinement time" value={confinement} setValue={(value) => { setConfinement(value); setTested(false) }} min={1} max={6} /><label className="mini-check"><input type="checkbox" checked={magnetic} onChange={(event) => { setMagnetic(event.target.checked); setTested(false) }} /> Magnetic confinement</label><div className="mini-actions"><button onClick={() => setTested(true)}><Zap size={15} /> Test pulse</button></div><p className={`mini-status ${tested && ready ? 'success' : ''}`}>{!tested ? <><strong>{margin.toFixed(2)}× modeled threshold</strong> · adjust all three Lawson-style factors, then test.</> : ready ? <><CheckCircle2 size={14} /> Modeled fusion pulse sustained for this mini-lab.</> : 'Pulse falls below the modeled combined threshold. Increase a limiting factor or restore confinement.'}</p></div>
}

function MiniRange({ label, value, setValue, min, max }) {
  return <label>{label} <strong>{value}</strong><input aria-label={label} type="range" min={min} max={max} value={value} onChange={(event) => setValue(Number(event.target.value))} /></label>
}
