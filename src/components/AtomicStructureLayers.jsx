import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import MeshBasicNodeMaterial from 'three/src/materials/nodes/MeshBasicNodeMaterial.js'
import MeshPhysicalNodeMaterial from 'three/src/materials/nodes/MeshPhysicalNodeMaterial.js'
import { color as tslColor, float } from 'three/src/nodes/tsl/TSLBase.js'
import { normalView } from 'three/src/nodes/accessors/Normal.js'
import { positionLocal, positionViewDirection } from 'three/src/nodes/accessors/Position.js'
import { time } from 'three/src/nodes/utils/Timer.js'
import { occupiedSubshells } from '../data/orbitals.js'

const orbitalColors = { s: '#82e6ff', p: '#c7a8ff', d: '#ffd36a', f: '#ff91b2' }

function fract(value) {
  return value - Math.floor(value)
}

function seeded(index, seed) {
  return fract(Math.sin((index + 1) * (seed + 11.17) * 12.9898) * 43758.5453)
}

function mixedNucleonPoints(protons, neutrons, seed) {
  const total = Math.max(1, protons + neutrons)
  const clusterRadius = 0.12 + Math.cbrt(total) * 0.105
  let protonsPlaced = 0
  return Array.from({ length: total }, (_, index) => {
    const y = 1 - (2 * (index + 0.5)) / total
    const radial = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = index * 2.399963 + seed
    const depth = clusterRadius * (0.42 + seeded(index, seed + 5) * 0.58)
    const shouldBeProton = Math.round(((index + 1) * protons) / total) > protonsPlaced
    if (shouldBeProton) protonsPlaced += 1
    return {
      type: shouldBeProton ? 'proton' : 'neutron',
      position: [Math.cos(theta) * radial * depth, y * depth, Math.sin(theta) * radial * depth],
      size: Math.max(0.045, Math.min(0.11, clusterRadius / Math.max(2.5, Math.cbrt(total) * 1.8))),
    }
  })
}

function makeNucleonMaterial(type) {
  const proton = type === 'proton'
  const material = new MeshPhysicalNodeMaterial({
    roughness: 0.11,
    metalness: 0.03,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    transmission: 0.14,
    thickness: 0.72,
    ior: 1.42,
  })
  const pulse = time.mul(proton ? 3.7 : 3.15).sin().mul(0.055).add(0.945)
  const base = tslColor(proton ? '#ff725f' : '#74bde9')
  const rim = normalView.dot(positionViewDirection).abs().oneMinus().pow(1.8)
  material.colorNode = base.mul(pulse)
  material.emissiveNode = tslColor(proton ? '#7d2019' : '#174d79').mul(pulse.mul(0.66)).add(base.mul(rim.mul(0.32)))
  return material
}

export function NuclearDensityCluster({ protons, neutrons, scale = 1, seed = 4, collective = true }) {
  const protonRef = useRef()
  const neutronRef = useRef()
  const group = useRef()
  const points = useMemo(() => mixedNucleonPoints(protons, neutrons, seed), [neutrons, protons, seed])
  const protonPoints = useMemo(() => points.filter((point) => point.type === 'proton'), [points])
  const neutronPoints = useMemo(() => points.filter((point) => point.type === 'neutron'), [points])
  const protonMaterial = useMemo(() => makeNucleonMaterial('proton'), [])
  const neutronMaterial = useMemo(() => makeNucleonMaterial('neutron'), [])
  const densityMaterial = useMemo(() => {
    const material = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending })
    const rim = normalView.dot(positionViewDirection).abs().oneMinus().pow(2.1)
    const pulse = time.mul(2.3).sin().mul(0.025).add(0.975)
    material.colorNode = tslColor('#d9f6ff').mul(pulse)
    material.opacityNode = float(0.026).add(rim.mul(0.105))
    return material
  }, [])

  useLayoutEffect(() => {
    const apply = (ref, values) => {
      if (!ref.current) return
      const dummy = new THREE.Object3D()
      values.forEach((point, index) => {
        dummy.position.set(...point.position)
        dummy.rotation.set(index * 0.31, index * 0.47, index * 0.19)
        dummy.scale.setScalar(point.size / 0.085)
        dummy.updateMatrix()
        ref.current.setMatrixAt(index, dummy.matrix)
      })
      ref.current.instanceMatrix.needsUpdate = true
    }
    apply(protonRef, protonPoints)
    apply(neutronRef, neutronPoints)
  }, [neutronPoints, protonPoints])

  useFrame(({ clock }, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * 0.075
    group.current.rotation.z = Math.sin(clock.elapsedTime * 2.7 + seed) * 0.018
  })

  useEffect(() => () => {
    protonMaterial.dispose()
    neutronMaterial.dispose()
    densityMaterial.dispose()
  }, [densityMaterial, neutronMaterial, protonMaterial])

  const radius = points[0] ? Math.max(...points.map((point) => new THREE.Vector3(...point.position).length())) + points[0].size : 0.2
  return (
    <group ref={group} scale={scale}>
      <instancedMesh ref={protonRef} args={[null, null, Math.max(1, protonPoints.length)]} frustumCulled={false}>
        <icosahedronGeometry args={[0.085, 2]} />
        <primitive object={protonMaterial} attach="material" />
      </instancedMesh>
      <instancedMesh ref={neutronRef} args={[null, null, Math.max(1, neutronPoints.length)]} frustumCulled={false}>
        <icosahedronGeometry args={[0.085, 2]} />
        <primitive object={neutronMaterial} attach="material" />
      </instancedMesh>
      {collective && <mesh scale={radius * 1.16}>
        <sphereGeometry args={[1, 36, 36]} />
        <primitive object={densityMaterial} attach="material" />
      </mesh>}
      <pointLight color="#ffd1c8" intensity={0.9} distance={3.5} />
    </group>
  )
}

