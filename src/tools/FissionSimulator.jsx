import { AlertTriangle, Atom, CheckCircle2, ChevronRight, CircleGauge, Droplets, Gauge, RotateCcw, ShieldCheck, Split, Thermometer } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { FissionScene } from '../components/ScienceScenes'
import { rendererBackend } from '../components/ScientificCanvas.jsx'
import { ToolIntro } from './PeriodicTable'

const fuels = {
  u235: { label: 'Uranium-235', symbol: '²³⁵U', compound: '²³⁶U*', protons: 92, mass: 235, absorption: 'High probability for slow neutrons', products: '¹⁴¹Ba + ⁹²Kr + 3n', fragments: [{ label: '¹⁴¹Ba', protons: 56, mass: 141 }, { label: '⁹²Kr', protons: 36, mass: 92 }] },
  pu239: { label: 'Plutonium-239', symbol: '²³⁹Pu', compound: '²⁴⁰Pu*', protons: 94, mass: 239, absorption: 'Fissile with thermal or fast neutrons', products: '¹³⁴Te + ¹⁰³Zr + 3n (one possible split)', fragments: [{ label: '¹³⁴Te', protons: 52, mass: 134 }, { label: '¹⁰³Zr', protons: 40, mass: 103 }] },
  u233: { label: 'Uranium-233', symbol: '²³³U', compound: '²³⁴U*', protons: 92, mass: 233, absorption: 'Fissile fuel bred from thorium-232', products: '¹⁴⁰Xe + ⁹¹Sr + 3n (one possible split)', fragments: [{ label: '¹⁴⁰Xe', protons: 54, mass: 140 }, { label: '⁹¹Sr', protons: 38, mass: 91 }] },
}

