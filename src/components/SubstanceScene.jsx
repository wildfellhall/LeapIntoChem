import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { MoleculeModel } from './ScienceScenes'
import { CinematicLighting, ScientificCanvas, ScientificSparkles } from './ScientificCanvas.jsx'

const cubicCrystalFormulas = new Set(['NaCl', 'KCl', 'LiF', 'KI', 'NaF', 'NaBr', 'NaI'])

const substanceProfiles = {
  H2O: { color: '#e2f7fa', secondary: '#ffffff', label: 'clear, colorless liquid', ior: 1.333, opticallyClear: true },
  CO2: { color: '#b7e6ff', secondary: '#effaff', label: 'colorless carbon dioxide gas', ior: 1.0 },
  NH3: { color: '#c6e8ff', secondary: '#f1fbff', label: 'colorless, pungent ammonia gas', ior: 1.0 },
  CH4: { color: '#b8dcff', secondary: '#eff8ff', label: 'colorless methane gas', ior: 1.0 },
  H2O2: { color: '#a9d9f0', secondary: '#eaf9ff', label: 'clear, slightly blue hydrogen peroxide liquid', ior: 1.406 },
  CaCO3: { color: '#e7e3d5', secondary: '#fffdf4', label: 'white calcium carbonate mineral solid', ior: 1.59 },
  SO2: { color: '#bbd8e8', secondary: '#effaff', label: 'colorless, pungent sulfur dioxide gas', ior: 1.0 },
  C3H8: { color: '#a9d4f1', secondary: '#eef9ff', label: 'colorless propane gas', ior: 1.0 },
  Br2: { color: '#7e2e1e', secondary: '#d56b3f', label: 'dense red-brown liquid', ior: 1.66 },
  I2: { color: '#4b325f', secondary: '#aa78c4', label: 'dark molecular crystal', ior: 1.5 },
  CuSO4: { color: '#2489ce', secondary: '#8dd5ff', label: 'blue ionic crystal', ior: 1.52 },
  KMnO4: { color: '#5b1b80', secondary: '#d778ff', label: 'deep-purple ionic crystal', ior: 1.55 },
  Fe2O3: { color: '#9d3828', secondary: '#dc7552', label: 'red-brown oxide solid', ior: 1.7 },
  Fe3O4: { color: '#252c2e', secondary: '#58646a', label: 'black magnetic solid', ior: 1.8 },
  CuO: { color: '#202526', secondary: '#555f61', label: 'black oxide solid', ior: 1.8 },
  Cu2O: { color: '#a13a25', secondary: '#e47e54', label: 'red copper oxide solid', ior: 1.7 },
  MgO: { color: '#e9ede8', secondary: '#ffffff', label: 'fine white refractory powder', ior: 1.74 },
  CaO: { color: '#e5e1d1', secondary: '#fffdf1', label: 'white-to-gray quicklime solid', ior: 1.84 },
  Al2O3: { color: '#e9eef3', secondary: '#ffffff', label: 'hard colorless ceramic solid', ior: 1.76 },
  SiO2: { color: '#dcecf1', secondary: '#ffffff', label: 'transparent network crystal', ior: 1.46 },
  NaCl: { color: '#edf5f6', secondary: '#ffffff', label: 'colorless cubic ionic crystal', ior: 1.54 },
  KCl: { color: '#eef4f0', secondary: '#ffffff', label: 'colorless cubic ionic crystal', ior: 1.49 },
  LiF: { color: '#e8f7ef', secondary: '#ffffff', label: 'colorless ionic crystal', ior: 1.39 },
  P4: { color: '#fff2c4', secondary: '#fffbe9', label: 'waxy molecular solid', ior: 1.62 },
  O3: { color: '#6da8d9', secondary: '#b9e3ff', label: 'pale-blue reactive gas', ior: 1.0 },
  NO2: { color: '#a4482e', secondary: '#e5966f', label: 'reddish-brown gas', ior: 1.0 },
  Cl2: { color: '#c5d63b', secondary: '#e9f19b', label: 'green-yellow gas', ior: 1.0 },
  HF: { color: '#c9efff', secondary: '#f3fcff', label: 'colorless hydrogen fluoride gas', ior: 1.0 },
  HBr: { color: '#d7e7ee', secondary: '#f8fcff', label: 'colorless hydrogen bromide gas', ior: 1.0 },
  HI: { color: '#d8d0e3', secondary: '#faf7ff', label: 'colorless hydrogen iodide gas', ior: 1.0 },
  BF3: { color: '#c3e8f3', secondary: '#f1fbff', label: 'colorless boron trifluoride gas', ior: 1.0 },
  BCl3: { color: '#d0e6e7', secondary: '#f7ffff', label: 'colorless boron trichloride gas', ior: 1.0 },
  BBr3: { color: '#e1c5ab', secondary: '#fff5ea', label: 'colorless-to-faint-amber dense liquid', ior: 1.5 },
  BI3: { color: '#d2b7d9', secondary: '#f5eafa', label: 'pale moisture-sensitive molecular solid', ior: 1.62 },
  SiF4: { color: '#c7eaf4', secondary: '#f3fcff', label: 'colorless silicon tetrafluoride gas', ior: 1.0 },
  SiCl4: { color: '#e4f1f1', secondary: '#ffffff', label: 'clear volatile silicon tetrachloride liquid', ior: 1.41, opticallyClear: true },
  SiBr4: { color: '#d5b798', secondary: '#f9e7d2', label: 'colorless-to-pale-yellow silicon tetrabromide liquid', ior: 1.57 },
  SiI4: { color: '#d8c3e4', secondary: '#f7effb', label: 'colorless crystalline silicon tetraiodide solid', ior: 1.7 },
  B2O3: { color: '#e6edf0', secondary: '#ffffff', label: 'colorless glassy boron trioxide solid', ior: 1.46 },
  P4O10: { color: '#f2f1ea', secondary: '#ffffff', label: 'white hygroscopic phosphorus pentoxide solid', ior: 1.52 },
  PF3: { color: '#c8e4ec', secondary: '#f4fcff', label: 'colorless phosphorus trifluoride gas', ior: 1.0 },
  PBr3: { color: '#e2cbb5', secondary: '#fff5e9', label: 'colorless-to-pale phosphorus tribromide liquid', ior: 1.7 },
  PI3: { color: '#9f473f', secondary: '#dc8175', label: 'dark-red phosphorus triiodide solid', ior: 1.7 },
}

