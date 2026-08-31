import { Activity, Atom, CheckCircle2, ChevronRight, CircleGauge, Eye, Flame, FlaskConical, Orbit, Rocket, RotateCcw, Sparkles, ThermometerSun } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { FusionScene } from '../components/ScienceScenes'
import { rendererBackend } from '../components/ScientificCanvas.jsx'
import { defaultStellarArchetype, inferStellarArchetype, mainSequenceLuminosity, stellarArchetypeById, stellarArchetypes, stellarRadiusSolar } from '../data/stellar'
import { ToolIntro } from './PeriodicTable'

const labFuels = {
  dt: { label: 'Deuterium + tritium', equation: '²H + ³H → ⁴He + n + 17.6 MeV', microscopeEquation: '²H + ³H → ⁵He* → ⁴He + n', threshold: 100, nuclei: { reactants: [{ isotope: '²H', protons: 1, neutrons: 1 }, { isotope: '³H', protons: 1, neutrons: 2 }], compound: { isotope: '⁵He*', protons: 2, neutrons: 3 }, products: [{ isotope: '⁴He', protons: 2, neutrons: 2 }, { isotope: 'n', protons: 0, neutrons: 1 }] }, note: 'The most achievable fusion fuel on Earth; produces energetic neutrons.', micro: ['A deuterium nucleus and tritium nucleus approach fast enough to overcome electric repulsion.', 'A short-lived excited helium-5 compound state forms as their nucleons overlap.', 'The state separates into helium-4 and a fast neutron; they carry 17.6 MeV total kinetic energy.'] },
  dd: { label: 'Deuterium + deuterium', equation: '²H + ²H → ³He + n / ³H + p', microscopeEquation: 'Shown branch: ²H + ²H → ⁴He* → ³He + n', threshold: 180, nuclei: { reactants: [{ isotope: '²H', protons: 1, neutrons: 1 }, { isotope: '²H', protons: 1, neutrons: 1 }], compound: { isotope: '⁴He*', protons: 2, neutrons: 2 }, products: [{ isotope: '³He', protons: 2, neutrons: 1 }, { isotope: 'n', protons: 0, neutrons: 1 }] }, note: 'Fuel is abundant, but ignition is much more difficult.', micro: ['Two deuterium nuclei collide.', 'Their four nucleons briefly occupy an excited compound configuration.', 'The displayed branch makes helium-3 and a neutron; another common branch makes tritium and a proton.'] },
  he3: { label: 'Deuterium + helium-3', equation: '²H + ³He → ⁴He + p + 18.3 MeV', microscopeEquation: '²H + ³He → ⁵Li* → ⁴He + p', threshold: 400, nuclei: { reactants: [{ isotope: '²H', protons: 1, neutrons: 1 }, { isotope: '³He', protons: 2, neutrons: 1 }], compound: { isotope: '⁵Li*', protons: 3, neutrons: 2 }, products: [{ isotope: '⁴He', protons: 2, neutrons: 2 }, { isotope: 'p', protons: 1, neutrons: 0 }] }, note: 'Mostly aneutronic, but helium-3 is scarce and needs hotter plasma.', micro: ['Deuterium and helium-3 nuclei approach.', 'A very short-lived excited lithium-5 compound state forms.', 'Helium-4 and a proton recoil with 18.3 MeV total energy.'] },
  pb: { label: 'Proton + boron-11', equation: 'p + ¹¹B → 3 ⁴He + 8.7 MeV', microscopeEquation: 'p + ¹¹B → ¹²C* → 3 ⁴He', threshold: 600, nuclei: { reactants: [{ isotope: 'p', protons: 1, neutrons: 0 }, { isotope: '¹¹B', protons: 5, neutrons: 6 }], compound: { isotope: '¹²C*', protons: 6, neutrons: 6 }, products: [{ isotope: '⁴He', protons: 2, neutrons: 2 }, { isotope: '⁴He', protons: 2, neutrons: 2 }, { isotope: '⁴He', protons: 2, neutrons: 2 }] }, note: 'Aneutronic in principle, with extremely demanding conditions.', micro: ['A proton penetrates the boron-11 electric barrier.', 'A short-lived excited carbon-12 nucleus forms.', 'It breaks into three helium-4 nuclei carrying 8.7 MeV.'] },
}

