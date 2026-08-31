import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { elementBySymbol } from '../data/elements.js'
import { ElectronDensityMaterial, NuclearDensityCluster, OrbitalProbabilityLayers } from './AtomicStructureLayers.jsx'
import { CinematicLighting, ScientificCanvas, ScientificSparkles } from './ScientificCanvas.jsx'

function fract(value) {
  return value - Math.floor(value)
}

function seeded(index, seed) {
  return fract(Math.sin((index + 1) * (seed + 11.17) * 12.9898) * 43758.5453)
}

function NucleonCluster({ element, side }) {
  const neutronCount = Math.max(0, Math.round(element.mass) - element.number)
  const visualScale = element.number <= 2 ? 1.55 : element.number <= 10 ? 1.08 : 0.82
  return <NuclearDensityCluster protons={element.number} neutrons={neutronCount} scale={visualScale} seed={side === 'left' ? 3 : 17} collective={element.number > 2} />
}

function OrbitalProbabilityCloud({ shells, side, polarized = false }) {
  const shift = polarized ? (side === 'left' ? 0.08 : -0.16) : 0
  return <OrbitalProbabilityLayers shells={shells} scale={0.58} seed={side === 'left' ? 23 : 47} polarizationShift={shift} />
}

function AtomProbabilityModel({ atom, shells, position, side, polarized }) {
  const element = elementBySymbol[atom.symbol]
  const group = useRef()
  useFrame(({ clock }, delta) => {
    if (!group.current) return
    const vibration = Math.sin(clock.elapsedTime * 2.35 + (side === 'left' ? 0 : Math.PI)) * 0.012
    group.current.position.lerp(new THREE.Vector3(position + vibration, 0, 0), Math.min(1, delta * 3.2))
  })
  return (
    <group ref={group} position={[position, 0, 0]}>
      <NucleonCluster element={element} side={side} />
      <OrbitalProbabilityCloud shells={shells} side={side} polarized={polarized} />
    </group>
  )
}

function bondCloudData(order, length) {
  const positions = []
  const colors = []
  const pointsPerBond = 260
  for (let bond = 0; bond < order; bond += 1) {
    const offset = order === 1 ? 0 : (bond - (order - 1) / 2) * 0.18
    for (let index = 0; index < pointsPerBond; index += 1) {
      const t = seeded(index, 67 + bond * 13)
      const angle = seeded(index, 83 + bond) * Math.PI * 2
      const envelope = Math.sin(Math.PI * t)
      const radius = (0.025 + seeded(index, 97 + bond) * 0.16) * envelope
      positions.push((t - 0.5) * length, offset + Math.cos(angle) * radius, Math.sin(angle) * radius)
      const color = new THREE.Color(index % 4 ? '#b9f4ff' : '#ffe477')
      colors.push(color.r, color.g, color.b)
    }
  }
  return { positions: new Float32Array(positions), colors: new Float32Array(colors) }
}