function profileFor(compound, appearance) {
  const specific = substanceProfiles[compound.formula]
  if (specific) return { ...specific, label: appearance || specific.label }
  return {
    color: compound.state === 'gas' ? '#99d9ff' : compound.state === 'liquid' ? '#75c8d2' : compound.state === 'crystal' ? '#dcebe7' : '#b8c8c2',
    secondary: compound.state === 'gas' ? '#e5f8ff' : '#f4fffb',
    label: appearance || `${compound.state} sample near room conditions`,
    ior: compound.state === 'gas' ? 1 : 1.48,
  }
}

function StudioLights() {
  return (
    <>
      <CinematicLighting mood="neutral" intensity={1.28} target={[0, -.2, 0]} shadows />
      <spotLight position={[0, 5.5, -1]} intensity={7.5} angle={.38} penumbra={1} decay={2} color="#fff6db" />
      <pointLight position={[0, -.5, 2.8]} intensity={3.8} distance={7} decay={2} color="#9eefff" />
    </>
  )
}

function Stage({ color = '#263b3d' }) {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.7, 0]} receiveShadow>
        <circleGeometry args={[5.5, 64]} />
        <meshPhysicalMaterial color={color} roughness={0.26} metalness={0.18} clearcoat={0.72} clearcoatRoughness={.12} />
      </mesh>
      <mesh position={[0, -1.67, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 3.6, 64]} />
        <meshBasicMaterial color="#a7d4d3" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, .5, -3.15]}>
        <planeGeometry args={[11, 7]} />
        <meshPhysicalMaterial color="#173b3f" roughness={.58} emissive="#214f55" emissiveIntensity={.14} />
      </mesh>
    </>
  )
}

