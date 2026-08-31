import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { MoleculeModel } from './ScienceScenes'
import { CinematicLighting, ScientificCanvas, ScientificSparkles } from './ScientificCanvas.jsx'

const balancedParticleEvents = {
  H2O: { reactants: ['H2', 'H2', 'O2'], products: ['H2O', 'H2O'] },
  NaCl: { reactants: ['Na', 'Na', 'Cl2'], products: ['NaCl', 'NaCl'] },
  CO2: { reactants: ['C', 'O2'], products: ['CO2'] },
  MgO: { reactants: ['Mg', 'Mg', 'O2'], products: ['MgO', 'MgO'] },
  Fe2O3: { reactants: ['Fe', 'Fe', 'Fe', 'Fe', 'O2', 'O2', 'O2'], products: ['Fe2O3', 'Fe2O3'] },
  CuO: { reactants: ['Cu', 'Cu', 'O2'], products: ['CuO', 'CuO'] },
  Al2O3: { reactants: ['Al', 'Al', 'Al', 'Al', 'O2', 'O2', 'O2'], products: ['Al2O3', 'Al2O3'] },
  NH3: { reactants: ['N2', 'H2', 'H2', 'H2'], products: ['NH3', 'NH3'] },
  KCl: { reactants: ['K', 'K', 'Cl2'], products: ['KCl', 'KCl'] },
  HCl: { reactants: ['H2', 'Cl2'], products: ['HCl', 'HCl'] },
  SO2: { reactants: ['S', 'O2'], products: ['SO2'] },
  CaO: { reactants: ['Ca', 'Ca', 'O2'], products: ['CaO', 'CaO'] },
  LiF: { reactants: ['Li', 'Li', 'F2'], products: ['LiF', 'LiF'] },
  PCl3: { reactants: ['P4', 'Cl2', 'Cl2', 'Cl2', 'Cl2', 'Cl2', 'Cl2'], products: ['PCl3', 'PCl3', 'PCl3', 'PCl3'] },
}

function smooth(from, to, value) {
  const amount = THREE.MathUtils.clamp((value - from) / (to - from), 0, 1)
  return amount * amount * (3 - 2 * amount)
}

function lane(index, count) {
  const columns = count > 4 ? 2 : 1
  const rows = Math.ceil(count / columns)
  const row = index % rows
  const column = Math.floor(index / rows)
  return {
    y: (row - (rows - 1) / 2) * (count > 5 ? .54 : .7),
    z: (column - (columns - 1) / 2) * .75,
  }
}

function AnimatedUnit({ formula, index, count, product = false }) {
  const group = useRef()
  const start = useMemo(() => lane(index, count), [index, count])
  useFrame(({ clock }) => {
    if (!group.current) return
    const cycle = (clock.elapsedTime % 8) / 8
    if (!product) {
      const approach = smooth(.04, .42, cycle)
      const rearrange = smooth(.43, .54, cycle)
      group.current.position.set(
        THREE.MathUtils.lerp(-2.65 - (index % 2) * .18, -.2, approach),
        THREE.MathUtils.lerp(start.y, 0, approach),
        THREE.MathUtils.lerp(start.z, 0, approach),
      )
      const modelScale = count > 5 ? .43 : count > 3 ? .57 : .72
      group.current.scale.setScalar(modelScale * Math.max(.025, 1 - rearrange))
      group.current.visible = cycle < .57
    } else {
      const assemble = smooth(.49, .61, cycle)
      const separate = smooth(.6, .9, cycle)
      const resetFade = 1 - smooth(.92, .99, cycle)
      group.current.position.set(
        THREE.MathUtils.lerp(.2, 2.55 + (index % 2) * .2, separate),
        THREE.MathUtils.lerp(0, start.y, separate),
        THREE.MathUtils.lerp(0, start.z, separate),
      )
      const modelScale = count > 5 ? .43 : count > 3 ? .57 : .72
      group.current.scale.setScalar(modelScale * Math.max(.025, assemble * resetFade))
      group.current.visible = cycle > .46
    }
    group.current.rotation.y += .008
  })
  return <group ref={group}><MoleculeModel formula={formula} /></group>
}

