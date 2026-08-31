import { useFrame } from '@react-three/fiber'
import { Float, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import MeshBasicNodeMaterial from 'three/src/materials/nodes/MeshBasicNodeMaterial.js'
import { color as tslColor, float, Fn, mix as tslMix } from 'three/src/nodes/tsl/TSLBase.js'
import { normalLocal, normalView } from 'three/src/nodes/accessors/Normal.js'
import { positionLocal, positionViewDirection } from 'three/src/nodes/accessors/Position.js'
import { time } from 'three/src/nodes/utils/Timer.js'
import { hash } from 'three/src/nodes/math/Hash.js'
import { atomColors, parseFormula } from '../data/chemistry'
import { defaultStellarArchetype, stellarArchetypeById } from '../data/stellar'
import { ElectronDensityEnvelope, ElectronDensityMaterial, NuclearDensityCluster, OrbitalProbabilityLayers } from './AtomicStructureLayers.jsx'
import { CinematicLighting, ContourShell, ScientificCanvas, ScientificSparkles } from './ScientificCanvas.jsx'

function Nucleus({ protons, neutrons, scale = 1 }) {
  return <NuclearDensityCluster protons={protons} neutrons={neutrons} scale={scale} />
}

function SceneLights({ dark = false }) {
  return <CinematicLighting mood={dark ? 'cool' : 'neutral'} intensity={dark ? 1.05 : 1.2} />
}

// Compact trilinear value noise for the stellar shader. It uses Three's WGSL/GLSL
// hash primitive and avoids shipping the full MaterialX procedural-noise library.
const stellarValueNoise = Fn(([coordinate]) => {
  const cell = coordinate.floor()
  const fraction = coordinate.fract()
  const curve = fraction.mul(fraction).mul(float(3).sub(fraction.mul(2)))
  const seed = cell.x.add(cell.y.mul(57)).add(cell.z.mul(113)).add(4096)
  const z0 = tslMix(
    tslMix(hash(seed), hash(seed.add(1)), curve.x),
    tslMix(hash(seed.add(57)), hash(seed.add(58)), curve.x),
    curve.y,
  )
  const z1 = tslMix(
    tslMix(hash(seed.add(113)), hash(seed.add(114)), curve.x),
    tslMix(hash(seed.add(170)), hash(seed.add(171)), curve.x),
    curve.y,
  )
  return tslMix(z0, z1, curve.z)
})

export function AtomScene({ element, neutrons, className = '' }) {
  return (
    <div className={`science-canvas ${className}`} role="img" aria-label={`3D occupied-subshell probability model of ${element.name}`}>
      <ScientificCanvas id="atom-studio" bloom={{ strength: .34, radius: .25, threshold: .58 }} camera={{ position: [0, 0.55, 5.65], fov: 44 }} dpr={[1, 1.45]}>
        <color attach="background" args={['#071b20']} />
        <fog attach="fog" args={['#071b20', 7, 14]} />
        <SceneLights dark />
        <Float speed={1.4} rotationIntensity={0.18} floatIntensity={0.28} scale={1.12}>
          <Nucleus protons={element.number} neutrons={neutrons} />
          <OrbitalProbabilityLayers shells={element.shells} scale={0.82} seed={element.number} />
        </Float>
        <ScientificSparkles count={38} scale={8} size={1.4} speed={0.25} opacity={0.32} color="#a8e9ff" />
        <OrbitControls enablePan={false} minDistance={3.8} maxDistance={10} autoRotate autoRotateSpeed={0.45} />
      </ScientificCanvas>
      <div className="canvas-badge"><span className="live-dot" /> drag to inspect · occupied s/p/d/f probability layers</div>
    </div>
  )
}

function Bond({ start, end, color = '#b8f9de', order = 1 }) {
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
  const direction = new THREE.Vector3().subVectors(end, start)
  const length = direction.length()
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize())
  const offsets = order === 3 ? [-.075, 0, .075] : order === 2 ? [-.05, .05] : [0]
  return <group position={midpoint} quaternion={quaternion}>{offsets.map((offset, index) => (
    <group key={index} position={[offset, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[order > 1 ? .035 : .052, order > 1 ? .035 : .052, length, 12]} />
        <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.24} roughness={0.14} metalness={0.08} clearcoat={1} clearcoatRoughness={.08} />
        <mesh scale={[1.18, 1.005, 1.18]}>
          <cylinderGeometry args={[order > 1 ? .035 : .052, order > 1 ? .035 : .052, length, 12]} />
          <meshBasicMaterial color="#d7fbff" transparent opacity={.12} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      </mesh>
      <mesh>
        <cylinderGeometry args={[order > 1 ? .085 : .12, order > 1 ? .085 : .12, length * .82, 22, 8, true]} />
        <ElectronDensityMaterial color="#a6ecff" opacity={order > 1 ? 0.075 : 0.09} side={THREE.DoubleSide} />
      </mesh>
    </group>
  ))}</group>
}

export function MoleculeModel({ formula, density = true }) {
  const composition = useMemo(() => parseFormula(formula), [formula])
  const structure = useMemo(() => molecularStructure(formula, composition), [formula, composition])
  const { atoms, bonds } = structure

  return (
    <group rotation={[0.18, 0.3, 0]}>
      {bonds.map((bond, index) => <Bond key={`bond-${index}`} start={atoms[bond[0]].position} end={atoms[bond[1]].position} order={bond[2] || 1} />)}
      {atoms.map((atom, index) => {
        const radius = atom.symbol === 'H' ? 0.28 : 0.38
        return (
          <Float key={`${atom.symbol}-${index}`} speed={1.4 + index * 0.02} floatIntensity={0.1}>
            <mesh position={atom.position}>
              <sphereGeometry args={[radius, 32, 32]} />
              <meshPhysicalMaterial color={atomColors[atom.symbol] || '#78c9a1'} roughness={0.14} metalness={0.04} clearcoat={1} clearcoatRoughness={0.06} sheen={.26} sheenColor="#ffffff" emissive={atomColors[atom.symbol] || '#78c9a1'} emissiveIntensity={0.18} />
              <ContourShell radius={radius} color={atom.symbol === 'C' ? '#b9e5df' : atomColors[atom.symbol] || '#b9ffe5'} opacity={atom.symbol === 'C' ? .2 : .1} scale={1.065} />
              {density && <ElectronDensityEnvelope radius={radius * 1.28} color={atomColors[atom.symbol] || '#9eeaff'} opacity={0.09} />}
            </mesh>
          </Float>
        )
      })}
    </group>
  )
}