function EnergyBondVolume({ length, offset }) {
  return (
    <group position={[0, offset, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[0.055, 0.055, length * 0.78, 20, 28]} />
        <meshPhysicalMaterial color="#c6f7ff" emissive="#72dfff" emissiveIntensity={0.4} roughness={0.1} transparent opacity={0.11} transmission={0.28} thickness={0.24} clearcoat={1} depthWrite={false} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.13, 0.13, length * 0.82, 24, 32, true]} />
        <ElectronDensityMaterial color="#9deaff" opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function CovalentDensity({ profile, leftX, rightX, phase }) {
  const group = useRef()
  const material = useRef()
  const length = rightX - leftX
  const data = useMemo(() => bondCloudData(profile.bondOrder, length), [length, profile.bondOrder])
  const centerShift = profile.pull === 'right' ? 0.16 : 0
  const offsets = profile.bondOrder === 1 ? [0] : profile.bondOrder === 2 ? [-0.11, 0.11] : [-0.17, 0, 0.17]

  useFrame(({ clock }, delta) => {
    if (group.current) group.current.rotation.x += delta * 0.34
    if (material.current) material.current.opacity = (phase === 1 ? 0.38 : 0.62) + Math.sin(clock.elapsedTime * 3.1) * 0.07
  })

  return (
    <group ref={group} position={[(leftX + rightX) / 2 + centerShift, 0, 0]}>
      {phase === 2 && offsets.map((offset, index) => (
        <EnergyBondVolume key={`${offset}-${index}`} length={length} offset={offset} />
      ))}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={material} vertexColors size={phase === 1 ? 0.035 : 0.05} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <pointLight color="#92eaff" intensity={phase === 2 ? 1.3 : 0.7} distance={3.2} />
    </group>
  )
}

function TransferElectron({ index, count, leftX, rightX }) {
  const electron = useRef()
  useFrame(({ clock }) => {
    if (!electron.current) return
    const t = (clock.elapsedTime * 0.34 + index / count) % 1
    electron.current.position.x = THREE.MathUtils.lerp(leftX + 0.36, rightX - 0.36, t)
    electron.current.position.y = Math.sin(t * Math.PI) * (0.48 + index * 0.13)
    electron.current.position.z = (index - (count - 1) / 2) * 0.16
  })
  return (
    <mesh ref={electron}>
      <sphereGeometry args={[0.075, 20, 20]} />
      <meshBasicMaterial color="#ffe36d" toneMapped={false} />
      <pointLight color="#ffe36d" intensity={0.7} distance={1.2} />
    </mesh>
  )
}

function IonicInteraction({ profile, phase, leftX, rightX }) {
  if (phase === 1) {
    return (
      <group>
        {Array.from({ length: profile.transferElectrons }, (_, index) => <TransferElectron key={index} index={index} count={profile.transferElectrons} leftX={leftX} rightX={rightX} />)}
        <ScientificSparkles count={28} scale={[rightX - leftX, 1.3, 1]} size={2.2} speed={0.65} opacity={0.55} color="#ffe36d" />
      </group>
    )
  }
  if (phase !== 2) return null
  return (
    <group>
      <mesh position={[leftX, 0, 0]}><sphereGeometry args={[0.63, 36, 36]} /><meshBasicMaterial color="#ffb08f" transparent opacity={0.075} side={THREE.BackSide} blending={THREE.AdditiveBlending} /></mesh>
      <mesh position={[rightX, 0, 0]}><sphereGeometry args={[0.78, 36, 36]} /><meshBasicMaterial color="#8ee8ff" transparent opacity={0.085} side={THREE.BackSide} blending={THREE.AdditiveBlending} /></mesh>
      <ScientificSparkles count={38} scale={[rightX - leftX, 1.4, 1.4]} size={1.8} speed={0.28} opacity={0.4} color="#b9f4ff" />
    </group>
  )
}

function QuantumScene({ profile, phase, leftShells, rightShells }) {
  const positions = phase === 0 ? [-2.1, 2.1] : phase === 1 ? [-1.35, 1.35] : profile.kind === 'ionic' ? [-1.08, 1.08] : [-0.78, 0.78]
  const polarized = phase > 0 && profile.kind === 'polar-covalent'
  return (
    <>
      <CinematicLighting mood="cool" intensity={1.02} />
      <AdaptiveCamera />
      <AtomProbabilityModel key={`${profile.id}-left-${leftShells.join('-')}`} atom={profile.left} shells={leftShells} position={positions[0]} side="left" polarized={polarized} />
      <AtomProbabilityModel key={`${profile.id}-right-${rightShells.join('-')}`} atom={profile.right} shells={rightShells} position={positions[1]} side="right" polarized={polarized} />
      {profile.kind === 'ionic'
        ? <IonicInteraction profile={profile} phase={phase} leftX={positions[0]} rightX={positions[1]} />
        : phase > 0 && <CovalentDensity profile={profile} phase={phase} leftX={positions[0]} rightX={positions[1]} />}
      <ScientificSparkles count={42} scale={[8, 5, 5]} size={1.1} speed={0.18} opacity={0.22} color="#9be8ff" />
      <OrbitControls enablePan={false} minDistance={4.4} maxDistance={10} autoRotate autoRotateSpeed={0.18} target={[0, 0, 0]} />
    </>
  )
}

function AdaptiveCamera() {
  const { camera, size } = useThree()
  useEffect(() => {
    camera.position.z = size.width / Math.max(1, size.height) > 1.55 ? 4.65 : 5.9
    camera.updateProjectionMatrix()
  }, [camera, size.height, size.width])
  return null
}

export function QuantumBondStage({ profile, phase, leftShells, rightShells }) {
  const partial = phase === 2 && profile.kind === 'polar-covalent'
  const ionic = phase === 2 && profile.kind === 'ionic'
  const phaseName = ['separate neutral atoms', 'electric interaction', 'stable lower-energy arrangement'][phase]
  return (
    <div className={`quantum-bond-stage phase-${phase} ${profile.kind}`} role="img" aria-label={`${profile.title}, ${phaseName}. ${profile.phases[phase]}`}>
      <ScientificCanvas id="bond-shell-microscope" exposure={1.08} bloom={{ strength: .32, radius: .28, threshold: .62 }} camera={{ position: [0, 0.3, 5.9], fov: 43 }} dpr={[1, 1.45]}>
        <color attach="background" args={['#04171f']} />
        <fog attach="fog" args={['#04171f', 8.5, 14]} />
        <QuantumScene profile={profile} phase={phase} leftShells={leftShells} rightShells={rightShells} />
      </ScientificCanvas>
      <div className="quantum-atom-label left"><strong>{profile.left.symbol}</strong><small>{elementBySymbol[profile.left.symbol].number} protons</small></div>
      <div className="quantum-atom-label right"><strong>{profile.right.symbol}</strong><small>{elementBySymbol[profile.right.symbol].number} protons</small></div>
      {(partial || ionic) && <div className="quantum-charge left">{partial ? 'δ+' : profile.left.charge}</div>}
      {(partial || ionic) && <div className="quantum-charge right">{partial ? 'δ−' : profile.right.charge}</div>}
      <div className="quantum-scale-note">Occupied subshell density and nuclei enlarged · distance compressed</div>
    </div>
  )
}
