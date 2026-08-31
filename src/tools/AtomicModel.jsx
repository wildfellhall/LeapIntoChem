import { Activity, Atom, CircleDot, Info, Link2, Radio, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AtomScene } from '../components/ScienceScenes'
import { OrbitalLedger } from '../components/OrbitalLedger.jsx'
import { elements, propertyNotes } from '../data/elements'
import { reactionPartners } from '../data/chemistry'
import { subshellNotation, valenceSummary } from '../data/orbitals.js'
import { rendererBackend } from '../components/ScientificCanvas.jsx'
import { ToolIntro } from './PeriodicTable'

export default function AtomicModel() {
  const [atomicNumber, setAtomicNumber] = useState(8)
  const element = elements[atomicNumber - 1]
  const defaultMass = element.isotopes.includes(Math.round(element.mass)) ? Math.round(element.mass) : element.isotopes[0]
  const [massByElement, setMassByElement] = useState({ 8: defaultMass })
  const massNumber = massByElement[atomicNumber] ?? defaultMass
  const neutrons = Math.max(0, massNumber - atomicNumber)
  const chargeTendency = element.group === 1 ? '+1' : element.group === 2 ? '+2' : element.group === 17 ? '−1' : element.group === 16 ? '−2' : element.group === 18 ? '0' : 'variable'
  const polarity = useMemo(() => {
    if (!element.electronegativity) return 'Not well established'
    if (element.electronegativity >= 3) return 'Strong electron pull'
    if (element.electronegativity >= 2) return 'Moderate electron pull'
    return 'Weak electron pull'
  }, [element])

  const updateMass = (value) => setMassByElement((current) => ({ ...current, [atomicNumber]: Number(value) }))

  useEffect(() => {
    window.render_game_to_text = () => JSON.stringify({
      simulation: 'atom studio',
      element: element.name,
      isotope: `${element.symbol}-${massNumber}`,
      particles: { protons: element.number, neutrons, electrons: element.number },
      principalShells: element.shells,
      occupiedSubshells: subshellNotation(element.shells),
      renderer: rendererBackend('atom-studio'),
      modelBoundary: 'Stationary occupied-subshell probability density; shimmer is a visualization cue, not an electron trajectory.',
    })
    window.advanceTime = () => {}
    return () => { delete window.render_game_to_text; delete window.advanceTime }
  }, [element, massNumber, neutrons])

  return (
    <div>
      <ToolIntro eyebrow="Quantum-aware visualization" title="Atom Studio" description="Build an isotope and explore its nucleus and electron probability cloud. Visual sizes are enlarged, but every particle count is real." accent="#c6b6ff" />
      <div className="atom-layout">
        <section className="atom-stage panel">
          <AtomScene element={element} neutrons={neutrons} />
          <div className="atom-overlay">
            <div><span>Element</span><strong>{element.name}</strong></div>
            <div><span>Isotope</span><strong>{element.symbol}-{massNumber}</strong></div>
            <div><span>Net charge</span><strong>0</strong></div>
          </div>
        </section>

        <aside className="atom-controls panel">
          <div className="panel-heading"><span className="step-dot">1</span><div><p className="eyebrow">Choose an element</p><h2>Atomic recipe</h2></div></div>
          <label className="field-label">Element<select value={atomicNumber} onChange={(event) => setAtomicNumber(Number(event.target.value))}>{elements.map((item) => <option key={item.number} value={item.number}>{item.number}. {item.name} ({item.symbol})</option>)}</select></label>
          <div className="isotope-control">
            <div className="isotope-heading"><label htmlFor="mass-slider">Mass number</label><strong>{massNumber}</strong></div>
            <input id="mass-slider" type="range" min={atomicNumber} max={Math.max(atomicNumber + 2, Math.round(element.mass) + 6)} value={massNumber} onChange={(event) => updateMass(event.target.value)} />
            <div className="range-labels"><span>{atomicNumber} (no neutrons)</span><span>{Math.max(atomicNumber + 2, Math.round(element.mass) + 6)}</span></div>
            <div className="quick-isotopes">
              {element.isotopes.map((mass) => <button key={mass} className={massNumber === mass ? 'active' : ''} onClick={() => updateMass(mass)}><sup>{mass}</sup>{element.symbol}</button>)}
            </div>
          </div>
          <div className="particle-counts">
            <div className="particle proton"><i /><span>Protons<strong>{element.number}</strong></span></div>
            <div className="particle neutron"><i /><span>Neutrons<strong>{neutrons}</strong></span></div>
            <div className="particle electron"><i /><span>Electrons<strong>{element.number}</strong></span></div>
          </div>
          <div className="subshell-panel">
            <div><span>Ground-state occupied subshells</span><strong>{subshellNotation(element.shells)}</strong></div>
            <OrbitalLedger shells={element.shells} compact />
          </div>
          <p className="model-note"><Info size={17} /> Each colored layer samples an occupied s, p, d, or f probability distribution. The shimmer is a density cue—not an electron path or a measurement of one electron’s position.</p>
        </aside>
      </div>

      <section className="atom-facts">
        <article className="fact-card"><div className="fact-icon lavender"><Radio /></div><p>Electron arrangement</p><h3>{element.shells.join(' · ')}</h3><span>Outer occupied subshells: {valenceSummary(element.shells)}</span></article>
        <article className="fact-card"><div className="fact-icon coral-bg"><Activity /></div><p>Bonding tendency</p><h3>{polarity}</h3><span>Likely ionic charge: {chargeTendency}</span></article>
        <article className="fact-card"><div className="fact-icon mint-bg"><Link2 /></div><p>Common pairings</p><h3>{reactionPartners(element.symbol).join(' · ') || 'Varied / limited data'}</h3><span>{propertyNotes[element.symbol]?.[0] || element.reactivity}</span></article>
      </section>

      <section className="explain-panel panel">
        <div className="explain-icon"><Atom size={26} /></div>
        <div><p className="eyebrow">What changes when neutrons change?</p><h2>The element stays. The isotope changes.</h2><p>Proton count is an element’s identity card. Changing neutrons changes its mass and sometimes its nuclear stability, but {element.name.toLowerCase()} with {element.number} proton{element.number === 1 ? '' : 's'} is always {element.name.toLowerCase()}. Neutral atoms have the same number of electrons as protons.</p></div>
        <Sparkles className="explain-spark" />
      </section>
    </div>
  )
}
