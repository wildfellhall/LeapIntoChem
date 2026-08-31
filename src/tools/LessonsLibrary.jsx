import { AlertTriangle, ArrowLeft, BookOpen, Check, ChevronLeft, ChevronRight, ExternalLink, Layers3, Lightbulb, MousePointerClick, RotateCcw, Search, Sparkles, Target, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import MiniLessonLab from '../components/MiniLessonLab.jsx'
import { lessonGrades, lessons, lessonSources } from '../data/lessons.js'

export default function LessonsLibrary({ onNavigate }) {
  const [grade, setGrade] = useState('all')
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [cardIndex, setCardIndex] = useState(0)
  const [cardFlipped, setCardFlipped] = useState(false)
  const [answers, setAnswers] = useState({})
  const [miniInteractions, setMiniInteractions] = useState(0)
  const activeLesson = lessons.find((lesson) => lesson.id === activeId) || null
  const filtered = useMemo(() => lessons.filter((lesson) => {
    const gradeMatches = grade === 'all' || lesson.grade === Number(grade)
    const text = `${lesson.title} ${lesson.tool} ${lesson.summary} ${lesson.concepts.join(' ')}`.replaceAll('-', ' ').toLowerCase()
    return gradeMatches && text.includes(query.trim().toLowerCase())
  }), [grade, query])

  useEffect(() => {
    setCardIndex(0)
    setCardFlipped(false)
    setAnswers({})
    setMiniInteractions(0)
    if (activeLesson) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeId])

  useEffect(() => {
    window.render_game_to_text = () => JSON.stringify({
      simulation: 'lesson library',
      mode: activeLesson ? 'lesson' : 'catalog',
      lessonCount: lessons.length,
      gradeGroups: Object.fromEntries(lessonGrades.map((item) => [item, lessons.filter((lesson) => lesson.grade === item).length])),
      filters: { grade, query },
      visibleLessonCount: filtered.length,
      activeLesson: activeLesson ? {
        id: activeLesson.id,
        title: activeLesson.title,
        grade: activeLesson.grade,
        tool: activeLesson.tool,
        concepts: activeLesson.concepts,
        sections: ['learning goals', 'four-part reading', 'diagram', 'worked example', 'misconception check', 'key definition', 'glossary', 'guided investigation', 'mini interactive', 'flashcards', 'practice questions', 'reflection', 'sources'],
        contentDepth: { readingSections: activeLesson.paragraphs.length, workedSteps: activeLesson.workedExample.steps.length, investigationSteps: activeLesson.investigation.steps.length },
        miniInteractive: activeLesson.mini,
        miniInteractions,
        flashcard: { index: cardIndex, flipped: cardFlipped },
        practiceAnswered: Object.keys(answers).length,
        practiceCorrect: Object.entries(answers).filter(([index, answer]) => activeLesson.practice[Number(index)]?.answer === answer).length,
      } : null,
    })
    window.advanceTime = () => {}
    return () => { delete window.render_game_to_text; delete window.advanceTime }
  }, [activeLesson, answers, cardFlipped, cardIndex, filtered.length, grade, miniInteractions, query])

  if (activeLesson) return <LessonDetail lesson={activeLesson} cardIndex={cardIndex} setCardIndex={setCardIndex} cardFlipped={cardFlipped} setCardFlipped={setCardFlipped} answers={answers} setAnswers={setAnswers} miniInteractions={miniInteractions} setMiniInteractions={setMiniInteractions} onBack={() => setActiveId(null)} onSelect={setActiveId} onNavigate={onNavigate} />

  return (
    <div className="lessons-library">
      <section className="lessons-hero panel">
        <div><p className="eyebrow"><BookOpen size={15} /> Optional guided learning</p><h1>Lessons that make every tool idea click.</h1><p>{lessons.length} detailed lessons pair learning goals, four-part explanations, worked examples, misconception checks, guided investigations, retrieval practice, and challenge-based mini-labs. Browse freely—nothing here blocks access to the full tools.</p></div>
        <div className="lesson-stack-art" aria-hidden="true"><span>atom</span><span>bond</span><span>reaction</span><span>star</span></div>
      </section>

      <section className="lesson-catalog" aria-labelledby="lesson-catalog-title">
        <div className="section-heading"><div><p className="eyebrow">Grade-grouped curriculum</p><h2 id="lesson-catalog-title">Choose an optional lesson</h2></div><div className="result-count">{filtered.length} lesson{filtered.length === 1 ? '' : 's'}</div></div>
        <div className="filter-bar lesson-filter-bar">
          <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search concepts or tools" aria-label="Search lessons" /></label>
          <div className="grade-pills" aria-label="Filter lessons by grade">{['all', ...lessonGrades].map((item) => <button key={item} className={String(grade) === String(item) ? 'active' : ''} aria-pressed={String(grade) === String(item)} onClick={() => setGrade(item)}>{item === 'all' ? 'All grades' : `Grade ${item}`}</button>)}</div>
        </div>
        <div className="lesson-grade-groups">
          {lessonGrades.map((gradeLevel) => {
            const gradeLessons = filtered.filter((lesson) => lesson.grade === gradeLevel)
            if (!gradeLessons.length) return null
            return <section key={gradeLevel} className="lesson-grade-group" aria-labelledby={`grade-${gradeLevel}-lessons`}><div className="lesson-grade-heading"><span>Grade {gradeLevel}</span><div><h3 id={`grade-${gradeLevel}-lessons`}>{gradeLabel(gradeLevel)}</h3><p>{gradeDescription(gradeLevel)}</p></div><strong>{gradeLessons.length}</strong></div><div className="lesson-card-grid">{gradeLessons.map((lesson) => <button className="lesson-card" key={lesson.id} data-lesson-id={lesson.id} onClick={() => setActiveId(lesson.id)}><span className="lesson-card-index">{String(lessons.indexOf(lesson) + 1).padStart(2, '0')}</span><div><p className="eyebrow">{lesson.tool} · {lesson.duration}</p><h4>{lesson.title}</h4><p>{lesson.summary}</p><small>{lesson.glossary.map((item) => item.term).join(' · ')}</small></div><ChevronRight /></button>)}</div></section>
          })}
        </div>
        {!filtered.length && <div className="empty-state"><Search size={28} /><h3>No lesson matches yet</h3><p>Try a broader science word or another grade.</p><button onClick={() => { setGrade('all'); setQuery('') }}>Show every lesson</button></div>}
      </section>
    </div>
  )
}

function LessonDetail({ lesson, cardIndex, setCardIndex, cardFlipped, setCardFlipped, answers, setAnswers, miniInteractions, setMiniInteractions, onBack, onSelect, onNavigate }) {
  const card = lesson.flashcards[cardIndex]
  const relatedRoute = { 'Periodic Playground': 'table', 'Atom Studio': 'atom', 'Element Link': 'link', 'Bond & Shell Lab': 'bonds', 'Reaction Lab': 'reactions', 'Fusion Frontier': 'fusion', 'Fission Control': 'fission' }[lesson.tool]
  const lessonIndex = lessons.indexOf(lesson)
  const previousLesson = lessons[lessonIndex - 1]
  const nextLesson = lessons[lessonIndex + 1]
  return <article className="lesson-detail" data-active-lesson={lesson.id}>
    <button className="lesson-back" onClick={onBack}><ArrowLeft size={17} /> All lessons</button>
    <header className="lesson-detail-header panel"><div><p className="eyebrow">Grade {lesson.grade} · {lesson.tool} · {lesson.duration}</p><h1>{lesson.title}</h1><p>{lesson.summary}</p><div className="concept-chips">{lesson.concepts.map((concept) => <span key={concept}>{concept.replaceAll('-', ' ')}</span>)}</div></div><div className="lesson-number"><small>Optional lesson</small><strong>{String(lessons.indexOf(lesson) + 1).padStart(2, '0')}</strong><span>of {lessons.length}</span></div></header>

    <nav className="lesson-section-nav panel" aria-label="Lesson sections"><a href="#lesson-learn">Learn</a><a href="#lesson-reason">Reason</a><a href="#lesson-investigate">Investigate</a><a href="#lesson-recall">Recall</a></nav>
    <section className="lesson-goals panel" id="lesson-learn"><div><Target /><p className="eyebrow">Learning goals</p><h2>By the end, you can…</h2></div><ol>{lesson.learningGoals.map((goal) => <li key={goal}>{goal}</li>)}</ol></section>

    <div className="lesson-learning-grid" id="lesson-reason">
      <main className="lesson-reading">
        <section className="lesson-copy panel"><p className="eyebrow">Read and reason</p><h2>A four-part explanation</h2>{lesson.paragraphs.map((paragraph, index) => <section key={paragraph.heading}><span>{index + 1}</span><div><h3>{paragraph.heading}</h3><p>{paragraph.text}</p></div></section>)}</section>
        <ConceptDiagram diagram={lesson.diagram} />
        <section className="lesson-reasoning-grid"><article className="worked-example panel"><div className="depth-heading"><Lightbulb /><div><p className="eyebrow">Worked example</p><h2>{lesson.workedExample.prompt}</h2></div></div><ol>{lesson.workedExample.steps.map((step) => <li key={step}>{step}</li>)}</ol><p><Check /> {lesson.workedExample.conclusion}</p></article><article className="misconception-panel panel"><div className="depth-heading"><AlertTriangle /><div><p className="eyebrow">Misconception check</p><h2>Pause before accepting the shortcut</h2></div></div><blockquote>{lesson.misconception.claim}</blockquote><p><strong>Correction:</strong> {lesson.misconception.correction}</p></article></section>
        <section className="lesson-language panel"><div className="definition-callout"><span><Layers3 /></span><div><p className="eyebrow">Key definition</p><h2>{lesson.definitions[0].term}</h2><p>{lesson.definitions[0].definition}</p></div></div><div className="lesson-glossary"><h2>Glossary</h2><dl>{lesson.glossary.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.meaning}</dd></div>)}</dl></div></section>
        <section className="lesson-transfer panel"><div><MousePointerClick /><p><strong>Connection to the full tool</strong><span>{lesson.toolConnection}</span></p></div><blockquote><strong>Reflection:</strong> {lesson.reflection}</blockquote></section>
      </main>
      <aside className="lesson-interactive-column" id="lesson-investigate"><section className="investigation-guide panel"><div className="depth-heading"><Target /><div><p className="eyebrow">Guided investigation</p><h2>{lesson.investigation.question}</h2></div></div><ol>{lesson.investigation.steps.map((step) => <li key={step}>{step}</li>)}</ol></section><MiniLessonLab mini={lesson.mini} interactions={miniInteractions} onInteract={() => setMiniInteractions((value) => value + 1)} /><section className="lesson-source-note panel"><p className="eyebrow">Science trail</p><h2>Reference foundations</h2><p>Lesson language is classroom-scaled; these authoritative references support the underlying terminology and science.</p>{lesson.sources.map((key) => <a key={key} href={lessonSources[key].url} target="_blank" rel="noreferrer">{lessonSources[key].label}<ExternalLink size={14} /></a>)}</section></aside>
    </div>

    <section className="lesson-recall-grid" id="lesson-recall">
      <div className="flashcard-panel panel"><div className="recall-heading"><div><p className="eyebrow">Flashcards</p><h2>Retrieve before revealing</h2></div><span>{cardIndex + 1}/{lesson.flashcards.length}</span></div><button className={`lesson-flashcard ${cardFlipped ? 'flipped' : ''}`} aria-pressed={cardFlipped} onClick={() => setCardFlipped((value) => !value)}><span>{cardFlipped ? 'Answer' : 'Prompt'}</span><strong>{cardFlipped ? card.answer : card.prompt}</strong><small>{cardFlipped ? 'Tap to see the prompt' : 'Think first, then tap to reveal'}</small></button><div className="flashcard-actions"><button onClick={() => { setCardIndex((cardIndex - 1 + lesson.flashcards.length) % lesson.flashcards.length); setCardFlipped(false) }}><ChevronLeft /> Previous</button><button onClick={() => { setCardIndex((cardIndex + 1) % lesson.flashcards.length); setCardFlipped(false) }}>Next <ChevronRight /></button></div></div>
      <div className="practice-panel panel"><div className="recall-heading"><div><p className="eyebrow">Practice questions</p><h2>Check your model</h2></div><span>{Object.keys(answers).length}/{lesson.practice.length}</span></div><div className="practice-list">{lesson.practice.map((question, questionIndex) => { const chosen = answers[questionIndex]; const answered = chosen !== undefined; return <fieldset key={question.prompt}><legend><span>{questionIndex + 1}</span>{question.prompt}</legend><div>{question.choices.map((choice, choiceIndex) => <button key={choice} className={answered ? choiceIndex === question.answer ? 'correct' : choiceIndex === chosen ? 'incorrect' : '' : ''} disabled={answered} onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: choiceIndex }))}>{answered && choiceIndex === question.answer ? <Check /> : answered && choiceIndex === chosen ? <X /> : null}{choice}</button>)}</div>{answered && <p className={chosen === question.answer ? 'answer-feedback correct' : 'answer-feedback'}>{chosen === question.answer ? 'Correct. ' : 'Not quite. '}{question.explanation}</p>}</fieldset> })}</div>{Object.keys(answers).length === lesson.practice.length && <button className="quiet-button" onClick={() => setAnswers({})}><RotateCcw size={15} /> Try both again</button>}</div>
    </section>

    <nav className="lesson-sequence-nav" aria-label="Adjacent lessons"><button disabled={!previousLesson} onClick={() => previousLesson && onSelect(previousLesson.id)}><ChevronLeft /><span><small>Previous lesson</small><strong>{previousLesson?.title || 'Beginning of curriculum'}</strong></span></button><button disabled={!nextLesson} onClick={() => nextLesson && onSelect(nextLesson.id)}><span><small>Next lesson</small><strong>{nextLesson?.title || 'End of curriculum'}</strong></span><ChevronRight /></button></nav>
    <footer className="lesson-footer panel"><div><Sparkles /><p><strong>Lesson complete whenever you’re ready.</strong><span>{miniInteractions} mini-lab adjustment{miniInteractions === 1 ? '' : 's'} this visit · no stored score. Revisit any section freely.</span></p></div>{relatedRoute && <button className="primary-button" onClick={() => onNavigate(relatedRoute)}>Open the full {lesson.tool} <ChevronRight /></button>}</footer>
  </article>
}

function ConceptDiagram({ diagram }) {
  return <figure className="lesson-diagram panel"><figcaption><p className="eyebrow">Concept diagram</p><h2>{diagram.title}</h2></figcaption><div className="diagram-flow">{diagram.nodes.map((node, index) => <div key={`${index}-${node}`}><span>{node}</span>{index < diagram.nodes.length - 1 && <ChevronRight aria-hidden="true" />}</div>)}</div><p>{diagram.caption}</p></figure>
}

function gradeLabel(grade) {
  return ({ 5: 'Matter and symbols', 6: 'Atomic structure and bonding', 7: 'Electron models and reactions', 8: 'Nuclear processes and stars', 9: 'Advanced fusion and stellar systems' })[grade]
}

function gradeDescription(grade) {
  return ({ 5: 'Build a concrete particle vocabulary.', 6: 'Connect electrons to structure and materials.', 7: 'Reason with equations, energy, and quantum models.', 8: 'Follow nuclei through fission, fusion, and stars.', 9: 'Compare full pathways, measurements, and model limits.' })[grade]
}