function sampleS(index, radius, seed) {
  const cosine = seeded(index, seed + 3) * 2 - 1
  const theta = seeded(index, seed + 7) * Math.PI * 2
  const radial = Math.sqrt(Math.max(0, 1 - cosine * cosine))
  const distance = radius * Math.pow(seeded(index, seed + 11), 0.58)
  return [Math.cos(theta) * radial * distance, cosine * distance, Math.sin(theta) * radial * distance]
}

function sampleP(index, radius, seed, orbital) {
  const sign = index % 2 ? 1 : -1
  const longitudinal = sign * radius * (0.18 + Math.pow(seeded(index, seed + 3), 0.54) * 0.82)
  const envelope = 0.36 * (0.35 + Math.sin(Math.min(1, Math.abs(longitudinal) / radius) * Math.PI) * 0.65)
  const a = (seeded(index, seed + 7) - 0.5) * radius * envelope
  const b = (seeded(index, seed + 11) - 0.5) * radius * envelope
  return orbital % 3 === 0 ? [longitudinal, a, b] : orbital % 3 === 1 ? [a, longitudinal, b] : [a, b, longitudinal]
}

function sampleD(index, radius, seed, orbital) {
  if (orbital % 5 === 4 && index % 4 === 0) {
    const theta = seeded(index, seed + 5) * Math.PI * 2
    const ring = radius * (0.42 + seeded(index, seed + 9) * 0.38)
    return [Math.cos(theta) * ring, (seeded(index, seed + 12) - 0.5) * radius * 0.16, Math.sin(theta) * ring]
  }
  const lobe = index % 4
  const distance = radius * (0.22 + Math.pow(seeded(index, seed + 3), 0.6) * 0.78)
  const primary = (lobe < 2 ? -1 : 1) * distance * 0.68
  const secondary = (lobe % 2 ? -1 : 1) * distance * 0.68
  const noise = (seeded(index, seed + 7) - 0.5) * radius * 0.16
  const mode = orbital % 5
  if (mode === 0) return [primary, secondary, noise]
  if (mode === 1) return [primary, noise, secondary]
  if (mode === 2) return [noise, primary, secondary]
  if (mode === 3) return [primary, secondary * 0.9, noise]
  return [noise, primary * 0.7, secondary]
}

function sampleF(index, radius, seed, orbital) {
  const lobe = index % 8
  const distance = radius * (0.24 + Math.pow(seeded(index, seed + 3), 0.58) * 0.76)
  const direction = [lobe & 1 ? 1 : -1, lobe & 2 ? 1 : -1, lobe & 4 ? 1 : -1]
  const axis = orbital % 3
  const stretch = [1, 1, 1]
  stretch[axis] = 1.3
  return direction.map((sign, index2) => sign * distance * 0.54 * stretch[index2] + (seeded(index, seed + 9 + index2) - 0.5) * radius * 0.13)
}