function molecularStructure(formula, composition) {
  const atom = (symbol, position) => ({ symbol, position: new THREE.Vector3(...position) })
  if (formula === 'P4') {
    const atoms = [atom('P',[.72,.72,.72]),atom('P',[-.72,-.72,.72]),atom('P',[-.72,.72,-.72]),atom('P',[.72,-.72,-.72])]
    return { atoms, bonds: [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]] }
  }
  if (formula === 'S8') {
    const atoms = Array.from({ length: 8 }, (_, index) => {
      const angle = index / 8 * Math.PI * 2
      return atom('S', [Math.cos(angle) * 1.05, Math.sin(angle) * 1.05, index % 2 ? .32 : -.32])
    })
    return { atoms, bonds: atoms.map((_, index) => [index, (index + 1) % atoms.length, 1]) }
  }
  if (formula === 'P4O10') {
    const phosphorus = [[.7,.7,.7],[-.7,-.7,.7],[-.7,.7,-.7],[.7,-.7,-.7]]
    const edges = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]
    const atoms = phosphorus.map((point) => atom('P', point))
    edges.forEach(([a,b]) => atoms.push(atom('O', phosphorus[a].map((value, axis) => (value + phosphorus[b][axis]) / 2))))
    phosphorus.forEach((point) => atoms.push(atom('O', point.map((value) => value * 1.72))))
    const bonds = edges.flatMap(([a,b], edgeIndex) => [[a,4 + edgeIndex,1],[b,4 + edgeIndex,1]])
    phosphorus.forEach((_, index) => bonds.push([index,10 + index,2]))
    return { atoms, bonds }
  }
  if (formula === 'HNO3') {
    const atoms = [atom('N',[0,0,0]),atom('O',[-.92,.55,0]),atom('O',[.92,.55,0]),atom('O',[0,-1.02,0]),atom('H',[.02,-1.72,.08])]
    return { atoms, bonds: [[0,1,2],[0,2,1],[0,3,1],[3,4,1]] }
  }
  if (formula === 'H2SO4') {
    const points = [[.78,.78,.78],[-.78,-.78,.78],[-.78,.78,-.78],[.78,-.78,-.78]]
    const atoms = [atom('S',[0,0,0]), ...points.map((point) => atom('O',point)), atom('H',points[2].map((value) => value * 1.62)), atom('H',points[3].map((value) => value * 1.62))]
    return { atoms, bonds: [[0,1,2],[0,2,2],[0,3,1],[0,4,1],[3,5,1],[4,6,1]] }
  }
  if (formula === 'C2H4O2') {
    const atoms = [atom('C',[-.62,0,0]),atom('C',[.24,.08,0]),atom('O',[.82,.72,0]),atom('O',[.9,-.48,0]),atom('H',[1.48,-.25,0]),atom('H',[-1.02,.58,.22]),atom('H',[-1.05,-.48,.3]),atom('H',[-.6,-.18,-.72])]
    return { atoms, bonds: [[0,1],[1,2,2],[1,3],[3,4],[0,5],[0,6],[0,7]] }
  }
  if (formula === 'C4H10') {
    const atoms = [atom('C',[-1.2,-.1,0]),atom('C',[-.4,.2,.08]),atom('C',[.4,-.08,-.08]),atom('C',[1.2,.2,0]),
      atom('H',[-1.6,.42,.2]),atom('H',[-1.53,-.62,.34]),atom('H',[-1.23,-.25,-.72]),
      atom('H',[-.42,.82,.5]),atom('H',[-.42,.35,-.65]),atom('H',[.42,-.7,.5]),atom('H',[.42,-.22,-.72]),
      atom('H',[1.58,.72,.22]),atom('H',[1.58,-.32,.35]),atom('H',[1.22,.32,-.72])]
    return { atoms, bonds: [[0,1],[1,2],[2,3],[0,4],[0,5],[0,6],[1,7],[1,8],[2,9],[2,10],[3,11],[3,12],[3,13]] }
  }
  if (formula === 'C6H12O6') {
    const ringPoints = [[1.0,0,.08],[.48,.84,-.08],[-.5,.82,.08],[-1,0,-.08],[-.48,-.84,.08],[.5,-.82,-.08]]
    const ringSymbols = ['O','C','C','C','C','C']
    const atoms = ringSymbols.map((symbol, index) => atom(symbol, ringPoints[index]))
    atoms.push(atom('C',[1.28,-1.55,.18]))
    const hydroxylParents = [1,2,3,4,6]
    hydroxylParents.forEach((parent, index) => {
      const source = atoms[parent].position
      const direction = source.clone().normalize().multiplyScalar(index === 4 ? .72 : .66)
      atoms.push(atom('O',[source.x + direction.x, source.y + direction.y, source.z + (index % 2 ? .42 : -.42)]))
    })
    const carbonHydrogenParents = [1,2,3,4,5,6,6]
    carbonHydrogenParents.forEach((parent, index) => {
      const source = atoms[parent].position
      const angle = index * 2.399963
      atoms.push(atom('H',[source.x + Math.cos(angle) * .48, source.y + Math.sin(angle) * .48, source.z + (index % 2 ? .55 : -.55)]))
    })
    const oxygenStart = 7
    hydroxylParents.forEach((_, index) => {
      const source = atoms[oxygenStart + index].position
      atoms.push(atom('H',[source.x * 1.23, source.y * 1.23, source.z + (index % 2 ? .42 : -.42)]))
    })
    const bonds = ringPoints.map((_, index) => [index,(index + 1) % 6,1])
    bonds.push([5,6,1])
    hydroxylParents.forEach((parent,index) => bonds.push([parent,oxygenStart + index,1],[oxygenStart + index,19 + index,1]))
    carbonHydrogenParents.forEach((parent,index) => bonds.push([parent,12 + index,1]))
    return { atoms, bonds }
  }
  if (formula === 'H2O2') {
    const atoms = [atom('O', [-.42,0,0]), atom('O',[.42,0,0]), atom('H',[-1.02,.58,.2]), atom('H',[1.02,-.58,-.2])]
    return { atoms, bonds: [[0,1,1],[0,2,1],[1,3,1]] }
  }
  if (formula === 'C3H8') {
    const atoms = [atom('C',[-.82,0,0]),atom('C',[0,.18,0]),atom('C',[.82,0,0]),
      atom('H',[-1.18,.62,.2]),atom('H',[-1.18,-.48,.42]),atom('H',[-.82,-.55,-.5]),
      atom('H',[-.15,.78,.42]),atom('H',[.15,.78,-.42]),
      atom('H',[1.18,.62,-.2]),atom('H',[1.18,-.48,-.42]),atom('H',[.82,-.55,.5])]
    return { atoms, bonds: [[0,1],[1,2],[0,3],[0,4],[0,5],[1,6],[1,7],[2,8],[2,9],[2,10]] }
  }
  if (formula === 'C2H4' || formula === 'C2H2') {
    const hydrogenCount = formula === 'C2H4' ? 4 : 2
    const atoms = [atom('C',[-.52,0,0]),atom('C',[.52,0,0])]
    if (hydrogenCount === 4) atoms.push(atom('H',[-1,.62,0]),atom('H',[-1,-.62,0]),atom('H',[1,.62,0]),atom('H',[1,-.62,0]))
    else atoms.push(atom('H',[-1.2,0,0]),atom('H',[1.2,0,0]))
    return { atoms, bonds: hydrogenCount === 4 ? [[0,1,2],[0,2],[0,3],[1,4],[1,5]] : [[0,1,3],[0,2],[1,3]] }
  }
  if (formula === 'C2H6O') {
    const atoms = [atom('C',[-.58,0,0]),atom('C',[.2,.12,0]),atom('O',[.95,-.08,0]),atom('H',[1.35,.42,0]),
      atom('H',[-.92,.62,.28]),atom('H',[-.98,-.45,.42]),atom('H',[-.58,-.6,-.45]),atom('H',[.22,.7,.42]),atom('H',[.25,-.5,-.42])]
    return { atoms, bonds: [[0,1],[1,2],[2,3],[0,4],[0,5],[0,6],[1,7],[1,8]] }
  }
  const atoms = molecularGeometry(formula, composition)
  const diatomicOrders = { O2: 2, N2: 3, CO: 3, NO: 2 }
  if (atoms.length === 2) return { atoms, bonds: [[0,1,diatomicOrders[formula] || 1]] }
  const multipleBondOrders = {
    CO2: [2,2], SO2: [2,2], SO3: [2,2,2], CS2: [2,2], N2O: [2,2], O3: [1,2], NO2: [1,2],
  }[formula]
  return { atoms, bonds: atoms.slice(1).map((_, index) => [0, index + 1, multipleBondOrders?.[index] || 1]) }
}