export default function FissionSimulator() {
  const [fuel, setFuel] = useState('u235')
  const [stage, setStage] = useState(0)
  const [moderator, setModerator] = useState('water')
  const [rods, setRods] = useState(58)
  const [coolant, setCoolant] = useState('water')
  const currentFuel = fuels[fuel]
  const outcome = useMemo(() => {
    if (coolant === 'none') return { status: 'unsafe', title: 'Core temperature rising', k: 1.18, text: 'Without coolant, fission heat is not carried to the steam loop. The automatic shutdown system inserts control rods.' }
    if (rods < 35) return { status: 'hot', title: 'Supercritical chain reaction', k: 1.12, text: 'Too few neutrons are absorbed. Power rises each generation, so the protection system inserts rods.' }
    if (rods > 72) return { status: 'quiet', title: 'Reactor becomes subcritical', k: 0.84, text: 'Control rods absorb enough neutrons that each generation produces fewer fissions. Power falls safely.' }
    return { status: 'safe', title: 'Critical and steady', k: 1.0, text: 'On average, one neutron from each fission triggers another. The chain reaction and thermal power remain steady.' }
  }, [coolant, rods])

  const labels = [
    { title: `Fuel: ${currentFuel.symbol}`, text: `${currentFuel.protons} protons and ${currentFuel.mass - currentFuel.protons} neutrons. ${currentFuel.absorption}.` },
    { title: 'Neutron introduced', text: 'A free neutron approaches the heavy nucleus. It has no electric charge, so the nucleus does not repel it.' },
    { title: 'Compound nucleus vibrates', text: `After capture, ${currentFuel.symbol} + n forms ${currentFuel.compound}, an excited nucleus with ${currentFuel.mass + 1} nucleons. Its shape stretches and develops a neck.` },
    { title: 'Nucleus splits', text: `${currentFuel.products}. About 200 MeV appears mainly as fragment motion, plus gamma rays and neutrinos.` },
    { title: outcome.title, text: outcome.text },
  ]

  const interactionPhases = [
    { title: 'Fissile nucleus', text: `${currentFuel.symbol} contains ${currentFuel.protons} protons and ${currentFuel.mass - currentFuel.protons} neutrons.` },
    { title: 'Neutron capture', text: 'A neutral projectile can enter without overcoming electric repulsion.' },
    { title: 'Nucleus deforms', text: `${currentFuel.compound} oscillates, stretches, and develops a neck before scission.` },
    { title: 'Fission products recoil', text: `${currentFuel.products}; mass-energy and nucleon totals are conserved.` },
    { title: 'Neutrons meet new nuclei', text: 'Emitted neutrons may cause another fission, escape, or be absorbed by control materials.' },
  ]

  useEffect(() => {
    const visibleNuclei = stage < 2
      ? [{ isotope: currentFuel.symbol, protons: currentFuel.protons, neutrons: currentFuel.mass - currentFuel.protons }]
      : stage === 2
        ? [{ isotope: currentFuel.compound, protons: currentFuel.protons, neutrons: currentFuel.mass + 1 - currentFuel.protons }]
        : currentFuel.fragments.map((fragment) => ({ isotope: fragment.label, protons: fragment.protons, neutrons: fragment.mass - fragment.protons }))
    window.render_game_to_text = () => JSON.stringify({
      simulation: 'nuclear fission',
      particleView: true,
      fuel: currentFuel.label,
      stage,
      visibleInteraction: interactionPhases[stage],
      possibleSplit: currentFuel.products,
      emittedNeutrons: stage >= 3 ? 3 : 0,
      visibleNuclei,
      nuclearTransformation: {
        equation: `${currentFuel.symbol} + n → ${currentFuel.compound} → ${currentFuel.products} + energy`,
        inputNucleons: currentFuel.mass + 1,
        outputNucleons: currentFuel.fragments.reduce((sum, fragment) => sum + fragment.mass, 3),
        capturedCompound: currentFuel.compound,
      },
      chainControl: stage === 4 ? { multiplicationFactor: outcome.k, status: outcome.title, rodsPercent: rods, moderator, coolant } : null,
      renderer: rendererBackend('fission-simulator'),
      electronModel: 'The neutral atom electron cloud is omitted because this view follows neutron capture and nuclear splitting.',
    })
    window.advanceTime = (ms) => { if (ms >= 800) setStage((value) => Math.min(4, value + 1)) }
    return () => { delete window.render_game_to_text; delete window.advanceTime }
  }, [currentFuel, stage, outcome, rods, moderator, coolant])

  return (
    <div>
      <ToolIntro eyebrow="One nucleus splits · neutrons continue the chain" title="Fission Control" description="Guide a realistic reactor sequence. Your choices affect neutron speed, multiplication, and heat removal." accent="#79d8c2" />
      <div className="fission-layout">
        <section className="fission-stage panel">
          <FissionScene stage={stage} element={currentFuel} />
          <div className="nuclear-label"><span>{stage + 1}</span><div><strong>{labels[stage].title}</strong><p>{labels[stage].text}</p></div></div>
        </section>
        <aside className="fission-controls panel">
          <div className="panel-heading"><span className="step-dot">{stage + 1}</span><div><p className="eyebrow">Reactor procedure</p><h2>{stage < 4 ? 'Observe the fission event' : 'Control the chain'}</h2></div></div>
          {stage === 0 && <label className="field-label">Fissile isotope<select value={fuel} onChange={(event) => setFuel(event.target.value)}>{Object.entries(fuels).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></label>}
          {stage >= 1 && stage < 4 && <div className="observation-card"><Split /><div><strong>{labels[stage].title}</strong><p>{labels[stage].text}</p></div></div>}
          {stage === 4 && (
            <div className="reactor-choices">
              <label className="field-label">Neutron moderator<select value={moderator} onChange={(event) => setModerator(event.target.value)}><option value="water">Light water — slows + absorbs some</option><option value="heavy">Heavy water — slows, absorbs less</option><option value="graphite">Graphite — solid moderator</option></select></label>
              <label className="rod-slider"><span><ShieldCheck /> Control-rod insertion<strong>{rods}%</strong></span><input type="range" min="0" max="100" value={rods} onChange={(event) => setRods(Number(event.target.value))} /></label>
              <label className="field-label">Primary coolant<select value={coolant} onChange={(event) => setCoolant(event.target.value)}><option value="water">Pressurized water</option><option value="sodium">Liquid sodium</option><option value="gas">Helium gas</option><option value="none">No coolant</option></select></label>
            </div>
          )}
          {stage < 4 ? <button className="primary-button full" onClick={() => setStage(stage + 1)}>Continue sequence <ChevronRight size={18} /></button> : <button className="primary-button full" onClick={() => setStage(0)}>Reset the reactor <RotateCcw size={17} /></button>}
        </aside>
        {stage === 4 && (
          <section className={`reactor-dashboard panel ${outcome.status}`}>
            <div className="reactor-status">{outcome.status === 'safe' || outcome.status === 'quiet' ? <CheckCircle2 /> : <AlertTriangle />}<div><p className="eyebrow">Neutron economy</p><h2>{outcome.title}</h2><p>{outcome.text}</p></div></div>
            <div className="reactor-gauges">
              <div><Gauge /><span>Multiplication factor<strong>k = {outcome.k.toFixed(2)}</strong></span></div>
              <div><Thermometer /><span>Thermal response<strong>{coolant === 'none' ? 'Rising quickly' : 'Heat removed'}</strong></span></div>
              <div><Droplets /><span>Coolant loop<strong>{coolant === 'none' ? 'Offline' : coolant}</strong></span></div>
              <div><CircleGauge /><span>Moderator<strong>{moderator}</strong></span></div>
            </div>
            <p className="safety-note"><ShieldCheck size={18} /> Real power reactors include multiple independent shutdown and cooling systems. This model teaches neutron balance; it is not an operating guide.</p>
          </section>
        )}
      </div>
      <section className="nuclear-interaction-strip panel">
        <div className="nuclear-strip-heading"><Atom /><div><p className="eyebrow">How one atom triggers the next</p><h2>Follow the particles through fission</h2></div></div>
        <div className="nuclear-phase-list">{interactionPhases.map((phase,index) => <button key={phase.title} className={index < stage ? 'done' : index === stage ? 'active' : ''} onClick={() => setStage(index)}><b>{index + 1}</b><span><strong>{phase.title}</strong><small>{phase.text}</small></span></button>)}</div>
        <p className="model-caveat">Fragment identities vary from event to event; the displayed split is one possible channel. After capture the compound nucleus contains one more neutron than the selected fuel. The neutral atom’s electron cloud is omitted because this view follows nuclear capture and splitting. Nucleus size, spacing, and timing are enlarged.</p>
      </section>
    </div>
  )
}
