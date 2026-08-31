import { ArrowRight, Atom, CheckCircle2, Droplets, Flame, FlaskConical, Grip, Info, RotateCcw, Sparkles, ThermometerSun, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ReactionParticleScene, particleEventFor } from '../components/ParticleInteractionScenes'
import { SubstanceScene } from '../components/SubstanceScene'
import { elements } from '../data/elements'
import { compounds, findReaction, reactions, reactionPartners } from '../data/chemistry'
import { displayFormula } from '../data/reactionCatalog'
import { ToolIntro } from './PeriodicTable'
import { rendererBackend } from '../components/ScientificCanvas.jsx'

const reactiveSymbols = [...new Set(reactions.flatMap((reaction) => reaction.pair))]

export default function ReactionsLab() {
  const [first, setFirst] = useState(null)
  const [second, setSecond] = useState(null)
  const [samples, setSamples] = useState([])
  const [phase, setPhase] = useState('setup')
  const [particleView, setParticleView] = useState(true)
  const reaction = first && second ? findReaction(first, second) : null
  const partners = first ? reactionPartners(first) : []
  const productCompound = useMemo(() => {
    if (!reaction) return null
    return compounds.find((compound) => compound.formula === reaction.formula) || {
      id: `reaction-${reaction.formula}`,
      name: reaction.product,
      formula: reaction.formula,
      state: reaction.productState === 'vapor' ? 'gas' : reaction.productState,
      fact: reaction.effect,
    }
  }, [reaction])

  useEffect(() => {
    if (!reaction || !reaction.pair.every((symbol) => samples.includes(symbol))) return undefined
    setPhase('mixing')
    const timer = window.setTimeout(() => setPhase('product'), 1300)
    return () => window.clearTimeout(timer)
  }, [reaction, samples])

  useEffect(() => {
    window.render_game_to_text = () => JSON.stringify({
      simulation: 'reaction',
      selectedReactants: [first, second].filter(Boolean),
      loadedSamples: samples,
      phase,
      view: phase === 'product' ? particleView ? 'atom interaction' : 'bulk product' : 'reaction chamber',
      balancedEquation: reaction?.equation || null,
      particleEvent: reaction ? particleEventFor(reaction) : null,
      product: reaction ? { name: reaction.product, formula: reaction.formula, state: reaction.productState } : null,
      renderer: phase === 'product' ? rendererBackend(particleView ? 'reaction-particle-simulator' : 'substance-simulator') : null,
      electronModel: particleView && phase === 'product' ? 'Translucent TSL density layers show occupied atom and shared-bond regions; they are not electron trajectories.' : null,
    })
    window.advanceTime = (ms) => {
      if (ms >= 1300 && reaction?.pair.every((symbol) => samples.includes(symbol))) setPhase('product')
    }
    return () => {
      delete window.render_game_to_text
      delete window.advanceTime
    }
  }, [first, second, samples, phase, particleView, reaction])

  const choose = (symbol) => {
    if (!first || (first && second)) {
      setFirst(symbol)
      setSecond(null)
      setSamples([])
      setPhase('setup')
      setParticleView(true)
    } else if (symbol !== first && partners.includes(symbol)) {
      setSecond(symbol)
      setSamples([])
      setPhase('setup')
    }
  }

  const addSample = (symbol) => {
    if (!reaction || !reaction.pair.includes(symbol)) return
    setSamples((current) => current.includes(symbol) ? current : [...current, symbol])
  }

  const reset = () => { setFirst(null); setSecond(null); setSamples([]); setPhase('setup'); setParticleView(true) }

  return (
    <div>
      <ToolIntro eyebrow={`${reactions.length} balanced scenarios · conservation of atoms`} title="Reaction Lab" description="Pick an element, discover its supported partners, and combine measured samples to see what forms under the stated conditions." accent="#ff9f8f" />
      <section className="reaction-picker panel">
        <div className="reaction-picker-heading"><div><p className="eyebrow">Step 1 · Select reactants</p><h2>{!first ? 'Choose a starting element' : !second ? `What should react with ${first}?` : `${first} + ${second} selected`}</h2></div>{first && <button className="quiet-button" onClick={reset}><RotateCcw size={16} /> Start over</button>}</div>
        <div className="reaction-elements">
          {reactiveSymbols.map((symbol) => {
            const element = elements.find((item) => item.symbol === symbol)
            const highlighted = !first || partners.includes(symbol) || symbol === first || symbol === second
            return <button key={symbol} className={`${symbol === first || symbol === second ? 'selected' : ''} ${!highlighted ? 'dimmed' : ''} ${first && partners.includes(symbol) ? 'partner' : ''}`} onClick={() => choose(symbol)} disabled={Boolean(first && !second && !partners.includes(symbol) && symbol !== first)}><span>{element.number}</span><strong>{symbol}</strong><small>{element.name}</small>{first && partners.includes(symbol) && <i>reacts</i>}</button>
          })}
        </div>
        {first && !second && <p className="highlight-key"><Sparkles size={16} /> Highlighted tiles are common, instructionally useful reaction partners in this lab.</p>}
      </section>

      {reaction && (
        <>
          <section className="equation-panel panel">
            <div className="equation-icon"><FlaskConical /></div>
            <div><p className="eyebrow">Balanced chemical equation</p><h2>{reaction.equation}</h2><p>{reaction.type} · Required particle ratio: {reaction.ratio} · {reaction.condition}</p><small className="simulation-safety">Simulation only: {reaction.safety}</small></div>
            <div className="conservation-badge"><CheckCircle2 /> Atoms balanced</div>
          </section>
          <div className="reaction-workbench">
            <aside className="reagent-shelf panel">
              <p className="eyebrow">Step 2 · Add measured samples</p><h2>Reactants</h2>
              {reaction.pair.map((symbol, index) => {
                const element = elements.find((item) => item.symbol === symbol)
                const species = reaction.reactants.find((item) => Object.keys(parseSimpleFormula(item.formula)).length === 1 && Object.keys(parseSimpleFormula(item.formula))[0] === symbol)
                return <button key={symbol} draggable onDragStart={(event) => event.dataTransfer.setData('text/reagent', symbol)} onClick={() => addSample(symbol)} className={samples.includes(symbol) ? 'reagent added' : 'reagent'}><span className="sample-vial" style={{ '--sample-color': index ? '#ff9f8f' : '#91d7ff' }} /><div><strong>{element.name}</strong><p>{species ? `${displayFormula(species.formula)}(${species.state}) · coefficient ${species.coefficient}` : `${symbol} sample`}</p></div><Grip /></button>
              })}
              <p className="drag-tip"><Grip size={15} /> Drag both samples to the chamber, or tap each vial.</p>
            </aside>

            <section className={`reaction-chamber panel ${phase}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addSample(event.dataTransfer.getData('text/reagent')) }}>
              <div className="chamber-heading"><div><p className="eyebrow">Reaction chamber</p><h2>{phase === 'setup' ? `${samples.length}/2 samples loaded` : phase === 'mixing' ? 'Reaction in progress…' : particleView ? 'Watch the atoms rearrange' : `${reaction.product} formed`}</h2></div><div className="chamber-actions">{phase === 'product' && <button className={`view-toggle ${particleView ? 'active' : ''}`} onClick={() => setParticleView((value) => !value)}><Atom size={16} /> {particleView ? 'Show bulk product' : 'Show atom interaction'}</button>}<span className="safety-chip"><Info size={15} /> Shield closed</span></div></div>
              {phase !== 'product' ? (
                <div className="beaker-scene">
                  <div className={`beaker ${phase}`}><div className="beaker-liquid" />{samples.map((symbol, index) => <span key={symbol} className={`sample-drop drop-${index}`}>{symbol}</span>)}{phase === 'mixing' && <><i className="reaction-spark s1" /><i className="reaction-spark s2" /><i className="reaction-spark s3" /></>}</div>
                  <div className="chamber-instructions">{!samples.length ? <><Droplets /> Drop two measured samples into the vessel</> : samples.length === 1 ? <><ArrowRight /> Add the reaction partner</> : <><Zap /> Bonds are rearranging; atoms are conserved</>}</div>
                </div>
              ) : productCompound && (particleView ? <ReactionParticleScene reaction={reaction} /> : <SubstanceScene compound={productCompound} reaction={reaction} />)}
            </section>

            <aside className="reaction-observations panel">
              <p className="eyebrow">Live observations</p><h2>{phase === 'product' ? 'Products' : 'Sensors'}</h2>
              <div className="sensor-list">
                <div><ThermometerSun /><span>Energy<strong>{phase === 'product' ? energyLabel(reaction) : 'Awaiting reaction'}</strong></span></div>
                <div><Flame /><span>Visible change<strong>{phase === 'product' ? reaction.effect.split('.')[0] : 'None yet'}</strong></span></div>
              </div>
              {phase === 'product' && <div className="product-card"><span>Recovered product</span><strong>{reaction.product}</strong><p>{reaction.formula}</p><small>{reaction.appearance}</small></div>}
            </aside>
          </div>
          {phase === 'product' && particleView && (
            <section className="atom-interaction-story panel">
              <div><Atom /><p className="eyebrow">Inside one balanced reaction event</p><h2>Atoms persist while their bonds and neighbors change</h2></div>
              <div className="interaction-story-steps">
                <span><b>1</b><strong>Approach</strong><small>Reactant particles collide with the required stoichiometric ratio.</small></span>
                <span><b>2</b><strong>Rearrange</strong><small>Old bonds weaken or electrons transfer while energy moves into or out of the surroundings.</small></span>
                <span><b>3</b><strong>Separate</strong><small>The same atoms leave in new product groupings: {reaction.formula}.</small></span>
              </div>
              <p className="model-caveat">The animation compresses many quantum collisions into one visible cycle; the balanced atom count and product identity are preserved.</p>
            </section>
          )}
          {phase === 'product' && (
            <section className="reaction-outcome panel">
              <div className="outcome-intro"><Sparkles /><div><p className="eyebrow">Material ledger after reaction</p><h2>Products, yield, and matter remaining</h2><p>{reaction.effect} The visual shows the product’s bulk phase, not one isolated formula unit.</p></div></div>
              <div className="outcome-grid">
                <div><span>Product phase</span><strong>{reaction.productState}</strong><p>{reaction.appearance}</p></div>
                <div><span>Modeled yield</span><strong>{reaction.yield}</strong><p>Actual yield depends on temperature, mixing, purity, and equilibrium.</p></div>
                <div><span>Reactants remaining</span><strong>{reaction.leftovers}</strong><p>Matter is conserved even when reactants remain or surfaces stop reacting.</p></div>
              </div>
              <div className="outcome-footer"><p><CheckCircle2 /> Balanced coefficients account for every atom in the ideal reaction event.</p><button className="primary-button" onClick={() => { setSamples([]); setPhase('setup') }}>Run it again <RotateCcw size={16} /></button></div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function parseSimpleFormula(formula) {
  return Object.fromEntries((formula.match(/[A-Z][a-z]?/g) || []).map((symbol) => [symbol, true]))
}

function energyLabel(reaction) {
  if (reaction.thermalEffect === 'endothermic') return 'Energy absorbed from high-temperature surroundings'
  if (reaction.type === 'Combustion') return 'Strongly exothermic'
  if (reaction.type === 'Haber process') return 'Exothermic equilibrium'
  return 'Chemical energy released'
}