function RearrangementPulse() {
  const ring = useRef()
  const ringMaterial = useRef()
  const shell = useRef()
  const shellMaterial = useRef()
  const energyLight = useRef()
  useFrame(({ clock }) => {
    const cycle = (clock.elapsedTime % 8) / 8
    const pulse = smooth(.42, .58, cycle) * (1 - smooth(.58, .7, cycle))
    if (ring.current) ring.current.scale.setScalar(.35 + pulse * 1.85)
    if (ringMaterial.current) ringMaterial.current.opacity = .035 + pulse * .3
    if (shell.current) shell.current.scale.setScalar(.2 + pulse * 1.5)
    if (shellMaterial.current) shellMaterial.current.opacity = .015 + pulse * .17
    if (energyLight.current) energyLight.current.intensity = .5 + pulse * 8
  })
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh ref={ring}>
        <torusGeometry args={[.54,.022,12,72]} />
        <meshBasicMaterial ref={ringMaterial} color="#dfffa8" transparent opacity={.04} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[.62,4]} />
        <meshPhysicalMaterial ref={shellMaterial} color="#eaffbd" emissive="#89c847" emissiveIntensity={1.2} roughness={.16} transparent opacity={.02} transmission={.28} thickness={.18} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight ref={energyLight} color="#dfffa8" intensity={.5} distance={4.5} decay={2} />
      <ScientificSparkles count={55} scale={[1.7,.7,1.7]} size={2.3} speed={1.3} color="#fff0a6" />
    </group>
  )
}

export function ReactionParticleScene({ reaction }) {
  const event = particleEventFor(reaction)
  return (
    <div className="science-canvas particle-reaction-canvas" role="img" aria-label={`Particle interaction for ${reaction.equation}`}>
      <ScientificCanvas id="reaction-particle-simulator" exposure={1.12} bloom={{ strength: .26, radius: .24, threshold: .68 }} camera={{ position: [0,.3,6.15], fov: 44 }} dpr={[1,1.4]}>
        <color attach="background" args={['#07191b']} />
        <fog attach="fog" args={['#07191b',8,13]} />
        <CinematicLighting mood="neutral" intensity={1.12} />
        <pointLight position={[0,0,2]} intensity={4.5} color="#b9f46e" />
        {event.reactants.map((formula, index) => <AnimatedUnit key={`r-${formula}-${index}`} formula={formula} index={index} count={event.reactants.length} />)}
        {event.products.map((formula, index) => <AnimatedUnit key={`p-${formula}-${index}`} formula={formula} index={index} count={event.products.length} product />)}
        <RearrangementPulse />
        <OrbitControls enablePan={false} minDistance={5.5} maxDistance={10} autoRotate autoRotateSpeed={.12} />
      </ScientificCanvas>
      <div className="particle-cycle">
        <span>reactant particles approach</span><i>→</i><span>bonds rearrange</span><i>→</i><span>product particles separate</span>
      </div>
      <div className="particle-scale-note">one balanced reaction event · atoms and electron-density layers enlarged</div>
    </div>
  )
}

export function particleEventFor(reactionOrFormula) {
  if (typeof reactionOrFormula === 'object' && reactionOrFormula?.reactantParticles?.length && reactionOrFormula?.productParticles?.length) {
    return { reactants: reactionOrFormula.reactantParticles, products: reactionOrFormula.productParticles }
  }
  const formula = typeof reactionOrFormula === 'string' ? reactionOrFormula : reactionOrFormula?.formula
  return balancedParticleEvents[formula] || {
    reactants: reactionOrFormula?.pair || [],
    products: formula ? [formula] : [],
  }
}