export default function FusionSimulator() {
  const [mode, setMode] = useState('space')
  return (
    <div>
      <ToolIntro eyebrow="Nuclei combine · mass becomes energy" title="Fusion Frontier" description="Choose a cosmic star lab or a hands-on tokamak. Both models use real fusion thresholds and conservation laws." accent="#b9f46e" />
      <div className="mode-switch" role="tablist">
        <button id="space-fusion-tab" role="tab" aria-selected={mode === 'space'} aria-controls="fusion-mode-panel" className={mode === 'space' ? 'active' : ''} onClick={() => setMode('space')}><Rocket size={19} /> Space observatory<span>Design a star</span></button>
        <button id="lab-fusion-tab" role="tab" aria-selected={mode === 'lab'} aria-controls="fusion-mode-panel" className={mode === 'lab' ? 'active' : ''} onClick={() => setMode('lab')}><FlaskConical size={19} /> Science lab<span>Operate a tokamak</span></button>
      </div>
      <div id="fusion-mode-panel" role="tabpanel" aria-labelledby={mode === 'space' ? 'space-fusion-tab' : 'lab-fusion-tab'}>{mode === 'space' ? <SpaceFusion /> : <LabFusion />}</div>
    </div>
  )
}

function SpaceFusion() {
  const initial = stellarArchetypeById[defaultStellarArchetype]
  const [archetype, setArchetype] = useState(defaultStellarArchetype)
  const [temperature, setTemperature] = useState(initial.coreTemperature)
  const [surfaceTemperature, setSurfaceTemperature] = useState(initial.surfaceTemperature)
  const [mass, setMass] = useState(initial.mass)
  const [luminosity, setLuminosity] = useState(initial.luminosity)
  const [running, setRunning] = useState(false)
  const [age, setAge] = useState(0)
  const [inside, setInside] = useState(false)
  const results = useMemo(() => {
    const baseProfile = archetype === 'custom'
      ? inferStellarArchetype({ mass, surfaceTemperature, luminosity })
      : stellarArchetypeById[archetype] || initial
    const evolvedProfile = running && age >= 4 && baseProfile.evolvesTo
      ? stellarArchetypeById[baseProfile.evolvesTo]
      : baseProfile
    const evolvedFromMainSequence = evolvedProfile.id !== baseProfile.id
    const currentCoreTemperature = evolvedFromMainSequence ? evolvedProfile.coreTemperature : temperature
    const currentSurfaceTemperature = evolvedFromMainSequence ? evolvedProfile.surfaceTemperature : surfaceTemperature
    const currentLuminosity = evolvedFromMainSequence ? evolvedProfile.luminosity : luminosity
    const fusionKey = evolvedProfile.fusionKey === 'triple-alpha' && currentCoreTemperature < 80 ? 'pp' : evolvedProfile.fusionKey
    const fusionLabel = evolvedFromMainSequence && evolvedProfile.id === 'red-giant' && fusionKey === 'pp'
      ? 'Hydrogen-shell fusion around a helium core'
      : evolvedProfile.fusionLabel
    const ignition = fusionKey !== 'none' && currentCoreTemperature >= 4 && mass >= .075
    const expectedLuminosity = mainSequenceLuminosity(mass)
    const radius = stellarRadiusSolar(currentLuminosity, currentSurfaceTemperature)
    const lifetime = Math.round(10000 * mass / Math.max(expectedLuminosity, 0.00001))
    return { baseProfile, displayProfile: evolvedProfile, ignition, expectedLuminosity, fusionKey, fusionLabel, lifetime, radius, currentCoreTemperature, currentSurfaceTemperature, currentLuminosity }
  }, [age, archetype, initial, luminosity, mass, running, surfaceTemperature, temperature])

  const start = () => { setRunning(true); setAge((value) => Math.min(4, value + 1)) }
  const evolved = running && age >= 4 && results.displayProfile.id !== results.baseProfile.id
  const stellarPhase = !running
    ? `${results.baseProfile.label} example ready`
    : !results.ignition
      ? results.displayProfile.phase
      : age === 1 ? results.displayProfile.phase
        : age === 2 ? `${results.displayProfile.label} energy transport stable`
          : age === 3 ? results.baseProfile.evolvesTo ? 'Core hydrogen becoming depleted' : `${results.displayProfile.label} remains long-lived`
            : results.displayProfile.phase
  const story = stellarParticleStory(results.fusionKey, results.displayProfile)
  const applyPreset = (id) => {
    setArchetype(id)
    if (id !== 'custom') {
      const preset = stellarArchetypeById[id]
      setTemperature(preset.coreTemperature)
      setSurfaceTemperature(preset.surfaceTemperature)
      setMass(preset.mass)
      setLuminosity(preset.luminosity)
    }
    setRunning(false)
    setAge(0)
    setInside(false)
  }
  const customize = (setter) => (value) => { setArchetype('custom'); setter(value) }
  useEffect(() => {
    window.render_game_to_text = () => JSON.stringify({
      simulation: 'stellar fusion',
      view: inside ? 'stellar core cutaway' : 'stellar surface',
      evolutionSnapshot: age,
      stellarPhase,
      stellarClass: results.displayProfile.label,
      spectralClass: results.displayProfile.spectral,
      massSolar: mass,
      luminositySolar: results.currentLuminosity,
      radiusSolar: Number(results.radius.toPrecision(4)),
      coreTemperatureMillionK: results.currentCoreTemperature,
      surfaceTemperatureK: results.currentSurfaceTemperature,
      ignition: running && results.ignition,
      pathway: results.fusionLabel,
      particleProcess: story.process,
      nuclearTransformation: story.nuclei ? { visualizedReaction: story.microscopeEquation, ...story.nuclei } : null,
      glowLayers: ['HDR photosphere', 'chromosphere limb', 'turbulent inner corona', 'extended outer corona', ...(results.displayProfile.wind > .35 ? ['stellar-wind shells'] : []), ...(results.displayProfile.jets ? ['rotation-powered polar beams'] : [])],
      renderer: rendererBackend('fusion-simulator'),
      electronModel: 'The hot stellar core is ionized plasma; bound atomic electron clouds are absent from the nucleus-scale event.',
    })
    window.advanceTime = (ms) => { if (running && ms >= 1000) setAge((value) => Math.min(4, value + 1)) }
    return () => { delete window.render_game_to_text; delete window.advanceTime }
  }, [age, inside, luminosity, mass, results, running, stellarPhase, story.process, surfaceTemperature, temperature])
  return (
    <div className="sim-layout">
      <section className="space-stage panel">
        <FusionScene intensity={Math.min(1.8, Math.max(.25, Math.log10(Math.max(results.currentLuminosity, .0001)) * .14 + .8))} stage={running && results.ignition ? 'stable' : 'ready'} stellarType={results.displayProfile.id} inside={inside} pathway={results.fusionKey} active={running && results.ignition} />
        <button className={`cutaway-toggle ${inside ? 'active' : ''}`} aria-pressed={inside} onClick={() => setInside((value) => !value)}><Eye size={17} /> {inside ? 'Return to stellar surface' : 'Look inside the star'}</button>
        {!inside && <><div className="planet-orbit orbit-inner"><span className={evolved || results.displayProfile.id.includes('supergiant') ? 'planet consumed' : 'planet'} /></div><div className="planet-orbit orbit-outer"><span className={results.displayProfile.id === 'red-supergiant' ? 'planet blue consumed' : 'planet blue'} /></div></>}
        <div className="space-readout"><span className={running ? 'live-dot' : 'ready-dot'} /> {running ? `Evolution snapshot ${age}/4 · ${stellarPhase}` : stellarPhase}</div>
      </section>
      <aside className="sim-controls panel">
        <div className="panel-heading"><span className="step-dot">★</span><div><p className="eyebrow">Initial conditions</p><h2>Design your star</h2></div></div>
        <label className="field-label stellar-archetype-picker">Stellar class example
          <select aria-label="Stellar class example" value={archetype} onChange={(event) => applyPreset(event.target.value)}>
            <option value="custom">Custom — infer from physical inputs</option>
            {[...new Set(stellarArchetypes.map((item) => item.group))].map((group) => <optgroup key={group} label={group}>{stellarArchetypes.filter((item) => item.group === group).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</optgroup>)}
          </select>
          <small>{results.baseProfile.spectral} · {results.baseProfile.fusionLabel}</small>
        </label>
        <Slider label="Core temperature" value={temperature} setValue={customize(setTemperature)} min={2} max={150} step={1} suffix=" million K" icon={<ThermometerSun />} />
        <LogSlider label="Surface temperature" value={surfaceTemperature} setValue={customize(setSurfaceTemperature)} min={1200} max={700000} formatter={(value) => `${Math.round(value).toLocaleString()} K`} icon={<Flame />} />
        <Slider label="Stellar mass" value={mass} setValue={customize(setMass)} min={0.01} max={60} step={0.01} suffix=" M☉" icon={<Orbit />} />
        <LogSlider label="Luminosity" value={luminosity} setValue={customize(setLuminosity)} min={.0001} max={1_000_000} formatter={(value) => `${formatLuminosity(value)} L☉`} icon={<Sparkles />} />
        <button className="primary-button full" onClick={start} disabled={running && age >= 4}>{!running ? 'Begin stellar evolution' : age >= 4 ? 'Final snapshot reached' : 'Advance stellar evolution'} <ChevronRight size={18} /></button>
        {running && <button className="quiet-button centered" onClick={() => { setRunning(false); setAge(0) }}><RotateCcw size={16} /> Reset observation</button>}
      </aside>
      {inside && (
        <ParticleStory title={story.title} equation={story.equation} microscopeEquation={story.microscopeEquation} active={running && results.ignition} steps={story.steps} />
      )}
      {running && (
        <section className={`simulation-results panel ${results.ignition ? 'success' : 'warning'}`}>
          <div className="result-symbol">{results.ignition ? <CheckCircle2 /> : <Activity />}</div>
          <div><p className="eyebrow">Stellar diagnosis</p><h2>{results.displayProfile.diagnosis}</h2><p>{results.displayProfile.description} {results.ignition ? `Modeled fusion regime: ${results.fusionLabel}.` : 'The scene therefore shows thermal or magnetospheric emission without pretending that steady fusion is occurring.'}</p></div>
          <div className="result-stats">
            <span>{evolved ? 'Current luminosity' : results.baseProfile.group === 'Main sequence dwarfs' ? 'Mass–luminosity estimate' : 'Selected luminosity'}<strong>{formatLuminosity(evolved ? results.currentLuminosity : results.baseProfile.group === 'Main sequence dwarfs' ? results.expectedLuminosity : results.currentLuminosity)} L☉</strong></span>
            <span>{results.baseProfile.group === 'Main sequence dwarfs' ? 'Main-sequence lifetime' : 'Spectral / luminosity class'}<strong>{results.baseProfile.group === 'Main sequence dwarfs' ? formatLifetime(results.lifetime) : results.displayProfile.spectral}</strong></span>
            <span>Surface / derived radius<strong>{results.currentSurfaceTemperature.toLocaleString()} K · {formatRadius(results.radius)} R☉</strong></span>
            <span>Fusion regime<strong>{results.fusionLabel}</strong></span>
          </div>
        </section>
      )}
    </div>
  )
}

function Slider({ label, value, setValue, min, max, step, suffix, icon }) {
  return (
    <label className="sim-slider">
      <span>{icon}{label}<strong>{value}{suffix}</strong></span>
      <input type="range" value={value} onChange={(event) => setValue(Number(event.target.value))} min={min} max={max} step={step} />
      <small><span>{min}</span><span>{max}</span></small>
    </label>
  )
}

function LogSlider({ label, value, setValue, min, max, formatter, icon }) {
  const logMin = Math.log10(min)
  const logMax = Math.log10(max)
  return (
    <label className="sim-slider">
      <span>{icon}{label}<strong>{formatter(value)}</strong></span>
      <input type="range" value={Math.log10(value)} onChange={(event) => setValue(10 ** Number(event.target.value))} min={logMin} max={logMax} step="0.01" />
      <small><span>{formatter(min)}</span><span>{formatter(max)}</span></small>
    </label>
  )
}

function stellarParticleStory(pathway, profile) {
  if (pathway === 'triple-alpha') return {
    title: 'Triple-alpha helium-fusion core', equation: '3 ⁴He → ¹²C + γ + 7.27 MeV',
    microscopeEquation: '⁸Be + ⁴He → ¹²C* → ¹²C + γ',
    process: 'Three helium-4 nuclei form carbon-12 through a short-lived beryllium-8 intermediate; gamma energy and kinetic energy leave the event.',
    steps: ['Two helium-4 nuclei briefly form unstable beryllium-8.', 'Before it decays, a third helium nucleus is captured near the Hoyle-state resonance.', 'Carbon-12 settles to a lower state and releases gamma energy.'],
    nuclei: { reactants: [{ isotope: '⁸Be', protons: 4, neutrons: 4 }, { isotope: '⁴He', protons: 2, neutrons: 2 }], compound: { isotope: '¹²C*', protons: 6, neutrons: 6 }, products: [{ isotope: '¹²C', protons: 6, neutrons: 6 }, { isotope: 'γ', protons: 0, neutrons: 0 }] },
  }
  if (pathway === 'cno') return {
    title: 'CNO-cycle core cutaway', equation: '4 ¹H → ⁴He + 2 e⁺ + 2 νₑ + energy',
    microscopeEquation: 'Cycle step 1 of 6: ¹²C + p → ¹³N* → ¹³N + γ',
    process: 'Four hydrogen nuclei become helium-4 while carbon, nitrogen, and oxygen nuclei catalyze the cycle and are regenerated.',
    steps: ['C, N, and O nuclei capture protons in a six-reaction catalytic loop.', 'Two weak decays release positrons and electron neutrinos.', 'Helium-4 leaves and the original carbon-12 catalyst returns.'],
    nuclei: { reactants: [{ isotope: '¹²C', protons: 6, neutrons: 6 }, { isotope: 'p', protons: 1, neutrons: 0 }], compound: { isotope: '¹³N*', protons: 7, neutrons: 6 }, products: [{ isotope: '¹³N', protons: 7, neutrons: 6 }, { isotope: 'γ', protons: 0, neutrons: 0 }] },
  }
  if (pathway === 'none') return {
    title: `${profile.label} interior`, equation: 'No sustained fusion reaction',
    microscopeEquation: null,
    process: profile.fusionLabel,
    steps: ['The compact object or substellar body retains heat from formation or collapse.', 'Gravity and quantum or material pressure determine its structure.', 'Any visible or beamed emission is not powered by steady core fusion.'],
    nuclei: null,
  }
  return {
    title: 'Proton–proton chain core cutaway', equation: '4 ¹H → ⁴He + 2 e⁺ + 2 νₑ + energy',
    microscopeEquation: 'Final pp-I step: ³He + ³He → ⁶Be* → ⁴He + 2p',
    process: 'Net proton-proton chain: four hydrogen nuclei become helium-4, two positrons, two electron neutrinos, photons, and kinetic energy.',
    steps: ['Two protons begin the chain; a weak interaction changes one proton into a neutron.', 'Deuterium captures another proton, making helium-3 and a gamma ray.', 'Two helium-3 nuclei ultimately make helium-4 and return two protons.'],
    nuclei: { reactants: [{ isotope: '³He', protons: 2, neutrons: 1 }, { isotope: '³He', protons: 2, neutrons: 1 }], compound: { isotope: '⁶Be*', protons: 4, neutrons: 2 }, products: [{ isotope: '⁴He', protons: 2, neutrons: 2 }, { isotope: 'p', protons: 1, neutrons: 0 }, { isotope: 'p', protons: 1, neutrons: 0 }] },
  }
}

function LabFusion() {
  const [fuel, setFuel] = useState('dt')
  const [step, setStep] = useState(0)
  const [temperature, setTemperature] = useState(100)
  const [confinement, setConfinement] = useState('magnetic')
  const [density, setDensity] = useState('high')
  const [inside, setInside] = useState(false)
  const fuelInfo = labFuels[fuel]
  const lawsonMargin = (temperature / fuelInfo.threshold) * (confinement === 'magnetic' ? 1 : .08) * (density === 'high' ? 1.12 : .32)
  const ignition = lawsonMargin >= 1

  const stages = [
    { title: 'Choose the fuel', text: fuelInfo.note, icon: <CircleGauge /> },
    { title: 'Ionize into plasma', text: `Heat the fuel until electrons separate. ${fuelInfo.label} needs about ${fuelInfo.threshold} million K in this model.`, icon: <Flame /> },
    { title: 'Confine the plasma', text: 'A tokamak uses magnetic fields to keep hot plasma away from material walls.', icon: <Orbit /> },
    { title: 'Test the triple product', text: 'Fusion needs enough temperature, particle density, and confinement time at once.', icon: <Activity /> },
    { title: ignition ? 'Fusion pulse achieved' : 'Pulse fell below threshold', text: ignition ? `${fuelInfo.equation}. The simplified Lawson margin is ${lawsonMargin.toFixed(2)}× threshold; that does not by itself mean net electric power.` : `The simplified Lawson margin is ${lawsonMargin.toFixed(2)}×. Temperature, density, and confinement must exceed the threshold together.`, icon: ignition ? <CheckCircle2 /> : <RotateCcw /> },
  ]

  useEffect(() => {
    window.render_game_to_text = () => JSON.stringify({
      simulation: 'laboratory fusion',
      view: inside ? 'single nuclear collision' : 'tokamak chamber',
      fuel: fuelInfo.label,
      workflowStep: step,
      status: stages[step].title,
      temperatureMillionK: temperature,
      lawsonMargin: Number(lawsonMargin.toFixed(2)),
      particleEquation: fuelInfo.equation,
      interactionSteps: fuelInfo.micro,
      nuclearTransformation: { visualizedReaction: fuelInfo.microscopeEquation, ...fuelInfo.nuclei },
      renderer: rendererBackend('fusion-simulator'),
      electronModel: 'Tokamak fuel is ionized plasma; free electrons are part of the plasma, while the collision microscope follows nuclei.',
    })
    window.advanceTime = () => {}
    return () => { delete window.render_game_to_text; delete window.advanceTime }
  }, [inside, fuelInfo, step, temperature, lawsonMargin, stages])

  return (
    <div className="sim-layout lab-layout">
      <section className="space-stage panel"><FusionScene lab intensity={Math.max(.25, lawsonMargin)} stage={step >= 4 && ignition ? 'ignition' : step >= 1 ? 'stable' : 'ready'} inside={inside} fuel={fuel} active={step >= 4 && ignition} /><button className={`cutaway-toggle ${inside ? 'active' : ''}`} aria-pressed={inside} onClick={() => setInside((value) => !value)}><Atom size={17} /> {inside ? 'Return to tokamak' : 'Watch one collision'}</button><div className="space-readout"><span className={step >= 4 && ignition ? 'live-dot' : 'ready-dot'} /> {inside ? 'Nuclear interaction microscope' : 'Tokamak chamber'} · {stages[step].title}</div></section>
      <aside className="sim-controls panel">
        <div className="panel-heading"><span className="step-dot">{step + 1}</span><div><p className="eyebrow">Scientist workflow</p><h2>{stages[step].title}</h2></div></div>
        <p className="stage-description">{stages[step].text}</p>
        {step === 0 && <label className="field-label">Fusion fuel<select value={fuel} onChange={(event) => setFuel(event.target.value)}>{Object.entries(labFuels).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></label>}
        {step === 1 && <Slider label="Plasma temperature" value={temperature} setValue={setTemperature} min={40} max={700} step={10} suffix=" million K" icon={<ThermometerSun />} />}
        {step === 2 && <div className="choice-cards"><button className={confinement === 'magnetic' ? 'active' : ''} onClick={() => setConfinement('magnetic')}>Magnetic confinement<span>Tokamak coils hold plasma</span></button><button className={confinement === 'walls' ? 'active danger' : ''} onClick={() => setConfinement('walls')}>Material walls<span>Plasma cools on contact</span></button></div>}
        {step === 3 && <div className="choice-cards"><button className={density === 'high' ? 'active' : ''} onClick={() => setDensity('high')}>Raise particle density<span>More collision chances</span></button><button className={density === 'low' ? 'active' : ''} onClick={() => setDensity('low')}>Keep density low<span>Too few collisions</span></button></div>}
        {step < 4 ? <button className="primary-button full" onClick={() => setStep(step + 1)}>Complete step <ChevronRight size={18} /></button> : <button className="primary-button full" onClick={() => setStep(ignition ? 0 : 1)}>{ignition ? 'Run another experiment' : 'Adjust conditions'} <RotateCcw size={17} /></button>}
      </aside>
      {inside && <ParticleStory title={`${fuelInfo.label} collision`} equation={fuelInfo.equation} microscopeEquation={fuelInfo.microscopeEquation} active={step >= 4 && ignition} steps={fuelInfo.micro} />}
      <section className="workflow-strip panel">
        {stages.slice(0, 5).map((stageItem, index) => <div key={stageItem.title} className={index < step ? 'done' : index === step ? 'active' : ''}><span>{index < step ? <CheckCircle2 /> : stageItem.icon}</span><p>{stageItem.title}</p></div>)}
      </section>
    </div>
  )
}

function ParticleStory({ title, equation, microscopeEquation, active, steps }) {
  return (
    <section className="particle-story panel">
      <div className="particle-story-heading"><Atom /><div><p className="eyebrow">Nucleus-scale interaction</p><h2>{title}</h2><p className="particle-equation">{equation}</p></div><span className={active ? 'interaction-live' : 'interaction-paused'}>{active ? 'Repeating collision' : 'Paused until threshold'}</span></div>
      {microscopeEquation && <div className="microscope-equation"><span>Visible microscope step</span><strong>{microscopeEquation}</strong></div>}
      <div className="interaction-story-steps">{steps.map((step,index) => <span key={step}><b>{index + 1}</b><strong>{index === 0 ? 'Approach' : index === 1 ? 'Transform' : 'Products'}</strong><small>{step}</small></span>)}</div>
      <div className="particle-key"><span><i className="proton-dot" /> proton</span><span><i className="neutron-dot" /> neutron</span><span><i className="energy-dot" /> emitted energy/particle</span><small>nuclei enlarged enormously; timing slowed</small></div>
      <p className="model-caveat">The repeating motion visualizes one selected nuclear step from the named pathway. At these temperatures the fuel is ionized, so bound electron clouds are absent; the microscope follows nuclei while free plasma electrons are omitted. Reaction likelihoods and timescales are compressed.</p>
    </section>
  )
}

function formatLuminosity(value) {
  if (value < .001) return value.toExponential(2)
  if (value < .1) return value.toFixed(3)
  if (value < 1000) return value.toFixed(1)
  return value.toExponential(2)
}

function formatLifetime(millionYears) {
  if (millionYears >= 1_000_000) return `${(millionYears / 1_000_000).toFixed(1)} trillion yr`
  if (millionYears >= 1_000) return `${(millionYears / 1_000).toFixed(1)} billion yr`
  return `${millionYears} million yr`
}

function formatRadius(value) {
  if (value < .001) return value.toExponential(2)
  if (value < .1) return value.toFixed(3)
  if (value < 10) return value.toFixed(2)
  return Math.round(value).toLocaleString()
}