function molecularGeometry(formula, composition) {
  const expanded = Object.entries(composition).flatMap(([symbol, count]) => Array.from({ length: Math.min(count, 18) }, () => symbol))
  const atom = (symbol, position) => ({ symbol, position: new THREE.Vector3(...position) })
  const centerFor = {
    H2O: 'O', H2S: 'S', SO2: 'S', NO2: 'N', O3: 'O', CH4: 'C', NH3: 'N',
    CF4: 'C', CCl4: 'C', CHCl3: 'C', PCl3: 'P', PCl5: 'P', SF6: 'S',
    CO2: 'C', CS2: 'C', N2O: 'N', SO3: 'S', HNO3: 'N', H2SO4: 'S',
    BF3: 'B', BCl3: 'B', BBr3: 'B', BI3: 'B', SiF4: 'Si', SiCl4: 'Si', SiBr4: 'Si', SiI4: 'Si',
    PF3: 'P', PBr3: 'P', PI3: 'P',
  }[formula]

  if (expanded.length === 1) return [atom(expanded[0], [0, 0, 0])]
  if (expanded.length === 2) return [atom(expanded[0], [-0.58, 0, 0]), atom(expanded[1], [0.58, 0, 0])]

  const centerIndex = centerFor ? expanded.indexOf(centerFor) : expanded.findIndex((symbol) => symbol !== 'H')
  const central = expanded.splice(Math.max(0, centerIndex), 1)[0]
  const symbols = [central, ...expanded]
  const geometry = [atom(central, [0, 0, 0])]
  const linear = new Set(['CO2', 'CS2', 'N2O'])
  const bent = new Set(['H2O', 'H2S', 'SO2', 'NO2', 'O3'])
  const tetrahedral = new Set(['CH4', 'CF4', 'CCl4', 'CHCl3', 'SiF4', 'SiCl4', 'SiBr4', 'SiI4'])
  const pyramidal = new Set(['NH3', 'PCl3', 'PF3', 'PBr3', 'PI3'])
  const trigonalPlanar = new Set(['BF3', 'BCl3', 'BBr3', 'BI3'])

  if (linear.has(formula)) {
    geometry.push(atom(symbols[1], [-1.05, 0, 0]), atom(symbols[2], [1.05, 0, 0]))
  } else if (bent.has(formula)) {
    const halfAngle = formula === 'H2O' ? THREE.MathUtils.degToRad(52.25) : THREE.MathUtils.degToRad(59.5)
    geometry.push(atom(symbols[1], [-Math.sin(halfAngle), Math.cos(halfAngle), 0]), atom(symbols[2], [Math.sin(halfAngle), Math.cos(halfAngle), 0]))
  } else if (tetrahedral.has(formula)) {
    const points = [[.78,.78,.78],[-.78,-.78,.78],[-.78,.78,-.78],[.78,-.78,-.78]]
    points.forEach((point, index) => symbols[index + 1] && geometry.push(atom(symbols[index + 1], point)))
  } else if (pyramidal.has(formula)) {
    const points = [[1, -.34, 0],[-.5,-.34,.87],[-.5,-.34,-.87]]
    points.forEach((point, index) => symbols[index + 1] && geometry.push(atom(symbols[index + 1], point)))
  } else if (formula === 'SO3' || trigonalPlanar.has(formula)) {
    const points = [[1.05,0,0],[-.52,.91,0],[-.52,-.91,0]]
    points.forEach((point, index) => geometry.push(atom(symbols[index + 1], point)))
  } else if (formula === 'PCl5') {
    const points = [[0,1.1,0],[0,-1.1,0],[1.05,0,0],[-.52,0,.91],[-.52,0,-.91]]
    points.forEach((point, index) => geometry.push(atom(symbols[index + 1], point)))
  } else if (formula === 'SF6') {
    const points = [[1.1,0,0],[-1.1,0,0],[0,1.1,0],[0,-1.1,0],[0,0,1.1],[0,0,-1.1]]
    points.forEach((point, index) => geometry.push(atom(symbols[index + 1], point)))
  } else {
    symbols.slice(1).forEach((symbol, index) => {
      const angle = index * 2.399963
      const ring = 0.92 + Math.floor(index / 8) * 0.58
      const y = ((index % 3) - 1) * 0.46
      geometry.push(atom(symbol, [Math.cos(angle) * ring, y, Math.sin(angle) * ring * 0.72]))
    })
  }
  return geometry
}

export function MoleculeScene({ formula, dark = true, className = '' }) {
  return (
    <div className={`science-canvas molecule-canvas ${className}`} role="img" aria-label={`3D molecular model of ${formula}`}>
      <ScientificCanvas id="molecule-scene" bloom={{ strength: .2, radius: .2, threshold: .72 }} camera={{ position: [0, 1, 5.4], fov: 46 }} dpr={[1, 1.45]}>
        <color attach="background" args={[dark ? '#0a2021' : '#e8fff1']} />
        <SceneLights dark={dark} />
        <MoleculeModel formula={formula} />
        <ScientificSparkles count={30} scale={7} size={1.2} speed={0.2} opacity={0.28} color="#abffe2" />
        <OrbitControls enablePan={false} minDistance={3.5} maxDistance={8} autoRotate autoRotateSpeed={0.7} />
      </ScientificCanvas>
    </div>
  )
}

function StarSurfaceMaterial({ profile, energy }) {
  const material = useMemo(() => {
    const result = new MeshBasicNodeMaterial({ toneMapped: true })
    const drift = .025 + profile.activity * .045
    // Object-space 3D value noise remains continuous across the sphere seam.
    // Giants use fewer, larger convection cells; compact stars use finer structure.
    const coarse = stellarValueNoise(positionLocal.mul(profile.granulation).add(time.mul(drift)))
    const fine = stellarValueNoise(positionLocal.mul(profile.granulation * 6.1).add(time.mul(drift * 3.2)))
    const micro = stellarValueNoise(positionLocal.mul(profile.granulation * 13.6).sub(time.mul(drift * 2.4)))
    const granules = coarse.mul(.25).add(fine.mul(.52)).add(micro.mul(.23)).clamp(0, 1).pow(1.42)
    const limb = normalView.dot(positionViewDirection).abs().pow(0.42)
    const surfaceRadiance = profile.radiance * (.72 + energy * .08)
    result.colorNode = tslMix(tslColor(profile.palette[0]), tslColor(profile.palette[1]), granules.mul(.9).add(.05))
      .mul(float(surfaceRadiance).add(limb.mul(profile.radiance * .7)))
    const surfaceRelief = .012 + profile.activity * .013
    const ripple = fine.sub(.5).mul(surfaceRelief).add(coarse.sub(.5).mul(surfaceRelief * .7))
    result.positionNode = positionLocal.add(normalLocal.mul(ripple))
    return result
  }, [energy, profile])
  useEffect(() => () => material.dispose(), [material])
  return <primitive object={material} attach="material" />
}

