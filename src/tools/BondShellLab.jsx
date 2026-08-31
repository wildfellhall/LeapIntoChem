import { Atom, Sparkles, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BondFormationLab } from '../components/BondFormationLab.jsx'
import { bondingProfileById, bondingProfiles } from '../data/bonding.js'
import { subshellNotation } from '../data/orbitals.js'
import { rendererBackend } from '../components/ScientificCanvas.jsx'
import { ToolIntro } from './PeriodicTable.jsx'

const PHASE_NAMES = ['separate atoms', 'electric interaction', 'stable arrangement']

export default function BondShellLab() {
  const [profileId, setProfileId] = useState('h2')
  const [phase, setPhase] = useState(0)
  const [playing, setPlaying] = useState(false)
  const profile = bondingProfileById[profileId]

  useEffect(() => {
    if (!playing) return undefined
    if (phase >= 2) {
      setPlaying(false)
      return undefined
    }
    const timer = window.setTimeout(() => setPhase((value) => Math.min(2, value + 1)), 1250)
    return () => window.clearTimeout(timer)
  }, [phase, playing])

  useEffect(() => {
    window.advanceTime = (ms) => {
      if (!playing) return
      const steps = Math.floor(Math.max(0, ms) / 1250)
      if (steps > 0) setPhase((value) => Math.min(2, value + steps))
    }
    window.render_game_to_text = () => JSON.stringify({
      simulation: 'bond-and-shell-microscope',
      coordinateSystem: '3D scene origin is midway between atoms; x runs from the left nucleus to the right nucleus.',
      profileCount: bondingProfiles.length,
      profileId: profile.id,
      formula: profile.formula,
      title: profile.title,
      bondType: profile.kind,
      phase,
      phaseName: PHASE_NAMES[phase],
      playing,
      electronegativityDelta: profile.electronegativityDelta,
      sharedElectrons: profile.sharedElectrons,
      transferredElectrons: profile.transferElectrons,
      electronsInTransit: phase === 1 ? profile.transferElectrons : 0,
      left: bondAtomState(profile, 'left', phase),
      right: bondAtomState(profile, 'right', phase),
      visualModel: {
        nucleus: 'vibrating proton/neutron energy-packet cluster with physical transmission and internal light',
        electrons: 'occupied s/p/d/f probability-density layers shaded with Three Shader Language',
        bond: profile.kind === 'ionic' ? 'moving transfer tracers and electrostatic field glow' : 'overlapping shared-electron density with a flowing TSL bond volume',
        rendering: 'WebGPU/WGSL where available; the same TSL graph compiles to the WebGL2 fallback',
      },
      renderer: rendererBackend('bond-shell-microscope'),
    })
    return () => {
      delete window.advanceTime
      delete window.render_game_to_text
    }
  }, [phase, playing, profile])

  const selectProfile = (nextProfileId) => {
    setProfileId(nextProfileId)
    setPhase(0)
    setPlaying(false)
  }

  const selectPhase = (nextPhase) => {
    setPhase(nextPhase)
    setPlaying(false)
  }

  const togglePlayback = () => {
    if (playing) {
      setPlaying(false)
      return
    }
    if (phase >= 2) setPhase(0)
    setPlaying(true)
  }

  return (
    <div>
      <ToolIntro
        eyebrow={`${bondingProfiles.length} curated covalent and ionic examples`}
        title="Bond & Shell Lab"
        description="Look inside atoms as quantum probability clouds overlap, shift, or transfer—then connect that 3D evidence to valence-shell bookkeeping."
        accent="#8edff2"
      />
      <section className="quantum-method-grid" aria-label="Microscope rendering and science methods">
        <div><Atom /><span><strong>Living nuclei</strong><small>Individual protons and neutrons vibrate inside a dense, internally lit cluster.</small></span></div>
        <div><Sparkles /><span><strong>Probability clouds</strong><small>Emissive particles map combined occupied orbitals instead of planet-like electron paths.</small></span></div>
        <div><Zap /><span><strong>Electric interaction</strong><small>Shared density, polarity shifts, and transfer tracers show how lower-energy bonds emerge.</small></span></div>
      </section>
      <BondFormationLab
        profile={profile}
        phase={phase}
        playing={playing}
        onSelect={selectProfile}
        onPhase={selectPhase}
        onPlay={togglePlayback}
        onReset={() => { setPhase(0); setPlaying(false) }}
      />
    </div>
  )
}

function bondAtomState(profile, side, phase) {
  const atom = profile[side]
  const final = phase === 2
  let visibleShells = atom.initialShells
  if (profile.kind === 'ionic' && (phase === 1 && side === 'left')) {
    visibleShells = atom.finalShells
  } else if (profile.kind === 'ionic' && final) {
    visibleShells = atom.finalShells
  } else if (profile.kind !== 'ionic' && final) {
    visibleShells = atom.initialShells.map((count, index) => index === atom.initialShells.length - 1 ? count - profile.bondOrder : count)
  }
  return {
    symbol: atom.symbol,
    visibleShellElectrons: visibleShells,
    occupiedSubshells: subshellNotation(visibleShells) || (final && profile.kind !== 'ionic' ? 'shared molecular-orbital density' : 'none'),
    separatedAtomReference: subshellNotation(atom.initialShells),
    outerElectronsCounted: final || (profile.kind === 'ionic' && phase === 1 && side === 'left') ? atom.targetOuter : atom.initialShells.at(-1),
    targetOuterShell: atom.targetOuter,
    charge: final ? atom.charge : null,
  }
}