function GlassVessel({ children, liquidColor, ior = 1.33, fill = true, opticallyClear = false }) {
  return (
    <group position={[0, -0.2, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[1.58, 1.4, 2.55, 64, 1, true]} />
        <meshPhysicalMaterial color="#f4fdff" emissive="#91cbd1" emissiveIntensity={0.08} roughness={0.035} transmission={0.34} thickness={0.18} ior={1.46} transparent opacity={0.4} side={THREE.DoubleSide} clearcoat={1} clearcoatRoughness={.02} attenuationColor="#e9fdff" attenuationDistance={3.8} />
        <mesh scale={[1.012, 1.008, 1.012]}>
          <cylinderGeometry args={[1.58, 1.4, 2.55, 64, 1, true]} />
          <meshBasicMaterial color="#e8fcff" transparent opacity={.075} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      </mesh>
      {[-.4, .27].map((theta, index) => (
        <mesh key={`glass-highlight-${index}`} position={[0, 0, 0]}>
          <cylinderGeometry args={[1.605, 1.425, 2.28, 12, 1, true, theta, index ? .075 : .14]} />
          <meshBasicMaterial color="#e8fbff" transparent opacity={index ? .022 : .04} side={THREE.DoubleSide} depthWrite={false} toneMapped />
        </mesh>
      ))}
      <mesh position={[0, -1.25, 0]}>
        <cylinderGeometry args={[1.39, 1.39, 0.08, 64]} />
        <meshPhysicalMaterial color="#e7fbff" emissive="#74c9d6" emissiveIntensity={0.18} transmission={0.18} thickness={0.3} roughness={0.06} transparent opacity={0.72} clearcoat={1} />
      </mesh>
      <mesh position={[0, 1.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.58, 0.045, 16, 80]} />
        <meshPhysicalMaterial color="#f2feff" emissive="#a2e8f1" emissiveIntensity={0.28} metalness={0.04} roughness={0.045} transmission={0.16} clearcoat={1} />
      </mesh>
      {fill && (
        <>
          <mesh position={[0, -0.57, 0]}>
            <cylinderGeometry args={[1.35, 1.32, 1.35, 64]} />
            <meshPhysicalMaterial color={liquidColor} emissive={liquidColor} emissiveIntensity={opticallyClear ? .045 : .24} roughness={0.08} transmission={opticallyClear ? .62 : .3} thickness={0.95} ior={ior} transparent opacity={opticallyClear ? .48 : .76} clearcoat={0.82} clearcoatRoughness={.04} attenuationColor={liquidColor} attenuationDistance={opticallyClear ? 4.8 : 1.55} />
          </mesh>
          <mesh position={[0, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.34, 64]} />
            <meshPhysicalMaterial color={liquidColor} emissive="#d9f8ff" emissiveIntensity={opticallyClear ? .08 : .28} roughness={0.025} transmission={opticallyClear ? .56 : .22} transparent opacity={opticallyClear ? .54 : .86} clearcoat={1} clearcoatRoughness={.02} />
            <mesh position={[0, 0, .018]}>
              <ringGeometry args={[1.08, 1.33, 64]} />
              <meshBasicMaterial color="#e8fdff" transparent opacity={.18} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
            </mesh>
          </mesh>
        </>
      )}
      {children}
    </group>
  )
}

const ensemblePositions = [
  [-0.72,-0.65,0.3],[0.58,-0.48,-0.22],[-0.38,-0.05,-0.48],[0.52,0.05,0.38],
  [-0.74,0.56,-0.1],[0.65,0.7,0.02],[0,-0.78,-0.52],[0.03,0.7,0.5],
]

function DriftingMolecule({ formula, position, index, gas = false }) {
  const group = useRef()
  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.elapsedTime
    group.current.rotation.x = t * (0.12 + index * 0.014)
    group.current.rotation.y = t * (0.17 + index * 0.011)
    group.current.position.y = position[1] + Math.sin(t * (gas ? 0.8 : 0.35) + index * 1.7) * (gas ? 0.24 : 0.06)
    if (gas) group.current.position.x = position[0] + Math.sin(t * 0.45 + index) * 0.18
  })
  return <group ref={group} position={position} scale={gas ? 0.32 : 0.22}><MoleculeModel formula={formula} density={false} /></group>
}

function LiquidSample({ compound, profile }) {
  return (
    <GlassVessel liquidColor={profile.color} ior={profile.ior} opticallyClear={profile.opticallyClear}>
      {ensemblePositions.slice(0, 7).map((position, index) => <DriftingMolecule key={index} formula={compound.formula} position={[position[0], position[1] - .35, position[2]]} index={index} />)}
      <ScientificSparkles count={28} scale={[2.2, 1.2, 2.2]} position={[0,-.5,0]} size={0.9} speed={0.18} opacity={0.34} color={profile.secondary} />
    </GlassVessel>
  )
}

function GasSample({ compound, profile, reaction }) {
  return (
    <group>
      <GlassVessel liquidColor={profile.color} ior={1} fill={false}>
        {ensemblePositions.map((position, index) => <DriftingMolecule key={index} formula={compound.formula} position={[position[0] * 1.15, position[1] * 1.4, position[2]]} index={index} gas />)}
      </GlassVessel>
      <ScientificSparkles count={reaction?.visual === 'flame' ? 75 : 28} scale={[3.1, 3.1, 3.1]} size={reaction?.visual === 'flame' ? 3 : 1.2} speed={reaction?.visual === 'flame' ? 1.1 : 0.35} color={reaction?.flameColor || profile.secondary} />
    </group>
  )
}