function StarCoronaMaterial({ color, opacity = .28, brightness = 1.8, power = 3, turbulence = 1 }) {
  const material = useMemo(() => {
    const result = new MeshBasicNodeMaterial({
      transparent: true,
      toneMapped: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const rim = normalView.dot(positionViewDirection).abs().oneMinus().pow(power)
    const plasma = stellarValueNoise(positionLocal.mul(2.8 * turbulence).add(time.mul(.08 * turbulence))).mul(.5).add(.62)
    result.colorNode = tslColor(color).mul(float(brightness).add(rim.mul(brightness * .55)))
    result.opacityNode = rim.mul(opacity).mul(plasma)
    return result
  }, [brightness, color, opacity, power, turbulence])
  useEffect(() => () => material.dispose(), [material])
  return <primitive object={material} attach="material" />
}

function StarHalo({ color, scale, opacity = .5 }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const context = canvas.getContext('2d')
    const rgb = new THREE.Color(color)
    const channel = (value) => Math.round(THREE.MathUtils.clamp(value, 0, 1) * 255)
    const prefix = `${channel(rgb.r)},${channel(rgb.g)},${channel(rgb.b)}`
    const gradient = context.createRadialGradient(128, 128, 10, 128, 128, 126)
    gradient.addColorStop(0, `rgba(${prefix},.5)`)
    gradient.addColorStop(.28, `rgba(${prefix},.36)`)
    gradient.addColorStop(.52, `rgba(${prefix},.14)`)
    gradient.addColorStop(.78, `rgba(${prefix},.035)`)
    gradient.addColorStop(1, `rgba(${prefix},0)`)
    context.fillStyle = gradient
    context.fillRect(0, 0, 256, 256)
    const result = new THREE.CanvasTexture(canvas)
    result.colorSpace = THREE.SRGBColorSpace
    return result
  }, [color])
  useEffect(() => () => texture.dispose(), [texture])
  return <sprite position={[0,0,-.42]} scale={[scale,scale,1]}><spriteMaterial map={texture} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></sprite>
}

