import { Float, OrbitControls } from '@react-three/drei'
import { useMemo } from 'react'
import { atomColors, parseFormula } from '../data/chemistry.js'
import { MoleculeModel } from './ScienceScenes.jsx'
import { ElectronDensityEnvelope } from './AtomicStructureLayers.jsx'
import { CinematicLighting, ContourShell, ScientificCanvas, ScientificSparkles } from './ScientificCanvas.jsx'

const ionicMarkers = new Set(['Li', 'Na', 'K', 'Mg', 'Ca', 'Fe', 'Cu', 'Al', 'Zn', 'Ag'])
const extendedSolids = new Set(['SiO2', 'B2O3', 'Al2O3'])

function modelKind(compound) {
  const symbols = Object.keys(parseFormula(compound.formula))
  if (extendedSolids.has(compound.formula)) return 'extended network fragment'
  if (compound.formula.startsWith('NH4') || symbols.some((symbol) => ionicMarkers.has(symbol))) return 'formula-unit lattice'
  return 'one representative molecule'
}

function StudioLights() {
  return <CinematicLighting mood="cool" intensity={1.08} shadows />
}

function ModelStage() {
  return (
    <>
      <mesh position={[0, -1.42, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.2, 72]} />
        <meshPhysicalMaterial color="#102d32" roughness={.3} metalness={.22} clearcoat={.65} clearcoatRoughness={.12} />
      </mesh>
      <mesh position={[0, .35, -3.15]}>
        <planeGeometry args={[10, 6]} />
        <meshPhysicalMaterial color="#0d252b" roughness={.64} emissive="#143b43" emissiveIntensity={.12} />
      </mesh>
    </>
  )
}

function FormulaUnitLattice({ formula, network = false }) {
  const atoms = useMemo(() => {
    const composition = parseFormula(formula)
    const unit = Object.entries(composition).flatMap(([symbol, count]) => Array.from({ length: count }, () => symbol))
    const copies = Math.max(1, Math.min(network ? 4 : 7, Math.floor(22 / unit.length)))
    return Array.from({ length: copies }, (_, copyIndex) => unit.map((symbol, atomIndex) => {
      const index = copyIndex * unit.length + atomIndex
      const layer = Math.floor(index / 9)
      const row = Math.floor((index % 9) / 3)
      const column = index % 3
      return {
        symbol,
        position: [
          (column - 1) * 0.82 + (row % 2) * 0.18,
          (row - 1) * 0.74,
          (layer - 0.5) * 0.78 + ((column + row) % 2) * 0.18,
        ],
      }
    })).flat()
  }, [formula, network])

  return (
    <group rotation={[0.18, -0.35, 0]}>
      {atoms.map((atom, index) => (
        <mesh key={`${atom.symbol}-${index}`} position={atom.position} castShadow>
          <sphereGeometry args={[atom.symbol === 'H' ? 0.2 : 0.3, 28, 28]} />
          <meshPhysicalMaterial
            color={atomColors[atom.symbol] || '#78c9a1'}
            emissive={atomColors[atom.symbol] || '#78c9a1'}
            emissiveIntensity={0.16}
            roughness={0.14}
            clearcoat={0.9}
            clearcoatRoughness={0.07}
            sheen={.18}
            sheenColor="#ffffff"
          />
          <ContourShell radius={atom.symbol === 'H' ? 0.2 : 0.3} color={atom.symbol === 'C' ? '#b9e5df' : atomColors[atom.symbol] || '#b9ffe5'} opacity={.12} scale={1.065} />
          <ElectronDensityEnvelope radius={atom.symbol === 'H' ? 0.25 : 0.37} color={atomColors[atom.symbol] || '#9eeaff'} opacity={0.075} />
        </mesh>
      ))}
    </group>
  )
}

export function ProductModelScene({ compound }) {
  const kind = modelKind(compound)
  const isExtended = kind !== 'one representative molecule'
  const detail = kind === 'formula-unit lattice'
    ? 'Ions repeat through the solid; connector sticks are omitted because ionic attraction is not a directional two-atom bond.'
    : kind === 'extended network fragment'
      ? 'The view is a finite local fragment of a structure that continues through the solid.'
      : 'Atom sizes and bond lengths are adjusted for readability; translucent TSL layers mark atom and shared-bond electron density.'

  return (
    <div className="science-canvas product-model-canvas" role="img" aria-label={`Interactive ball-and-stick model of ${compound.name}: ${kind}`}>
      <ScientificCanvas id="element-link-product" exposure={1.08} bloom={{ strength: .2, radius: .22, threshold: .7 }} shadows camera={{ position: [0, 0.45, 5.75], fov: 43 }} dpr={[1, 1.45]}>
        <color attach="background" args={['#07191f']} />
        <fog attach="fog" args={['#07191f', 7.5, 13]} />
        <StudioLights />
        <ModelStage />
        <Float speed={1.05} rotationIntensity={0.08} floatIntensity={0.16} scale={1.08}>
          {isExtended ? <FormulaUnitLattice formula={compound.formula} network={kind === 'extended network fragment'} /> : <MoleculeModel formula={compound.formula} />}
        </Float>
        <ScientificSparkles count={32} scale={[7, 5, 6]} size={1.15} speed={0.2} opacity={0.28} color="#a7f1ff" />
        <OrbitControls enablePan={false} minDistance={3.5} maxDistance={9} autoRotate autoRotateSpeed={0.55} />
      </ScientificCanvas>
      <div className="substance-label model-label"><span className="live-dot" /><strong>{kind}</strong><small>{detail}</small></div>
      <div className="substance-formula">{compound.formula}</div>
    </div>
  )
}