function orbitalLayerPoints(subshell, scale, seed) {
  const count = Math.min(420, 88 + subshell.electrons * 34)
  const baseRadius = scale * (0.6 + (subshell.principal - 1) * 0.46)
  return Array.from({ length: count }, (_, index) => {
    const orbital = index % subshell.orbitalCount
    let point = subshell.type === 's' ? sampleS(index, baseRadius, seed)
      : subshell.type === 'p' ? sampleP(index, baseRadius, seed, orbital)
        : subshell.type === 'd' ? sampleD(index, baseRadius, seed, orbital)
          : sampleF(index, baseRadius, seed, orbital)
    if (subshell.radialNodes > 0) {
      const band = index % (subshell.radialNodes + 1)
      const bandCount = subshell.radialNodes + 1
      const start = band === 0 ? 0.035 : band / bandCount + 0.065
      const end = (band + 1) / bandCount - 0.065
      const targetRadius = baseRadius * (start + (end - start) * Math.pow(seeded(index, seed + 43), 0.62))
      const direction = new THREE.Vector3(...point).normalize().multiplyScalar(targetRadius)
      point = direction.toArray()
    }
    return {
      position: point,
      size: scale * (0.012 + seeded(index, seed + 31) * 0.011) * (subshell.isValenceShell ? 1.18 : 0.9),
    }
  })
}

function OrbitalLayer({ subshell, scale, seed, shift }) {
  const mesh = useRef()
  const points = useMemo(() => orbitalLayerPoints(subshell, scale, seed), [scale, seed, subshell])
  const material = useMemo(() => {
    const result = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })
    const phase = subshell.principal * 0.71 + subshell.angular * 1.17
    const pulse = time.mul(1.45 + subshell.angular * 0.17).add(phase).sin().mul(0.075).add(0.925)
    result.colorNode = tslColor(orbitalColors[subshell.type]).mul(pulse)
    result.opacityNode = float(subshell.isValenceShell ? 0.48 : 0.3).mul(pulse)
    return result
  }, [subshell])

  useLayoutEffect(() => {
    if (!mesh.current) return
    const dummy = new THREE.Object3D()
    points.forEach((point, index) => {
      dummy.position.set(...point.position)
      dummy.scale.setScalar(point.size)
      dummy.rotation.set(index * 0.27, index * 0.41, index * 0.33)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(index, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  }, [points])

  useEffect(() => () => material.dispose(), [material])

  return (
    <instancedMesh ref={mesh} args={[null, null, points.length]} position={[shift, 0, 0]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 0]} />
      <primitive object={material} attach="material" />
    </instancedMesh>
  )
}

export function OrbitalProbabilityLayers({ shells, scale = 1, seed = 2, polarizationShift = 0 }) {
  const occupied = useMemo(() => occupiedSubshells(shells), [shells])
  return (
    <group>
      {occupied.map((subshell, index) => (
        <OrbitalLayer
          key={`${subshell.principal}${subshell.type}-${subshell.electrons}`}
          subshell={subshell}
          scale={scale}
          seed={seed + index * 19}
          shift={subshell.isValenceShell ? polarizationShift : polarizationShift * 0.16}
        />
      ))}
    </group>
  )
}

export function ElectronDensityEnvelope({ radius, color = '#9eeaff', opacity = 0.11, shift = 0 }) {
  const material = useMemo(() => {
    const result = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending, toneMapped: false })
    const rim = normalView.dot(positionViewDirection).abs().oneMinus().pow(2.4)
    const spatial = positionLocal.x.mul(8.2).add(positionLocal.y.mul(6.1)).add(time.mul(1.7)).sin().mul(0.08).add(0.92)
    result.colorNode = tslColor(color).mul(spatial)
    result.opacityNode = float(opacity * 0.22).add(rim.mul(opacity)).mul(spatial)
    return result
  }, [color, opacity])
  useEffect(() => () => material.dispose(), [material])
  return (
    <mesh position={[shift, 0, 0]} scale={radius}>
      <sphereGeometry args={[1, 28, 28]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

export function ElectronDensityMaterial({ color = '#9eeaff', opacity = 0.11, side = THREE.BackSide }) {
  const material = useMemo(() => {
    const result = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side, blending: THREE.AdditiveBlending, toneMapped: false })
    const rim = normalView.dot(positionViewDirection).abs().oneMinus().pow(2.15)
    const flow = positionLocal.y.mul(14).add(positionLocal.x.mul(9)).sub(time.mul(2.2)).sin().mul(0.09).add(0.91)
    result.colorNode = tslColor(color).mul(flow)
    result.opacityNode = float(opacity * 0.28).add(rim.mul(opacity)).mul(flow)
    return result
  }, [color, opacity, side])
  useEffect(() => () => material.dispose(), [material])
  return <primitive object={material} attach="material" />
}