function PulsarJets({ color }) {
  return (
    <group rotation={[0, 0, .22]}>
      {[-1, 1].map((direction) => (
        <group key={direction} position={[0, direction * .34, 0]} rotation={[direction < 0 ? Math.PI : 0, 0, 0]}>
          <mesh position={[0, .96, 0]}>
            <coneGeometry args={[.1, 1.75, 32, 1, true]} />
            <meshBasicMaterial color={color} transparent opacity={.085} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh position={[0, 1.02, 0]}>
            <cylinderGeometry args={[.01, .026, 1.9, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={.38} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function StellarInteriorMaterial({ inner, outer, opacity = 0.22, phase = 0, side = THREE.DoubleSide }) {
  const material = useMemo(() => {
    const result = new MeshBasicNodeMaterial({
      transparent: true,
      toneMapped: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side,
    })
    const circulation = positionLocal.x.mul(5.7).add(time.mul(0.34 + phase * 0.03)).sin()
      .add(positionLocal.y.mul(7.9).sub(time.mul(0.26 + phase * 0.02)).sin())
      .add(positionLocal.z.mul(6.3).add(time.mul(0.19)).sin())
      .mul(0.16).add(0.52).clamp(0, 1)
    const limb = normalView.dot(positionViewDirection).abs().oneMinus().pow(1.7)
    result.colorNode = tslMix(tslColor(inner), tslColor(outer), circulation.mul(0.72).add(0.12))
      .mul(float(0.72).add(limb.mul(0.5)))
    result.opacityNode = float(opacity * 0.58).add(circulation.mul(opacity * 0.42)).add(limb.mul(opacity * 0.18))
    const convection = positionLocal.x.mul(7.1).add(time.mul(0.42)).sin()
      .mul(positionLocal.y.mul(6.4).sub(time.mul(0.31)).sin()).mul(0.012)
    result.positionNode = positionLocal.add(normalLocal.mul(convection))
    return result
  }, [inner, opacity, outer, phase, side])
  useEffect(() => () => material.dispose(), [material])
  return <primitive object={material} attach="material" />
}

function FusionStar({ intensity, stage, starType = defaultStellarArchetype }) {
  const star = useRef()
  const profile = stellarArchetypeById[starType] || stellarArchetypeById[defaultStellarArchetype]
  useFrame(({ clock }) => {
    if (!star.current) return
    const baseScale = profile.displayScale * (stage === 'ready' ? .96 : 1)
    const pulse = baseScale * (1 + Math.sin(clock.elapsedTime * (1.25 + profile.activity * 2.1)) * profile.pulse)
    star.current.scale.setScalar(pulse)
    star.current.rotation.y += .002 + profile.activity * .004
  })
  const prominenceCount = profile.activity > .72 ? 3 : profile.activity > .3 ? 2 : profile.activity > .08 ? 1 : 0
  return (
    <group>
      <StarHalo color={profile.corona} scale={profile.displayScale * (4.25 + profile.wind * .5)} opacity={.42 + profile.bloom * .16} />
      {profile.wind > .35 && <StarHalo color={profile.corona} scale={profile.displayScale * (5.1 + profile.wind * 1.1)} opacity={.08 + profile.wind * .09} />}
      <group ref={star}>
      <mesh>
        <sphereGeometry args={[1.25, 72, 72]} />
        <meshBasicMaterial color={profile.palette[0]} toneMapped />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.28, 96, 96]} />
        <StarSurfaceMaterial profile={profile} energy={intensity} />
      </mesh>
      </group>
      <mesh scale={profile.displayScale * 1.018}>
        <sphereGeometry args={[1.28, 64, 64]} />
        <StarCoronaMaterial color={profile.corona} opacity={profile.coronaOpacity * .38} brightness={profile.radiance * 2.1} power={2.05} turbulence={1.4} />
      </mesh>
      <mesh scale={profile.displayScale * 1.055}>
        <sphereGeometry args={[1.28, 64, 64]} />
        <StarCoronaMaterial color={profile.corona} opacity={profile.coronaOpacity * .16} brightness={profile.radiance * 1.8} power={3.4} turbulence={.8 + profile.wind} />
      </mesh>
      {Array.from({ length: prominenceCount }, (_, index) => (
        <mesh key={index} rotation={[index * 1.4, index * 0.8, index * 1.9]} scale={profile.displayScale}>
          <torusGeometry args={[1.4 + index * .06, .011, 8, 80, Math.PI * (.62 + index * .08)]} />
          <meshBasicMaterial color={profile.corona} transparent opacity={.12 + profile.activity * .12} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      {profile.jets && <PulsarJets color={profile.corona} />}
      <pointLight color={profile.corona} intensity={6 + profile.radiance * 5 + intensity * 2} distance={18} />
      <ScientificSparkles count={Math.round(35 + profile.wind * 80)} scale={profile.displayScale * (3.8 + profile.wind)} size={.34 + profile.wind * .28} speed={.25 + profile.wind * .6} opacity={.22 + profile.wind * .2} color={profile.corona} />
    </group>
  )
}

function PlasmaTorus({ intensity, stage }) {
  const material = useMemo(() => {
    const result = new MeshBasicNodeMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
    const filaments = positionLocal.x.mul(34).sub(time.mul(7)).sin()
      .add(positionLocal.z.mul(27).add(time.mul(3)).sin()).mul(0.25).add(0.5).clamp(0, 1)
    result.colorNode = tslMix(tslColor('#7614ff'), tslColor('#e2d2ff'), filaments).mul(1.1 + Math.min(2, intensity) * 0.32)
    result.opacityNode = float(0.68).add(filaments.mul(0.2))
    const wave = positionLocal.x.mul(38).sub(time.mul(5.5)).sin().mul(positionLocal.z.mul(17).add(time.mul(2)).sin()).mul(0.03)
    result.positionNode = positionLocal.add(normalLocal.mul(wave))
    return result
  }, [intensity])
  useEffect(() => () => material.dispose(), [material])
  return (
    <mesh>
      <torusGeometry args={[1.58, stage === 'ignition' ? .25 : .18, 48, 180]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

function Tokamak({ intensity, stage }) {
  const assembly = useRef()
  useFrame((_, delta) => {
    if (assembly.current) assembly.current.rotation.z += delta * 0.025
  })
  return (
    <group ref={assembly} rotation={[1.04, 0.05, 0.12]}>
      <mesh>
        <torusGeometry args={[1.58, .52, 48, 150]} />
        <meshPhysicalMaterial color="#718388" metalness={0.86} roughness={0.24} clearcoat={0.75} transparent opacity={0.22} transmission={0.18} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <PlasmaTorus intensity={intensity} stage={stage} />
      {Array.from({ length: 12 }, (_, index) => {
        const angle = index / 12 * Math.PI * 2
        return (
          <mesh key={index} position={[Math.cos(angle) * 1.58, Math.sin(angle) * 1.58, 0]} rotation={[Math.PI / 2, angle, 0]}>
            <torusGeometry args={[.63, .045, 12, 48]} />
            <meshPhysicalMaterial color="#b46b38" emissive="#58250d" emissiveIntensity={0.2} metalness={0.88} roughness={0.25} />
          </mesh>
        )
      })}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[.24, .24, 2.15, 48]} />
        <meshPhysicalMaterial color="#9e5e34" metalness={0.9} roughness={0.22} clearcoat={0.4} />
      </mesh>
      <ScientificSparkles count={stage === 'ignition' ? 190 : 90} scale={[4.1, 4.1, 1.3]} size={stage === 'ignition' ? 3.2 : 1.7} speed={stage === 'ignition' ? 2.1 : .75} opacity={0.75} color="#d8b4ff" />
    </group>
  )
}

const laboratoryFusion = {
  dt: { reactants: [{ p: 1, n: 1, label: '²H' }, { p: 1, n: 2, label: '³H' }], compound: { p: 2, n: 3, label: '⁵He*' }, products: [{ p: 2, n: 2, label: '⁴He', vector: [-.7,.12,0] }], emissions: [{ type: 'neutron', label: 'n', vector: [1.25,-.1,.1] }] },
  dd: { reactants: [{ p: 1, n: 1, label: '²H' }, { p: 1, n: 1, label: '²H' }], compound: { p: 2, n: 2, label: '⁴He*' }, products: [{ p: 2, n: 1, label: '³He', vector: [-.72,.14,0] }], emissions: [{ type: 'neutron', label: 'n', vector: [1.25,-.12,.1] }] },
  he3: { reactants: [{ p: 1, n: 1, label: '²H' }, { p: 2, n: 1, label: '³He' }], compound: { p: 3, n: 2, label: '⁵Li*' }, products: [{ p: 2, n: 2, label: '⁴He', vector: [-.72,.12,0] }], emissions: [{ type: 'proton', label: 'p', vector: [1.25,-.1,.1] }] },
  pb: { reactants: [{ p: 1, n: 0, label: 'p' }, { p: 5, n: 6, label: '¹¹B' }], compound: { p: 6, n: 6, label: '¹²C*' }, products: [{ p: 2, n: 2, label: '⁴He', vector: [-.9,.45,0] }, { p: 2, n: 2, label: '⁴He', vector: [.82,.48,.12] }, { p: 2, n: 2, label: '⁴He', vector: [0,-.86,-.12] }], emissions: [] },
}

const stellarFusionSteps = {
  pp: {
    reactants: [{ p: 2, n: 1, label: '³He' }, { p: 2, n: 1, label: '³He' }],
    compound: { p: 4, n: 2, label: '⁶Be*' },
    products: [{ p: 2, n: 2, label: '⁴He', vector: [-.48,.04,0] }, { p: 1, n: 0, label: 'p', vector: [.92,.62,.08] }, { p: 1, n: 0, label: 'p', vector: [.94,-.62,-.08] }],
    emissions: [],
  },
  'triple-alpha': {
    reactants: [{ p: 4, n: 4, label: '⁸Be' }, { p: 2, n: 2, label: '⁴He' }],
    compound: { p: 6, n: 6, label: '¹²C*' },
    products: [{ p: 6, n: 6, label: '¹²C', vector: [-.48,.04,0] }],
    emissions: [{ type: 'gamma', label: 'γ', vector: [1.18,.28,.12] }],
  },
  cno: {
    reactants: [{ p: 6, n: 6, label: '¹²C' }, { p: 1, n: 0, label: 'p' }],
    compound: { p: 7, n: 6, label: '¹³N*' },
    products: [{ p: 7, n: 6, label: '¹³N', vector: [-.42,.04,0] }],
    emissions: [{ type: 'gamma', label: 'γ', vector: [1.18,.28,.12] }],
  },
}

const clusterOffsets = [
  [0,0,0],[.23,0,0],[-.21,.04,.05],[.04,.22,-.03],[0,-.21,.05],
  [.15,.15,.16],[-.15,-.12,-.16],[-.16,.17,-.12],[.17,-.17,-.1],[0,.02,.25],[0,-.03,-.25],[.26,.08,-.18],
]

function NucleonCluster({ protons, neutrons, scale = 1 }) {
  const particles = [...Array(protons).fill('proton'), ...Array(neutrons).fill('neutron')]
  return (
    <group scale={scale}>
      {particles.map((type, index) => (
        <mesh key={`${type}-${index}`} position={clusterOffsets[index] || [Math.sin(index) * .22, Math.cos(index * 2) * .2, Math.sin(index * 3) * .2]} castShadow>
          <icosahedronGeometry args={[.17,2]} />
          <meshPhysicalMaterial color={type === 'proton' ? '#ff7467' : '#66b9ee'} emissive={type === 'proton' ? '#8d211d' : '#174b7d'} emissiveIntensity={.58} roughness={.12} clearcoat={1} clearcoatRoughness={.06} transmission={.12} thickness={.62} ior={1.42} />
          <ContourShell radius={.17} color={type === 'proton' ? '#ffb09f' : '#b9e8ff'} opacity={.16} scale={1.08} geometry="icosahedron" />
        </mesh>
      ))}
    </group>
  )
}

function ParticleLabel({ text, position = [0,-.43,.16], scale = 1, accent = '#b9f46e' }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 96
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = 'rgba(244, 253, 249, .94)'
    context.fillRect(6, 10, 308, 76)
    context.strokeStyle = accent
    context.lineWidth = 5
    context.strokeRect(8.5, 12.5, 303, 71)
    context.fillStyle = '#102c25'
    context.font = '900 43px Manrope, Arial, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(text, 160, 50)
    const result = new THREE.CanvasTexture(canvas)
    result.colorSpace = THREE.SRGBColorSpace
    result.minFilter = THREE.LinearFilter
    result.magFilter = THREE.LinearFilter
    return result
  }, [accent, text])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <sprite position={position} scale={[(.72 + text.length * .075) * scale,.3 * scale,1]} renderOrder={20}>
      <spriteMaterial map={texture} transparent depthTest={false} depthWrite={false} toneMapped={false} />
    </sprite>
  )
}

function ExcitedCompound({ compound }) {
  return (
    <group>
      <NucleonCluster protons={compound.p} neutrons={compound.n} scale={1.1} />
      <mesh scale={.7 + Math.cbrt(compound.p + compound.n) * .06}>
        <sphereGeometry args={[1,36,36]} />
        <meshBasicMaterial color="#fff0a0" transparent opacity={.11} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <ScientificSparkles count={24} scale={1.55} size={1.1} speed={1.3} opacity={.72} color="#ffe878" />
    </group>
  )
}

function smoothRange(from, to, value) {
  const amount = THREE.MathUtils.clamp((value - from) / (to - from), 0, 1)
  return amount * amount * (3 - 2 * amount)
}

function FusionInteraction({ source = 'star', fuel = 'dt', pathway = 'pp', active = true }) {
  const reactantRefs = useRef([])
  const compoundRef = useRef()
  const compoundLabelRef = useRef()
  const productRefs = useRef([])
  const emissionRefs = useRef([])
  const pulse = useRef()
  const pulseMaterial = useRef()
  const started = useRef(null)
  const wasActive = useRef(false)
  const config = source === 'star' ? stellarFusionSteps[pathway] || stellarFusionSteps.pp : laboratoryFusion[fuel] || laboratoryFusion.dt
  const starts = [[-1.65,.22,.08],[1.65,-.22,-.08]]

  useFrame(({ clock }) => {
    if (active && !wasActive.current) started.current = clock.elapsedTime
    wasActive.current = active
    const cycle = active ? ((clock.elapsedTime - (started.current ?? clock.elapsedTime)) % 9) / 9 : .08
    const approach = smoothRange(.03,.3,cycle)
    const merge = smoothRange(.28,.37,cycle)
    const compoundIn = smoothRange(.29,.37,cycle)
    const compoundOut = smoothRange(.62,.7,cycle)
    const assemble = smoothRange(.68,.77,cycle)
    const depart = smoothRange(.74,.92,cycle)
    const reset = 1 - smoothRange(.95,.995,cycle)
    reactantRefs.current.forEach((group, index) => {
      if (!group) return
      const start = starts[index]
      group.position.set(start[0] * (1 - approach), start[1] * (1 - approach), start[2] * (1 - approach))
      group.scale.setScalar(Math.max(.02, 1 - merge))
      group.visible = cycle < .4
      group.rotation.y += .012
    })
    if (compoundRef.current) {
      compoundRef.current.scale.setScalar(Math.max(.01, compoundIn * (1 - compoundOut)))
      compoundRef.current.visible = cycle > .27 && cycle < .72
      compoundRef.current.rotation.y += .018
      compoundRef.current.rotation.x = Math.sin(clock.elapsedTime * 7.2) * .09
    }
    if (compoundLabelRef.current) compoundLabelRef.current.visible = cycle > .35 && cycle < .67
    productRefs.current.forEach((group, index) => {
      if (!group) return
      const vector = config.products[index].vector
      group.position.set(vector[0] * depart * 1.8, vector[1] * depart * 1.8, vector[2] * depart * 1.8)
      group.scale.setScalar(Math.max(.02, assemble * reset))
      group.visible = cycle > .67
      group.rotation.y -= .01
    })
    emissionRefs.current.forEach((group, index) => {
      if (!group) return
      const vector = config.emissions[index].vector
      const flight = smoothRange(.72,.94,cycle)
      group.position.set(vector[0] * flight * 2.2, vector[1] * flight * 2.2, vector[2] * flight * 2.2)
      group.scale.setScalar(Math.max(.01, assemble * reset))
      group.visible = cycle > .7
    })
    const flash = assemble * (1 - smoothRange(.77,.84,cycle))
    if (pulse.current) pulse.current.scale.setScalar(.28 + flash * 1.45)
    if (pulseMaterial.current) pulseMaterial.current.opacity = .012 + flash * .17
  })

  return (
    <group>
      {config.reactants.map((item, index) => <group key={`reactant-${index}`} ref={(node) => { reactantRefs.current[index] = node }}><NucleonCluster protons={item.p} neutrons={item.n} /></group>)}
      <group ref={compoundRef}><ExcitedCompound compound={config.compound} /></group>
      <group ref={compoundLabelRef}><ParticleLabel text={config.compound.label} position={[0,-.72,.2]} scale={.68} accent="#ffd85d" /></group>
      {config.products.map((item, index) => <group key={`product-${index}`} ref={(node) => { productRefs.current[index] = node }}><NucleonCluster protons={item.p} neutrons={item.n} scale={1.22} /><ParticleLabel text={item.label} position={[0,-.52,.16]} scale={.64} accent="#79d8c2" /></group>)}
      {config.emissions.map((item, index) => (
        <group key={`emission-${index}`} ref={(node) => { emissionRefs.current[index] = node }}>
          {item.type === 'neutron' ? <NucleonCluster protons={0} neutrons={1} scale={.92} />
            : item.type === 'proton' ? <NucleonCluster protons={1} neutrons={0} scale={.92} />
              : <mesh><sphereGeometry args={[item.type === 'neutrino' ? .075 : .11,18,18]} /><meshBasicMaterial color={item.type === 'neutrino' ? '#b98cff' : item.type === 'gamma' ? '#ffffff' : '#ffe66e'} toneMapped={false} /></mesh>}
          <ParticleLabel text={item.label} position={[0,.42,.12]} scale={.52} accent="#ffe26f" />
        </group>
      ))}
      <mesh ref={pulse}>
        <sphereGeometry args={[.32,36,36]} />
        <meshBasicMaterial ref={pulseMaterial} color="#fff3a8" transparent opacity={.02} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <ScientificSparkles count={70} scale={[3.5,2.4,2.2]} size={2.2} speed={active ? 1.15 : .2} opacity={.62} color="#ffe98c" />
    </group>
  )
}

function StellarCutaway({ active, pathway }) {
  const shell = useRef()
  useFrame((_, delta) => { if (shell.current) shell.current.rotation.y += delta * .035 })
  return (
    <group>
      <group ref={shell} rotation={[.12,-.45,0]}>
        <mesh>
          <sphereGeometry args={[2.4,96,72,0,Math.PI * 1.52,0,Math.PI]} />
          <StellarInteriorMaterial inner="#8f1d12" outer="#ffb249" opacity={.31} phase={1} />
        </mesh>
        <mesh scale={.74}>
          <sphereGeometry args={[2.4,88,64,0,Math.PI * 1.52,0,Math.PI]} />
          <StellarInteriorMaterial inner="#c13718" outer="#ffca62" opacity={.25} phase={3} />
        </mesh>
        <mesh scale={.48}>
          <sphereGeometry args={[2.4,80,60,0,Math.PI * 1.52,0,Math.PI]} />
          <StellarInteriorMaterial inner="#ff751f" outer="#fff1a3" opacity={.28} phase={5} />
        </mesh>
        <mesh scale={1.02}>
          <sphereGeometry args={[2.4,72,64]} />
          <StellarInteriorMaterial inner="#ff7a2d" outer="#ffd47c" opacity={.035} phase={2} side={THREE.BackSide} />
        </mesh>
      </group>
      <mesh position={[-.02,0,-.15]}>
        <circleGeometry args={[1.68,72]} />
        <StellarInteriorMaterial inner="#c43618" outer="#ffb548" opacity={.19} phase={4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0,0,-.08]}>
        <sphereGeometry args={[1.28,48,48]} />
        <StellarInteriorMaterial inner="#ff842d" outer="#fff4b5" opacity={.13} phase={7} side={THREE.BackSide} />
      </mesh>
      <ScientificSparkles count={74} scale={[3.8,3.8,2.1]} size={1.7} speed={.42} opacity={.46} color="#ffd273" />
      {pathway === 'none'
        ? <group position={[0,0,.5]}><mesh><sphereGeometry args={[.72,48,48]} /><StellarInteriorMaterial inner="#31536d" outer="#bde8ff" opacity={.18} phase={8} /></mesh><ScientificSparkles count={22} scale={1.7} size={.8} speed={.1} opacity={.22} color="#cdeeff" /></group>
        : <group position={[0,0,.5]} scale={pathway === 'triple-alpha' ? 1.08 : 1.42}><FusionInteraction source="star" pathway={pathway} active={active} /></group>}
      <pointLight color="#ffb653" intensity={7} distance={12} />
    </group>
  )
}

function FusionMicroscope({ fuel, active }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2,0,0]}>
        <torusGeometry args={[2.45,.045,14,96]} />
        <meshPhysicalMaterial color="#7de7dc" emissive="#236e69" emissiveIntensity={.28} metalness={.65} roughness={.24} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.7,64,64]} />
        <meshPhysicalMaterial color="#91deed" transmission={.82} thickness={.12} transparent opacity={.08} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <group scale={1.16}><FusionInteraction source="lab" fuel={fuel} active={active} /></group>
      <pointLight color="#ad7cff" intensity={5} distance={10} />
    </group>
  )
}

function fusionOverlayModel({ lab, fuel, pathway }) {
  if (!lab && pathway === 'none') return null
  const config = lab ? laboratoryFusion[fuel] || laboratoryFusion.dt : stellarFusionSteps[pathway] || stellarFusionSteps.pp
  return {
    reactants: config.reactants.map((item) => item.label),
    compound: config.compound.label,
    products: [...config.products.map((item) => item.label), ...config.emissions.map((item) => item.label)],
  }
}

export function FusionScene({ intensity = 0.5, stage = 'ready', lab = false, inside = false, pathway = 'pp', fuel = 'dt', active = true, stellarType = defaultStellarArchetype }) {
  const stellarProfile = stellarArchetypeById[stellarType] || stellarArchetypeById[defaultStellarArchetype]
  const overlay = inside ? fusionOverlayModel({ lab, fuel, pathway }) : null
  const bloom = lab
    ? { strength: .44, radius: .38, threshold: .68 }
    : inside
      ? { strength: .3, radius: .3, threshold: .72 }
      : { strength: .42 + stellarProfile.bloom * .36, radius: .38 + stellarProfile.bloom * .12, threshold: .48 }
  const exposure = lab ? 1.08 : inside ? 1.02 : Math.max(.82, 1.08 - stellarProfile.radiance * .055)
  return (
    <div className="science-canvas fusion-canvas" role="img" aria-label={`${inside ? 'particle-level ' : ''}${lab ? 'tokamak plasma' : stellarProfile.label} simulation`}>
      <ScientificCanvas id="fusion-simulator" exposure={exposure} bloom={bloom} camera={{ position: [0, 0.5, 6], fov: 46 }} dpr={[1, 1.45]}>
        <color attach="background" args={[inside ? '#07131c' : lab ? '#071517' : '#030811']} />
        <CinematicLighting mood={lab ? 'cool' : 'warm'} intensity={inside ? .92 : lab ? 1.18 : .72} />
        {lab && <pointLight position={[0,0,2]} intensity={6} color="#ab62ff" />}
        {!lab && <ScientificSparkles count={150} scale={14} size={.75} speed={0.08} opacity={0.68} color="#d8e6ff" />}
        {inside ? lab ? <FusionMicroscope fuel={fuel} active={active} /> : <StellarCutaway pathway={pathway} active={active} />
          : lab ? <Tokamak intensity={intensity} stage={stage} /> : <FusionStar intensity={intensity} stage={stage} starType={stellarType} />}
        <OrbitControls enablePan={false} autoRotate={!inside} autoRotateSpeed={0.35} minDistance={4} maxDistance={9} />
      </ScientificCanvas>
      {overlay && <div className="nuclear-reaction-overlay fusion-reaction-overlay"><small>Visible nucleus change</small><div><span>{overlay.reactants.join(' + ')}</span><b>→</b><em>{overlay.compound}</em><b>→</b><strong>{overlay.products.join(' + ')}</strong></div></div>}
    </div>
  )
}

function TravelingNeutron({ direction = [1,0,0], incoming = false, index = 0 }) {
  const particle = useRef()
  const trail = useRef()
  const started = useRef(null)
  useFrame(({ clock }) => {
    if (started.current === null) started.current = clock.elapsedTime
    const elapsed = clock.elapsedTime - started.current
    const progress = (elapsed * (incoming ? .34 : .28) + index * .16) % 1
    const distance = incoming ? -3.6 + progress * 3.35 : .55 + progress * 3.25
    if (particle.current) particle.current.position.set(direction[0] * distance, direction[1] * distance, direction[2] * distance)
    if (trail.current) trail.current.material.opacity = .12 + (1 - progress) * .3
  })
  const vector = new THREE.Vector3(...direction).normalize()
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), vector)
  return (
    <group>
      <mesh ref={particle}>
        <icosahedronGeometry args={[.15,2]} />
        <meshPhysicalMaterial color="#73c8ff" emissive="#2877ba" emissiveIntensity={.8} roughness={.12} clearcoat={1} toneMapped={false} />
        <pointLight color="#73c8ff" intensity={1.5} distance={2.5} />
      </mesh>
      {!incoming && <mesh ref={trail} position={[vector.x * 1.8,vector.y * 1.8,vector.z * 1.8]} quaternion={quaternion}>
        <cylinderGeometry args={[.018,.018,2.9,8]} />
        <meshBasicMaterial color="#73c8ff" transparent opacity={.25} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>}
    </group>
  )
}

