import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Beaker, BookOpen, Expand, FlaskConical, Home, Leaf, Menu, X } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import Dashboard, { toolCatalog } from './components/Dashboard'
import ErrorBoundary from './components/ErrorBoundary'

const PeriodicTable = lazy(() => import('./tools/PeriodicTable'))
const AtomicModel = lazy(() => import('./tools/AtomicModel'))
const FusionSimulator = lazy(() => import('./tools/FusionSimulator'))
const FissionSimulator = lazy(() => import('./tools/FissionSimulator'))
const ElementLink = lazy(() => import('./tools/ElementLink'))
const ReactionsLab = lazy(() => import('./tools/ReactionsLab'))
const BondShellLab = lazy(() => import('./tools/BondShellLab'))
const LessonsLibrary = lazy(() => import('./tools/LessonsLibrary'))

const toolComponents = {
  table: PeriodicTable,
  atom: AtomicModel,
  fusion: FusionSimulator,
  fission: FissionSimulator,
  link: ElementLink,
  bonds: BondShellLab,
  reactions: ReactionsLab,
  lessons: LessonsLibrary,
}

export default function App() {
  const [activeTool, setActiveTool] = useState(() => validToolFromHash())
  const [menuOpen, setMenuOpen] = useState(false)

  const openTool = (id) => {
    setActiveTool(id)
    window.location.hash = id
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setMenuOpen(false)
  }

  const goHome = () => {
    setActiveTool(null)
    history.replaceState(null, '', window.location.pathname)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setMenuOpen(false)
  }

  useEffect(() => {
    const onHash = () => setActiveTool(validToolFromHash())
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
      if (event.key.toLowerCase() === 'f' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen?.()
      }
    }
    window.addEventListener('hashchange', onHash)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const Tool = activeTool ? toolComponents[activeTool] : null
  const toolMeta = toolCatalog.find((tool) => tool.id === activeTool) || (activeTool === 'lessons' ? { title: 'Optional Lessons' } : null)

  useEffect(() => {
    const title = toolMeta?.title
    document.title = title ? `${title} | LeapIntoChem` : 'LeapIntoChem | Interactive Chemistry Learning Lab'
  }, [activeTool, toolMeta?.title])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <div className="header-inner section-shell">
          <button className="brand" onClick={goHome} aria-label="LeapIntoChem home">
            <span className="brand-mark"><FlaskConical size={22} strokeWidth={2.4} /></span>
            <span>LeapInto<span>Chem</span></span>
          </button>
          <nav id="primary-navigation" aria-label="Primary navigation" className={menuOpen ? 'header-nav open' : 'header-nav'}>
            <button aria-current={!activeTool ? 'page' : undefined} className={!activeTool ? 'active' : ''} onClick={goHome}><Home size={16} /> Home</button>
            <button aria-current={activeTool === 'table' ? 'page' : undefined} onClick={() => openTool('table')}>Elements</button>
            <button aria-current={activeTool === 'link' ? 'page' : undefined} onClick={() => openTool('link')}>Molecules</button>
            <button aria-current={activeTool === 'bonds' ? 'page' : undefined} onClick={() => openTool('bonds')}>Bonds</button>
            <button aria-current={activeTool === 'reactions' ? 'page' : undefined} onClick={() => openTool('reactions')}>Reactions</button>
            <button aria-current={activeTool === 'lessons' ? 'page' : undefined} onClick={() => openTool('lessons')}><BookOpen size={16} /> Lessons</button>
          </nav>
          <div className="header-actions">
            <button className="icon-button fullscreen-button" onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.()} aria-label="Toggle fullscreen" title="Fullscreen (F)"><Expand size={18} /></button>
            <div className="lab-badge"><Leaf size={15} fill="currentColor" /> Learning lab</div>
            <button className="icon-button menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu" aria-expanded={menuOpen} aria-controls="primary-navigation">{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!Tool ? (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Dashboard onOpen={openTool} />
          </motion.div>
        ) : (
          <motion.main id="main-content" key={activeTool} className="tool-page section-shell" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} tabIndex="-1">
            <div className="tool-breadcrumb">
              <button onClick={goHome}><ArrowLeft size={17} /> Home</button>
              <span>/</span>
              <span>{toolMeta?.title}</span>
            </div>
            <ErrorBoundary resetKey={activeTool}><Suspense fallback={<div className="tool-loading panel" role="status" aria-live="polite"><span /><p>Preparing the lab…</p></div>}><Tool onNavigate={openTool} /></Suspense></ErrorBoundary>
          </motion.main>
        )}
      </AnimatePresence>

      <footer className="site-footer">
        <div className="section-shell footer-inner">
          <div className="brand small"><span className="brand-mark"><Beaker size={18} /></span><span>LeapInto<span>Chem</span></span></div>
          <p>Science-first interactive models for curious minds.</p>
          <span>Press <kbd>F</kbd> for fullscreen</span>
        </div>
      </footer>
    </div>
  )
}

function validToolFromHash() {
  const requestedTool = window.location.hash.slice(1)
  return toolComponents[requestedTool] ? requestedTool : null
}