function CrystalSample({ compound, profile }) {
  const cubic = cubicCrystalFormulas.has(compound.formula)
  const crystals = useMemo(() => Array.from({ length: 22 }, (_, index) => {
    const angle = index * 2.399963
    const radius = Math.sqrt(index / 22) * 1.15
    return {
      position: [Math.cos(angle) * radius, -1.13 + (index % 5) * .11, Math.sin(angle) * radius * .7],
      rotation: [index * .31, index * .57, index * .19],
      size: .18 + (index % 4) * .035,
    }
  }), [])
  return (
    <GlassVessel liquidColor={profile.color} fill={false}>
      {crystals.map((item, index) => (
        <mesh key={index} position={item.position} rotation={item.rotation} castShadow>
          {cubic ? <boxGeometry args={[item.size * 1.25, item.size, item.size * 1.12]} /> : <octahedronGeometry args={[item.size * 1.35, 0]} />}
          <meshPhysicalMaterial color={index % 4 ? profile.color : profile.secondary} emissive={profile.color} emissiveIntensity={cubic ? .12 : .07} roughness={cubic ? .1 : .18} metalness={.015} transmission={cubic ? .1 : .08} thickness={.52} transparent opacity={.96} clearcoat={1} clearcoatRoughness={.05} attenuationColor={profile.color} attenuationDistance={.8} />
          <mesh scale={1.055}>
            {cubic ? <boxGeometry args={[item.size * 1.25, item.size, item.size * 1.12]} /> : <octahedronGeometry args={[item.size * 1.35, 0]} />}
            <meshBasicMaterial color={profile.secondary} transparent opacity={.14} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        </mesh>
      ))}
    </GlassVessel>
  )
}