function FissionProducts({ fragments }) {
  const first = useRef()
  const second = useRef()
  const flash = useRef()
  const flashMaterial = useRef()
  const started = useRef(null)
  useFrame(({ clock }) => {
    if (started.current === null) started.current = clock.elapsedTime
    const progress = smoothRange(0,1,clock.elapsedTime - started.current)
    if (first.current) {
      first.current.position.set(-1.38 * progress,-.1 * progress,0)
      first.current.scale.setScalar(.3 + progress * .7)
      first.current.rotation.y -= .018
    }
    if (second.current) {
      second.current.position.set(1.38 * progress,.22 * progress,0)
      second.current.scale.setScalar(.3 + progress * .7)
      second.current.rotation.y += .022
    }
    if (flash.current) {
      flash.current.scale.setScalar(.35 + progress * 2.4)
      flash.current.visible = progress < .82
    }
    if (flashMaterial.current) flashMaterial.current.opacity = Math.max(.02, .72 * (1 - progress))
  })
  return (
    <group>
      <group ref={first}><Nucleus protons={fragments[0].protons} neutrons={fragments[0].mass - fragments[0].protons} scale={.82} /><ParticleLabel text={fragments[0].label} position={[0,-.82,.22]} scale={.9} accent="#79d8c2" /></group>
      <group ref={second}><Nucleus protons={fragments[1].protons} neutrons={fragments[1].mass - fragments[1].protons} scale={.82} /><ParticleLabel text={fragments[1].label} position={[0,-.78,.22]} scale={.9} accent="#79d8c2" /></group>
      <mesh ref={flash}>
        <sphereGeometry args={[.34,36,36]} />
        <meshBasicMaterial ref={flashMaterial} color="#fff0a0" transparent opacity={.7} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2,0,0]}>
        <torusGeometry args={[.5,.028,12,72]} />
        <meshBasicMaterial color="#ffe376" transparent opacity={.32} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

