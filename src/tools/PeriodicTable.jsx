import { AnimatePresence, motion } from 'framer-motion'
import { Info, Layers3, MousePointer2, RotateCcw, Search, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { categories, elements, periodicPosition, propertyNotes } from '../data/elements'
import { reactionPartners } from '../data/chemistry'
import { OrbitalLedger } from '../components/OrbitalLedger.jsx'
import { subshellNotation } from '../data/orbitals.js'

export default function PeriodicTable({ onNavigate }) {
  const [selected, setSelected] = useState(elements[5])
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [period, setPeriod] = useState(null)

  useEffect(() => {
    window.render_game_to_text = () => JSON.stringify({
      simulation: 'periodic table',
      selected: { number: selected.number, name: selected.name, symbol: selected.symbol },
      principalShells: selected.shells,
      occupiedSubshells: subshellNotation(selected.shells),
      filters: { category, period, query },
    })
    window.advanceTime = () => {}
    return () => { delete window.render_game_to_text; delete window.advanceTime }
  }, [category, period, query, selected])

  const matches = useMemo(() => new Set(elements.filter((element) => {
    const queryMatch = `${element.name} ${element.symbol} ${element.number}`.toLowerCase().includes(query.toLowerCase())
    const categoryMatch = category === 'all' || element.category === category
    const periodMatch = !period || element.period === period
    return queryMatch && categoryMatch && periodMatch
  }).map((element) => element.number)), [category, period, query])

  const selectPeriod = (value) => {
    setPeriod(period === value ? null : value)
    setSelected(elements.find((element) => element.period === value) || selected)
  }

  return (
    <div className="periodic-tool">
      <ToolIntro eyebrow="118 elements · 10 families" title="Periodic Playground" description="Every square is a different kind of atom. Explore a family, select a row, or search for one by name." accent="#91d7ff" />

      <div className="periodic-controls panel">
        <label className="search-box compact"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an element" /></label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by element family">
          <option value="all">All element families</option>
          {Object.entries(categories).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
        </select>
        {(category !== 'all' || period || query) && <button className="quiet-button" onClick={() => { setCategory('all'); setPeriod(null); setQuery('') }}><RotateCcw size={16} /> Reset</button>}
        <div className="control-tip"><MousePointer2 size={16} /> Tap a period number to compare a row</div>
      </div>

      <div className="periodic-layout">
        <section className="periodic-stage panel">
          <div className="table-scroll">
            <div className="periodic-grid" role="group" aria-label="Interactive periodic table of the elements">
              {Array.from({ length: 7 }, (_, index) => (
                <button key={index} className={period === index + 1 ? 'period-label active' : 'period-label'} style={{ gridRow: index + 1, gridColumn: 1 }} onClick={() => selectPeriod(index + 1)} aria-label={`Select period ${index + 1}`}>{index + 1}</button>
              ))}
              <div className="series-label lanthanide-label" style={{ gridRow: 8, gridColumn: 1 }}>Ln</div>
              <div className="series-label actinide-label" style={{ gridRow: 9, gridColumn: 1 }}>An</div>
              {elements.map((element) => {
                const position = periodicPosition(element)
                const isMatch = matches.has(element.number)
                return (
                  <button
                    aria-label={`${element.name}, atomic number ${element.number}`}
                    aria-pressed={selected.number === element.number}
                    key={element.number}
                    className={`element-tile ${selected.number === element.number ? 'selected' : ''} ${isMatch ? '' : 'muted'}`}
                    style={{ gridRow: position.row, gridColumn: position.col + 1, '--element-color': categories[element.category].color }}
                    onClick={() => setSelected(element)}
                  >
                    <span className="atomic-number">{element.number}</span>
                    <strong>{element.symbol}</strong>
                    <small>{element.name}</small>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="category-legend">
            {Object.entries(categories).map(([key, item]) => (
              <button key={key} className={category === key ? 'active' : ''} onClick={() => setCategory(category === key ? 'all' : key)}>
                <i style={{ backgroundColor: item.color }} />{item.label}
              </button>
            ))}
          </div>
        </section>

        <AnimatePresence mode="wait">
          <motion.aside className="element-inspector panel" key={selected.number} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div className="element-identity" style={{ backgroundColor: categories[selected.category].color }}>
              <div><span>{selected.number}</span><strong>{selected.symbol}</strong></div>
              <p>{categories[selected.category].label}</p>
            </div>
            <div className="inspector-title">
              <div><p className="eyebrow">Period {selected.period}{selected.group ? ` · Group ${selected.group}` : ' · f-block'}</p><h2>{selected.name}</h2></div>
              <button className="close-inspector" aria-label="Clear selection" onClick={() => setSelected(elements[5])}><X size={17} /></button>
            </div>
            <p className="reactivity-note">{selected.reactivity}</p>
            <div className="stat-grid">
              <div><span>Protons</span><strong>{selected.number}</strong></div>
              <div><span>Electrons</span><strong>{selected.number}</strong></div>
              <div><span>Atomic mass</span><strong>{selected.mass}</strong></div>
              <div><span>Shells</span><strong>{selected.shells.length}</strong></div>
            </div>
            <div className="info-block">
              <h3><Layers3 size={17} /> Common isotopes</h3>
              <div className="isotope-row">{selected.isotopes.map((mass) => <span key={mass}><sup>{mass}</sup>{selected.symbol}</span>)}</div>
              <p>Same proton count, different neutron counts. Some isotopes may be radioactive.</p>
            </div>
            <div className="info-block orbital-inspector">
              <h3><Layers3 size={17} /> Occupied subshells</h3>
              <p className="subshell-notation">{subshellNotation(selected.shells)}</p>
              <OrbitalLedger shells={selected.shells} compact />
              <p>Boxes are orbitals; arrows are electron spin bookkeeping. Electrons occupy equal-energy orbitals singly before pairing.</p>
            </div>
            <div className="info-block">
              <h3><Sparkles size={17} /> Chemical clues</h3>
              <ul>
                {(propertyNotes[selected.symbol] || [
                  selected.electronegativity ? `Electronegativity: ${selected.electronegativity} (Pauling scale)` : 'Electronegativity is uncertain or not typically assigned.',
                  `Electron shells: ${selected.shells.join(' · ')}`,
                  selected.group === 18 ? 'A filled outer shell makes this atom unusually stable.' : 'Its outer electrons determine how it bonds.',
                ]).map((note) => <li key={note}>{note}</li>)}
              </ul>
            </div>
            {reactionPartners(selected.symbol).length > 0 && <p className="pair-note"><Info size={16} /> Common partners here: {reactionPartners(selected.symbol).join(', ')}</p>}
            <button className="primary-button full" onClick={() => onNavigate('atom')}>Build this kind of atom <span>→</span></button>
          </motion.aside>
        </AnimatePresence>
      </div>
    </div>
  )
}

export function ToolIntro({ eyebrow, title, description, accent }) {
  return (
    <div className="tool-intro" style={{ '--tool-accent': accent }}>
      <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>
      <span className="tool-intro-orb" aria-hidden="true" />
    </div>
  )
}