function QuartzSample({ profile }) {
  const crystals = [
    { p: [-.45,-.75,.1], r: [-.12,0,.18], h: 1.35, w: .31 },
    { p: [.12,-.88,.2], r: [.08,.25,-.12], h: 1.05, w: .27 },
    { p: [.52,-.92,-.15], r: [-.08,-.4,.16], h: .88, w: .24 },
    { p: [-.02,-1.05,-.38], r: [.18,.2,.3], h: .72, w: .22 },
  ]
  return (
    <group>
      {crystals.map((crystal, index) => (
        <group key={index} position={crystal.p} rotation={crystal.r}>
          <mesh castShadow>
            <cylinderGeometry args={[crystal.w, crystal.w, crystal.h, 6]} />
            <meshPhysicalMaterial color={profile.color} emissive={profile.secondary} emissiveIntensity={.08} roughness={.045} transmission={.46} thickness={1.1} ior={profile.ior} transparent opacity={.9} clearcoat={1} clearcoatRoughness={.03} attenuationColor={profile.color} attenuationDistance={1.3} />
          </mesh>
          <mesh position={[0, crystal.h / 2 + crystal.w * .42, 0]}>
            <coneGeometry args={[crystal.w, crystal.w * .85, 6]} />
            <meshPhysicalMaterial color={profile.secondary} emissive="#ffffff" emissiveIntensity={.08} roughness={.035} transmission={.44} thickness={.8} ior={profile.ior} transparent opacity={.92} clearcoat={1} clearcoatRoughness={.025} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function SurfaceOxideSample({ compound, profile }) {
  const metal = compound.formula === 'Fe2O3'
    ? { color: '#667077', roughness: .38 }
    : compound.formula === 'CuO'
      ? { color: '#b66637', roughness: .24 }
      : { color: '#bfc8cc', roughness: .18 }
  const protectiveFilm = compound.formula === 'Al2O3'
  const scale = useMemo(() => Array.from({ length: protectiveFilm ? 36 : 92 }, (_, index) => {
    const angle = index * 2.399963
    const radius = Math.sqrt((index + 1) / (protectiveFilm ? 36 : 92)) * 1.42
    return {
      position: [Math.cos(angle) * radius, -.49 + (index % 7) * .012, Math.sin(angle) * radius * .74],
      rotation: [index * .39, index * .71, index * .23],
      size: protectiveFilm ? .19 : .09 + (index % 5) * .022,
    }
  }), [protectiveFilm])
  return (
    <group>
      <mesh position={[0,-.73,0]} castShadow>
        <cylinderGeometry args={[1.52,1.52,.42,72]} />
        <meshPhysicalMaterial color={metal.color} metalness={.82} roughness={metal.roughness} clearcoat={.42} />
      </mesh>
      <mesh position={[0,-.5,0]}>
        <cylinderGeometry args={[1.43,1.43,.055,72]} />
        <meshPhysicalMaterial color={protectiveFilm ? '#dce9ee' : profile.color} roughness={protectiveFilm ? .08 : .72} metalness={0} transmission={protectiveFilm ? .64 : 0} thickness={protectiveFilm ? .12 : .4} transparent={protectiveFilm} opacity={protectiveFilm ? .42 : .98} clearcoat={protectiveFilm ? 1 : .08} />
      </mesh>
      {scale.map((flake, index) => (
        <mesh key={index} position={flake.position} rotation={flake.rotation} castShadow>
          {protectiveFilm ? <circleGeometry args={[flake.size, 12]} /> : <dodecahedronGeometry args={[flake.size, 0]} />}
          <meshPhysicalMaterial color={index % 4 === 0 ? profile.secondary : profile.color} roughness={protectiveFilm ? .08 : .8} transmission={protectiveFilm ? .5 : 0} transparent={protectiveFilm} opacity={protectiveFilm ? .2 : .95} />
        </mesh>
      ))}
    </group>
  )
}

function PowderOrSolidSample({ compound, profile }) {
  const grains = useMemo(() => Array.from({ length: 58 }, (_, index) => {
    const angle = index * 2.399963
    const radius = Math.sqrt(index / 58) * 1.35
    return [Math.cos(angle) * radius, -1.26 + (index % 7) * .075, Math.sin(angle) * radius * .72]
  }), [])
  return (
    <GlassVessel liquidColor={profile.color} fill={false}>
      {grains.map((position, index) => (
        <mesh key={index} position={position} rotation={[index, index * .4, 0]} castShadow>
          <dodecahedronGeometry args={[.11 + (index % 4) * .018, 0]} />
          <meshPhysicalMaterial color={index % 3 ? profile.color : profile.secondary} emissive={profile.color} emissiveIntensity={.06} roughness={0.54} metalness={compound.formula.startsWith('Fe') || compound.formula.startsWith('Cu') ? .18 : 0} clearcoat={.22} />
        </mesh>
      ))}
    </GlassVessel>
  )
}

function ReactionEnergy({ reaction }) {
  const sparks = useRef()
  useFrame(({ clock }) => {
    if (sparks.current) sparks.current.rotation.y = clock.elapsedTime * 0.32
  })
  if (!reaction || reaction.energy === 'low') return null
  const color = reaction.flameColor || (reaction.visual === 'white-flare' ? '#ffffff' : '#ffb35e')
  return <group ref={sparks}><ScientificSparkles count={reaction.energy === 'intense' ? 100 : 55} scale={[4,3.2,4]} size={reaction.energy === 'intense' ? 4.2 : 2.6} speed={1.4} opacity={0.75} color={color} /></group>
}

export function SubstanceScene({ compound, reaction = null, className = '' }) {
  const profile = profileFor(compound, reaction?.appearance)
  const state = reaction?.productState || compound.state
  const isCrystal = state === 'crystal'
  const isSurface = reaction?.visual === 'surface'
  const isQuartz = compound.formula === 'SiO2' && !reaction
  const scaleLabel = state === 'gas' || state === 'vapor' || state.includes?.('gas') || state === 'liquid'
    ? 'bulk phase · molecular scale enlarged'
    : 'macroscopic material sample'
  return (
    <div className={`science-canvas substance-canvas ${className}`} role="img" aria-label={`Bulk ${compound.name} simulation: ${profile.label}`}>
      <ScientificCanvas id="substance-simulator" exposure={1.18} bloom={{ strength: .14, radius: .18, threshold: .8 }} shadows camera={{ position: [0, .85, 5.75], fov: 42 }} dpr={[1, 1.45]}>
        <color attach="background" args={['#10282b']} />
        <fog attach="fog" args={['#10282b', 7.5, 13]} />
        <StudioLights />
        <Stage />
        {isSurface ? <SurfaceOxideSample compound={compound} profile={profile} />
          : state.includes?.('gas') || state === 'gas' || state === 'vapor' ? <GasSample compound={compound} profile={profile} reaction={reaction} />
          : state === 'liquid' ? <LiquidSample compound={compound} profile={profile} />
            : isCrystal ? <CrystalSample compound={compound} profile={profile} />
              : isQuartz ? <QuartzSample profile={profile} />
              : <PowderOrSolidSample compound={compound} profile={profile} />}
        <ReactionEnergy reaction={reaction} />
        <OrbitControls enablePan={false} minDistance={4.2} maxDistance={9} autoRotate autoRotateSpeed={0.42} target={[0,-.15,0]} />
      </ScientificCanvas>
      <div className="substance-label"><span className="live-dot" /><strong>{profile.label}</strong><small>{scaleLabel}</small></div>
      <div className="substance-formula">{compound.formula}</div>
    </div>
  )
}