function DeformedCompoundNucleus({ element, fragments }) {
  const left = useRef()
  const right = useRef()
  const assembly = useRef()
  useFrame(({ clock }) => {
    const stretch = Math.sin(clock.elapsedTime * 3.8) * .045
    if (left.current) left.current.position.x = -.42 - stretch
    if (right.current) right.current.position.x = .42 + stretch
    if (assembly.current) assembly.current.rotation.z = Math.sin(clock.elapsedTime * 2.1) * .025
  })
  const firstNeutrons = fragments[0].mass - fragments[0].protons
  const secondNeutrons = fragments[1].mass - fragments[1].protons + 3
  return (
    <group ref={assembly}>
      <group ref={left} scale={[.9,.82,.82]}><Nucleus protons={fragments[0].protons} neutrons={firstNeutrons} scale={.72} /></group>
      <group ref={right} scale={[.88,.78,.78]}><Nucleus protons={fragments[1].protons} neutrons={secondNeutrons} scale={.72} /></group>
      <mesh rotation={[0,0,Math.PI / 2]}>
        <cylinderGeometry args={[.22,.22,.72,30]} />
        <meshPhysicalMaterial color="#ffd76f" emissive="#8b4d0d" emissiveIntensity={.45} roughness={.16} clearcoat={1} transparent opacity={.42} transmission={.18} depthWrite={false} />
      </mesh>
      <mesh scale={[1.08,.63,.66]}>
        <sphereGeometry args={[1,48,48]} />
        <meshBasicMaterial color="#fff0a0" transparent opacity={.055} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.BackSide} />
      </mesh>
      <ParticleLabel text={element.compound} position={[0,-1.02,.32]} scale={.92} accent="#ffd85d" />
    </group>
  )
}

