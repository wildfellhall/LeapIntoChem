import { motion } from 'framer-motion'
import { Atom, BookOpen, ChevronRight, FlaskConical, Gamepad2, Microscope, Search, Sparkles, Split, TableProperties, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'

const icons = { table: TableProperties, atom: Atom, fusion: Sparkles, fission: Split, link: Gamepad2, bonds: Microscope, reactions: FlaskConical }

export const toolCatalog = [
  { id: 'table', title: 'Periodic Playground', eyebrow: 'Explore 118 elements', description: 'Tap every element, compare families, and uncover the particles and properties inside.', grades: [5, 6, 7, 8], color: '#91d7ff', iconColor: '#155a89', time: '8–15 min' },
  { id: 'atom', title: 'Atom Studio', eyebrow: 'Build an isotope', description: 'Choose an element, tune its neutron count, and explore a living electron probability cloud.', grades: [6, 7, 8, 9], color: '#c6b6ff', iconColor: '#513ea3', time: '10–15 min' },
  { id: 'link', title: 'Element Link', eyebrow: '85 randomized quests', description: 'Receive a random formula challenge, then compare a real bulk sample with its particle-structure model.', grades: [5, 6, 7, 8, 9], color: '#ffde69', iconColor: '#765e00', time: '5–20 min' },
  { id: 'bonds', title: 'Bond & Shell Lab', eyebrow: '14 quantum-density examples', description: 'Look inside atoms as electron probability clouds overlap, polarize, transfer, and fill valence-shell counts.', grades: [6, 7, 8, 9], color: '#8edff2', iconColor: '#075d75', time: '10–20 min' },
  { id: 'reactions', title: 'Reaction Lab', eyebrow: '133 balanced scenarios', description: 'Find supported reaction partners, balance the inputs, and watch atoms regroup into modeled products.', grades: [7, 8, 9], color: '#ff9f8f', iconColor: '#8c2d22', time: '10–20 min' },
  { id: 'fusion', title: 'Fusion Frontier', eyebrow: 'Power a star or plasma', description: 'Tune a star in space or operate a lab tokamak through a scientist-guided workflow.', grades: [8, 9], color: '#b9f46e', iconColor: '#3e640f', time: '12–25 min' },
  { id: 'fission', title: 'Fission Control', eyebrow: 'Manage a chain reaction', description: 'Select fissile fuel, moderate neutrons, and safely guide a reactor through fission.', grades: [8, 9], color: '#79d8c2', iconColor: '#075d4d', time: '12–20 min' },
]

export default function Dashboard({ onOpen }) {
  const [query, setQuery] = useState('')
  const [grade, setGrade] = useState('all')
  const filtered = useMemo(() => toolCatalog.filter((tool) => {
    const matchesGrade = grade === 'all' || tool.grades.includes(Number(grade))
    const haystack = `${tool.title} ${tool.eyebrow} ${tool.description}`.toLowerCase()
    return matchesGrade && haystack.includes(query.toLowerCase())
  }), [grade, query])

  return (
    <main id="main-content" tabIndex="-1">
      <section className="hero section-shell">
        <div className="hero-copy">
          <div className="kicker"><Zap size={15} fill="currentColor" /> Chemistry, made tangible</div>
          <h1>Big science.<br /><span>Right at your fingertips.</span></h1>
          <p>Build atoms, spark reactions, and step inside the forces that shape everything around us.</p>
          <button className="primary-button" onClick={() => onOpen('link')}>Start a molecule quest <span>→</span></button>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-a"><i /></div>
          <div className="orbit orbit-b"><i /></div>
          <div className="hero-nucleus"><span>+</span></div>
          <div className="float-chip chip-one"><Atom size={18} /> 8p⁺</div>
          <div className="float-chip chip-two"><Sparkles size={17} /> O₂</div>
          <div className="float-chip chip-three"><FlaskConical size={17} /> H₂O</div>
        </div>
      </section>

      <section className="section-shell explorer-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Choose your experiment</p>
            <h2>What will you discover?</h2>
          </div>
          <div className="result-count">{filtered.length} {filtered.length === 1 ? 'tool' : 'tools'}</div>
        </div>

        <div className="filter-bar">
          <label className="search-box">
            <Search size={19} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools and topics" aria-label="Search chemistry tools" />
          </label>
          <div className="grade-pills" aria-label="Filter by grade">
            {['all', 5, 6, 7, 8, 9].map((item) => (
              <button key={item} className={String(grade) === String(item) ? 'active' : ''} onClick={() => setGrade(item)}>
                {item === 'all' ? 'All grades' : `Grade ${item}`}
              </button>
            ))}
          </div>
        </div>

        <div className="tool-grid">
          {filtered.map((tool, index) => {
            const Icon = icons[tool.id]
            return (
              <motion.button
                className="tool-card"
                key={tool.id}
                onClick={() => onOpen(tool.id)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.045 }}
                whileHover={{ y: -5 }}
              >
                <div className="tool-art" style={{ backgroundColor: tool.color }}>
                  <span className="tool-icon" style={{ color: tool.iconColor }}><Icon size={30} strokeWidth={1.8} /></span>
                  <span className="art-bubble bubble-one" />
                  <span className="art-bubble bubble-two" />
                  <span className="art-line" />
                </div>
                <div className="tool-card-body">
                  <p className="eyebrow">{tool.eyebrow}</p>
                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>
                  <div className="card-meta">
                    <span>Grades {tool.grades[0]}–{tool.grades.at(-1)}</span>
                    <span>{tool.time}</span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <Search size={28} />
            <h3>No exact match yet</h3>
            <p>Try another grade or a broader science word.</p>
            <button onClick={() => { setQuery(''); setGrade('all') }}>Show every tool</button>
          </div>
        )}
      </section>

      <section className="lessons-callout section-shell panel">
        <div className="lessons-callout-icon"><BookOpen /></div>
        <div><p className="eyebrow">Optional guided learning</p><h2>Want the “why” before the full lab?</h2><p>Explore 43 grade-grouped lessons with mini interactives, concept diagrams, definitions, glossaries, flashcards, and practice questions.</p></div>
        <button className="primary-button" onClick={() => onOpen('lessons')}>Browse lessons <ChevronRight size={17} /></button>
      </section>

      <section className="science-note section-shell">
        <div><Sparkles size={24} /></div>
        <p><strong>Models with meaning.</strong> Every activity follows real particle counts, conservation of atoms, balanced equations, and accepted nuclear science. Visual scale is adjusted so the invisible can be explored.</p>
      </section>
    </main>
  )
}
