import { Atom, Check, ChevronRight, Clock3, FlaskConical, Gamepad2, Grip, Lightbulb, Link2, Minus, RotateCcw, Search, Shuffle, Sparkles, Trophy, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ProductModelScene } from '../components/ProductModelScene'
import { SubstanceScene } from '../components/SubstanceScene'
import { compounds, compoundByComposition, compositionKey, parseFormula } from '../data/chemistry'
import { elements } from '../data/elements'
import { questCurriculum } from '../data/questCurriculum'
import { ToolIntro } from './PeriodicTable'
import { rendererBackend } from '../components/ScientificCanvas.jsx'

const questPool = questCurriculum

export default function ElementLink() {
  const [mode, setMode] = useState('quest')
  const [questIndex, setQuestIndex] = useState(() => randomQuestIndex())
  const [composition, setComposition] = useState({})
  const [elapsed, setElapsed] = useState(0)
  const [message, setMessage] = useState(null)
  const [result, setResult] = useState(null)
  const [hintRevealed, setHintRevealed] = useState(false)
  const [search, setSearch] = useState('')
  const [completedQuests, setCompletedQuests] = useState(() => new Set())
  const [productView, setProductView] = useState('substance')
  const target = questPool[questIndex % questPool.length]
  const targetComposition = useMemo(() => parseFormula(target.formula), [target])
  const currentCompound = compoundByComposition[compositionKey(composition)]
  const atomCount = Object.values(composition).reduce((sum, count) => sum + count, 0)

  useEffect(() => {
    if (mode !== 'quest' || result) return undefined
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [mode, result, questIndex])

  useEffect(() => {
    window.advanceTime = (ms) => {
      const safeMilliseconds = Math.max(0, ms)
      setElapsed((value) => value + Math.round(safeMilliseconds / 1000))
    }
    window.render_game_to_text = () => JSON.stringify({
      coordinateSystem: 'Builder canvas origin is top-left; x increases right and y increases down.',
      mode,
      quest: mode === 'quest' ? { assignment: 'random', assignmentId: target.id, targetName: target.name, targetFormula: hintRevealed ? target.formula : null, formulaRevealed: hintRevealed, poolSize: questPool.length, hintAvailable: elapsed >= 30, elapsedSeconds: elapsed, completedQuestCount: completedQuests.size } : null,
      workspace: composition,
      atomCount,
      identifiedCompound: currentCompound?.name || null,
      productView: result ? productView : null,
      result: result ? { name: result.name, formula: result.formula, state: result.state, view: productView } : null,
      renderer: result ? rendererBackend(productView === 'substance' ? 'substance-simulator' : 'element-link-product') : null,
      message,
    })
    return () => {
      delete window.advanceTime
      delete window.render_game_to_text
    }
  }, [atomCount, completedQuests, composition, currentCompound, elapsed, hintRevealed, message, mode, productView, questIndex, result, target])

  const resetWorkspace = useCallback(() => {
    setComposition({})
    setMessage(null)
    setResult(null)
    setProductView('substance')
  }, [])

  const switchMode = (newMode) => {
    setMode(newMode)
    setElapsed(0)
    setHintRevealed(false)
    resetWorkspace()
  }

  const addAtom = (symbol) => {
    if (atomCount >= 30) {
      setMessage({ type: 'warning', text: 'This workspace holds 30 atoms at a time. Remove one before adding another.' })
      return
    }
    setComposition((current) => ({ ...current, [symbol]: (current[symbol] || 0) + 1 }))
    setMessage(null)
    setResult(null)
  }

  const removeAtom = (symbol) => {
    setComposition((current) => {
      const next = { ...current, [symbol]: Math.max(0, (current[symbol] || 0) - 1) }
      if (!next[symbol]) delete next[symbol]
      return next
    })
    setMessage(null)
    setResult(null)
  }

  const submit = () => {
    if (!atomCount) {
      setMessage({ type: 'warning', text: 'Add at least one atom to the workspace first.' })
      return
    }
    if (mode === 'quest') {
      if (compositionKey(composition) === compositionKey(targetComposition)) {
        setProductView('substance')
        setResult(target)
        setCompletedQuests((current) => new Set([...current, target.id]))
        setMessage({ type: 'success', text: `Composition solved in ${elapsed} seconds. The atom ratio is correct and every atom is conserved.` })
      } else {
        const targetTotal = Object.values(targetComposition).reduce((sum, count) => sum + count, 0)
        setMessage({ type: 'error', text: atomCount < targetTotal ? 'You need more atoms. Compare the kinds and counts in your structure.' : 'The atom count or element mix is not quite right yet.' })
      }
    } else if (currentCompound) {
      setProductView('substance')
      setResult(currentCompound)
      setMessage({ type: 'success', text: `${currentCompound.name} is in the substance library. The bulk sample below reflects its real physical state.` })
    } else {
      setMessage({ type: 'warning', text: 'No supported stable substance matches this atom count. The atoms may need different proportions—or conditions not modeled here.' })
    }
  }

  const nextQuest = () => {
    setQuestIndex((currentIndex) => randomQuestIndex(currentIndex, completedQuests))
    setElapsed(0)
    setHintRevealed(false)
    resetWorkspace()
  }

  const paletteElements = elements.filter((element) => `${element.name} ${element.symbol}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <ToolIntro eyebrow={`${questPool.length} randomized curriculum quests · ${compounds.length} supported formulas`} title="Element Link" description="Receive a random formula challenge, then compare the product’s real bulk appearance with an interactive particle-structure model." accent="#ffde69" />
      <div className="mode-switch game-mode" role="tablist">
        <button id="quest-mode-tab" role="tab" aria-selected={mode === 'quest'} aria-controls="element-link-workspace" className={mode === 'quest' ? 'active' : ''} onClick={() => switchMode('quest')}><Trophy size={19} /> Quest mode<span>Receive a random target</span></button>
        <button id="free-mode-tab" role="tab" aria-selected={mode === 'free'} aria-controls="element-link-workspace" className={mode === 'free' ? 'active' : ''} onClick={() => switchMode('free')}><Gamepad2 size={19} /> Free play<span>Combine anything</span></button>
      </div>

      <div id="element-link-workspace" role="tabpanel" aria-labelledby={mode === 'quest' ? 'quest-mode-tab' : 'free-mode-tab'}>
      {mode === 'quest' ? (
        <section className="quest-brief panel">
          <div className="quest-number random-assignment"><Shuffle size={18} /> Random quest</div>
          <div><p className="eyebrow">Random assignment · {target.gradeBand} · {target.difficulty} · {target.strand}</p><h2>Build {target.name}</h2><p>{target.learningObjective}</p><div className="quest-success-criteria"><strong>Success:</strong> {target.successCriteria} <span>{completedQuests.size}/{questPool.length} completed this session.</span></div>{hintRevealed && <div className="quest-formula-unlocked"><Lightbulb size={14} /> Formula unlocked: <strong>{target.formula}</strong></div>}</div>
          <div className="quest-actions">
            <span className={elapsed >= 30 ? 'timer ready' : 'timer'}><Clock3 size={18} /> {formatTime(elapsed)}</span>
            <button disabled={elapsed < 30 || hintRevealed} onClick={() => { setHintRevealed(true); setMessage({ type: 'hint', text: `Formula hint: ${target.formula}. Subscripts tell you how many atoms to add.` }) }}><Lightbulb size={17} /> {hintRevealed ? 'Formula shown' : elapsed >= 30 ? 'Show formula hint' : `Hint in ${30 - elapsed}s`}</button>
          </div>
        </section>
      ) : (
        <section className="quest-brief free-brief panel"><div className="quest-number"><Sparkles size={20} /></div><div><p className="eyebrow">Open formula bench</p><h2>Follow your curiosity</h2><p>Any atom mix is allowed. We’ll identify its elemental composition if it matches one of {compounds.length} supported substances; this tool does not distinguish structural isomers.</p></div></section>
      )}

      <div className="builder-layout">
        <aside className="element-palette panel">
          <div className="palette-heading"><div><p className="eyebrow">Periodic palette</p><h2>Choose atoms</h2></div><Grip size={20} /></div>
          <label className="search-box compact"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find element" /></label>
          <div className="mini-element-grid">
            {paletteElements.map((element) => (
              <button
                key={element.number}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('text/element', element.symbol)}
                onClick={() => addAtom(element.symbol)}
                title={`Drag or click to add ${element.name}`}
              ><span>{element.number}</span><strong>{element.symbol}</strong><small>{element.name}</small></button>
            ))}
          </div>
        </aside>

        <section className="builder-workspace panel" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addAtom(event.dataTransfer.getData('text/element')) }}>
          <div className="workspace-heading"><div><p className="eyebrow">Formula composition workspace</p><h2>{atomCount ? `${atomCount} atom${atomCount === 1 ? '' : 's'} assembled` : 'Drop atoms here'}</h2></div>{atomCount > 0 && <button className="quiet-button" onClick={resetWorkspace}><RotateCcw size={16} /> Clear</button>}</div>
          <BuilderCanvas composition={composition} formula={currentCompound?.formula} />
          <p className="builder-model-note">Guide lines organize the atom count; they are not a validated 2D bond diagram. The revealed view models the substance’s bulk state.</p>
          <div className="composition-tray">
            {Object.entries(composition).map(([symbol, count]) => (
              <div className="composition-token" key={symbol}><strong>{symbol}</strong><span>× {count}</span><button onClick={() => removeAtom(symbol)} aria-label={`Remove one ${symbol}`}><Minus size={14} /></button></div>
            ))}
            {!atomCount && <p><Link2 size={18} /> Drag an element tile here, or click one to add it.</p>}
          </div>
          {message && <div className={`game-message ${message.type}`} role="status" aria-live="polite">{message.type === 'success' ? <Check /> : message.type === 'hint' ? <Lightbulb /> : <FlaskConical />}<span>{message.text}</span><button onClick={() => setMessage(null)} aria-label="Dismiss message"><X size={16} /></button></div>}
          <button id="submit-molecule" className="primary-button full" onClick={submit}>{mode === 'quest' ? 'Submit structure' : 'Analyze combination'} <ChevronRight size={18} /></button>
        </section>

        <aside className="bond-guide panel">
          <p className="eyebrow">Live structure readout</p>
          <h2>{currentCompound?.formula || formulaFromComposition(composition) || '—'}</h2>
          <p>{currentCompound ? currentCompound.name : atomCount ? 'Unidentified composition' : 'Add atoms to begin'}</p>
          <div className="bond-properties">
            {Object.entries(composition).map(([symbol]) => {
              const element = elements.find((item) => item.symbol === symbol)
              return <div key={symbol}><span>{symbol}</span><p>{element?.electronegativity ? `Electron pull ${element.electronegativity}` : element?.category.replace('-', ' ')}</p></div>
            })}
          </div>
          <div className="legend-note"><span>δ−</span> A larger electronegativity means a stronger pull on shared electrons, which can create polar bonds.</div>
        </aside>
      </div>

      {result && (
        <section className="substance-reveal panel">
          <div className="reveal-copy"><div className="success-chip"><Check size={16} /> Composition confirmed</div><p className="eyebrow">From symbols to a material and particle model</p><h2>{result.name} <span>{result.formula}</span></h2><p>{result.fact}</p><div className="product-view-controls" role="group" aria-label="Choose product simulation view"><button type="button" data-product-view="substance" className={productView === 'substance' ? 'active' : ''} aria-pressed={productView === 'substance'} onClick={() => setProductView('substance')}><FlaskConical size={17} /><span><strong>Real substance</strong><small>Bulk state and appearance</small></span></button><button type="button" data-product-view="model" className={productView === 'model' ? 'active' : ''} aria-pressed={productView === 'model'} onClick={() => setProductView('model')}><Atom size={18} /><span><strong>Ball &amp; stick</strong><small>Particle structure</small></span></button></div><div className="substance-stats"><span>State near room conditions<strong>{result.state}</strong></span><span>Listed formula composition<strong>{result.formula}</strong></span><span>Simulation view<strong>{productView === 'model' ? 'particle structure' : result.state === 'gas' ? 'moving molecules' : result.state === 'liquid' ? 'condensed sample' : 'repeating solid'}</strong></span></div>{mode === 'quest' && <button className="primary-button" onClick={nextQuest}>Next random quest <ChevronRight size={18} /></button>}</div>
          {productView === 'substance' ? <SubstanceScene compound={result} /> : <ProductModelScene compound={result} />}
        </section>
      )}
      </div>
    </div>
  )
}

function BuilderCanvas({ composition, formula }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const ratio = Math.min(2, window.devicePixelRatio || 1)
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * ratio
    canvas.height = rect.height * ratio
    context.scale(ratio, ratio)
    context.clearRect(0, 0, rect.width, rect.height)
    context.fillStyle = '#f5fff9'
    context.fillRect(0, 0, rect.width, rect.height)
    const atoms = Object.entries(composition).flatMap(([symbol, count]) => Array.from({ length: count }, (_, index) => ({ symbol, index })))
    if (!atoms.length) return
    if (formula === 'H2O2') atoms.sort((a, b) => (a.symbol === 'O' ? -1 : 1) - (b.symbol === 'O' ? -1 : 1))
    const centralIndex = atoms.findIndex((item) => item.symbol !== 'H')
    if (centralIndex > 0 && formula !== 'H2O2') atoms.unshift(atoms.splice(centralIndex, 1)[0])
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const positions = atoms.map((_, index) => {
      if (index === 0) return [centerX, centerY]
      if (['CO2','CS2','N2O'].includes(formula)) return [centerX + (index === 1 ? -74 : 74), centerY]
      if (['H2O','H2S','SO2','NO2','O3'].includes(formula)) return [centerX + (index === 1 ? -62 : 62), centerY - 58]
      if (formula === 'H2O2') return [[centerX + 55, centerY], [centerX - 58, centerY - 50], [centerX + 112, centerY + 49]][index - 1]
      const ring = 72 + Math.floor((index - 1) / 8) * 58
      const angle = (index - 1) * 2.399963
      return [centerX + Math.cos(angle) * ring, centerY + Math.sin(angle) * ring * 0.62]
    })
    context.lineWidth = 5
    context.strokeStyle = '#8dbdac'
    const bondPairs = formula === 'H2O2' ? [[0,1],[0,2],[1,3]] : positions.slice(1).map((_, index) => [0,index + 1])
    bondPairs.forEach(([from, to]) => { context.beginPath(); context.moveTo(...positions[from]); context.lineTo(...positions[to]); context.stroke() })
    atoms.forEach((atom, index) => {
      const [x, y] = positions[index]
      const element = elements.find((item) => item.symbol === atom.symbol)
      context.beginPath(); context.arc(x, y, 27, 0, Math.PI * 2); context.fillStyle = colorForSymbol(atom.symbol); context.fill(); context.lineWidth = 3; context.strokeStyle = '#ffffff'; context.stroke()
      context.beginPath(); context.arc(x, y, 34, 0, Math.PI * 2); context.lineWidth = 1; context.strokeStyle = '#4b7a69'; context.stroke()
      context.fillStyle = '#153c30'; context.font = '800 15px system-ui'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText(atom.symbol, x, y)
      if (element?.electronegativity) { context.font = '700 9px system-ui'; context.fillStyle = '#426b5d'; context.fillText(`χ ${element.electronegativity}`, x, y + 43) }
    })
  }, [composition, formula])
  return <canvas ref={canvasRef} className="builder-canvas" aria-label="2D atom-count composition model. Guide lines organize the tokens and do not claim a complete bond structure." />
}

function colorForSymbol(symbol) {
  const palette = ['#91d7ff', '#ffde69', '#ff9f8f', '#b9f46e', '#c6b6ff', '#79d8c2']
  return palette[symbol.charCodeAt(0) % palette.length]
}

function formulaFromComposition(composition) {
  return Object.entries(composition).filter(([, count]) => count > 0).map(([symbol, count]) => `${symbol}${count > 1 ? count : ''}`).join('')
}

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

function randomQuestIndex(currentIndex = -1, completedQuests = new Set()) {
  const uncompleted = questPool.map((quest, index) => ({ quest, index })).filter(({ quest, index }) => index !== currentIndex && !completedQuests.has(quest.id))
  const candidates = uncompleted.length ? uncompleted : questPool.map((quest, index) => ({ quest, index })).filter(({ index }) => index !== currentIndex)
  return candidates[Math.floor(Math.random() * candidates.length)]?.index ?? 0
}