function NextGenerationTargets({ element }) {
  const targets = [[-2.8,1.65,-.35],[2.9,1.55,-.25],[.35,-2.05,.1]]
  return targets.map((position,index) => (
    <group key={index} position={position} scale={.31}>
      <Nucleus protons={element.protons} neutrons={element.mass - element.protons} scale={.72} />
      <mesh>
        <sphereGeometry args={[1.16,40,40]} />
        <meshPhysicalMaterial color="#7fd9c4" emissive="#2c8f7e" emissiveIntensity={.18} roughness={.16} transmission={.2} thickness={.42} transparent opacity={.18} side={THREE.BackSide} depthWrite={false} clearcoat={1} />
        <ContourShell radius={1.16} color="#adffea" opacity={.2} scale={1.045} />
      </mesh>
      <ParticleLabel text={element.symbol} position={[0,-1.5,.35]} scale={2.4} accent="#79d8c2" />
    </group>
  ))
}

export function FissionScene({ stage = 0, element }) {
  const particles = stage >= 2 ? 70 : 22
  const fragments = element.fragments || [{ protons: 56, mass: 141 }, { protons: 36, mass: 92 }]
  const directions = [[1,.28,.08],[-.36,1,.12],[-.2,-1,-.08]]
  return (
    <div className="science-canvas fission-canvas" role="img" aria-label={`${element.label} nuclear fission model`}>
      <ScientificCanvas id="fission-simulator" bloom={{ strength: .24, radius: .24, threshold: .7 }} camera={{ position: [0, 1.2, 7], fov: 45 }} dpr={[1, 1.4]}>
        <color attach="background" args={['#081c20']} />
        <SceneLights dark />
        {stage < 2 && <group scale={[1.15,1.15,1.15]}><Nucleus protons={element.protons} neutrons={element.mass - element.protons} scale={0.82} /></group>}
        {stage === 2 && <DeformedCompoundNucleus element={element} fragments={fragments} />}
        {stage < 2 && <ParticleLabel text={element.symbol} position={[0,-1.18,.34]} scale={1.02} accent="#79d8c2" />}
        {stage >= 3 && <FissionProducts fragments={fragments} />}
        {stage === 1 && <TravelingNeutron direction={[1,0,0]} incoming />}
        {stage === 2 && <><mesh rotation={[Math.PI / 2,0,0]}><torusGeometry args={[1.25,.04,12,80]} /><meshBasicMaterial color="#ffe27b" transparent opacity={.68} blending={THREE.AdditiveBlending} /></mesh><pointLight color="#ffe27b" intensity={4} distance={7} /></>}
        {stage >= 3 && directions.map((direction,index) => <TravelingNeutron key={index} direction={direction} index={index} />)}
        {stage === 4 && <NextGenerationTargets element={element} />}
        {stage >= 1 && <ScientificSparkles count={particles} scale={stage >= 3 ? 8 : 3} size={stage >= 3 ? 3.8 : 1.8} speed={stage >= 3 ? 2.2 : 0.5} opacity={0.8} color="#c8ff67" />}
        <OrbitControls enablePan={false} autoRotate autoRotateSpeed={stage >= 3 ? 1 : 0.32} minDistance={4.5} maxDistance={10} />
      </ScientificCanvas>
      <div className="nuclear-reaction-overlay fission-reaction-overlay"><small>{stage < 2 ? 'Fuel nucleus and incoming neutron' : stage === 2 ? 'Captured compound nucleus' : 'Visible fission products'}</small><div><span>{element.symbol} + n</span><b>→</b><em>{element.compound}</em><b>→</b><strong>{fragments.map((fragment) => fragment.label).join(' + ')} + 3n</strong></div></div>
      <div className="particle-scale-note">nucleus interaction view · proton/neutron scale enlarged</div>
    </div>
  )
}
