import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import WebGPURenderer from 'three/src/renderers/webgpu/WebGPURenderer.js'
import MeshBasicNodeMaterial from 'three/src/materials/nodes/MeshBasicNodeMaterial.js'
import PostProcessing from 'three/src/renderers/common/PostProcessing.js'
import { pass } from 'three/src/nodes/display/PassNode.js'
import { bloom as bloomNode } from 'three/examples/jsm/tsl/display/BloomNode.js'
import { color as tslColor, float } from 'three/src/nodes/tsl/TSLBase.js'
import { time } from 'three/src/nodes/utils/Timer.js'

function rendererRegistry() {
  if (typeof window === 'undefined') return null
  window.__leapRenderers = window.__leapRenderers || {}
  return window.__leapRenderers
}

export function rendererBackend(id) {
  return typeof window === 'undefined' ? 'unavailable' : window.__leapRenderers?.[id] || 'initializing'
}

export function ScientificCanvas({ id, className = '', children, onCreated, exposure = 1, bloom = null, ...props }) {
  const [backend, setBackend] = useState('initializing')
  const reportBackend = useCallback((value) => {
    const registry = rendererRegistry()
    if (registry) registry[id] = value
    setBackend(value)
  }, [id])

  const createRenderer = useCallback(async (defaults) => {
    const forceWebGL = typeof navigator === 'undefined' || !navigator.gpu || window.__LEAP_FORCE_WEBGL__ === true
    const renderer = new WebGPURenderer({
      canvas: defaults.canvas,
      antialias: true,
      alpha: defaults.alpha ?? true,
      forceWebGL,
    })
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = exposure
    renderer.outputColorSpace = THREE.SRGBColorSpace
    await renderer.init()
    reportBackend(renderer.backend?.isWebGPUBackend ? 'webgpu' : 'webgl2-fallback')
    return renderer
  }, [exposure, reportBackend])

  useEffect(() => () => {
    const registry = rendererRegistry()
    if (registry) delete registry[id]
  }, [id])

  return (
    <>
      <Canvas
        {...props}
        className={className}
        gl={createRenderer}
        onCreated={(state) => {
          const actual = state.gl.backend?.isWebGPUBackend ? 'webgpu' : 'webgl2-fallback'
          reportBackend(actual)
          onCreated?.(state)
        }}
      >
        {children}
        {bloom && <ScientificPostProcessing {...bloom} />}
      </Canvas>
      <span className={`renderer-badge ${backend}`} data-renderer={backend}>
        {backend === 'webgpu' ? 'WebGPU · TSL layers' : backend === 'webgl2-fallback' ? 'WebGL2 fallback · TSL layers' : 'GPU layers starting'}
      </span>
    </>
  )
}

function ScientificPostProcessing({ strength = 0.24, radius = 0.22, threshold = 0.78 }) {
  const { gl, scene, camera } = useThree()
  const pipeline = useMemo(() => {
    const scenePass = pass(scene, camera)
    const sceneColor = scenePass.getTextureNode('output')
    const glow = bloomNode(sceneColor, strength, radius, threshold)
    const postProcessing = new PostProcessing(gl)
    postProcessing.outputNode = sceneColor.add(glow)
    return { postProcessing, scenePass, glow }
  }, [camera, gl, radius, scene, strength, threshold])

  useFrame(() => pipeline.postProcessing.render(), 1)
  useEffect(() => () => {
    pipeline.glow.dispose()
    pipeline.scenePass.dispose?.()
    pipeline.postProcessing.dispose()
  }, [pipeline])
  return null
}

function AimedRectAreaLight({ position, target = [0, 0, 0], ...props }) {
  const light = useRef()
  useLayoutEffect(() => {
    light.current?.lookAt(...target)
  }, [target])
  return <rectAreaLight ref={light} position={position} {...props} />
}

function StudioEnvironment({ mood = 'cool' }) {
  const { scene } = useThree()
  const texture = useMemo(() => {
    const warm = mood === 'warm'
    const neutral = mood === 'neutral'
    const faces = warm
      ? [['#5c3018', '#ffe8ad'], ['#0b1115', '#8b4224'], ['#70532b', '#fff8dd'], ['#080d10', '#302015'], ['#2f1f18', '#ffbd78'], ['#071014', '#39535c']]
      : neutral
        ? [['#26444d', '#ecfbff'], ['#0a1115', '#40616f'], ['#536469', '#ffffff'], ['#071013', '#293438'], ['#243943', '#c7eeff'], ['#071014', '#405260']]
        : [['#123d4b', '#dffcff'], ['#080d14', '#454171'], ['#395d69', '#f0ffff'], ['#060b11', '#22233a'], ['#183744', '#8eeaff'], ['#080d16', '#534a80']]
    const images = faces.map(([base, highlight], index) => {
      const canvas = document.createElement('canvas')
      canvas.width = 64
      canvas.height = 64
      const context = canvas.getContext('2d')
      context.fillStyle = base
      context.fillRect(0, 0, 64, 64)
      const x = index % 2 ? 18 : 44
      const y = index === 2 ? 18 : index === 3 ? 50 : 30
      const gradient = context.createRadialGradient(x, y, 2, x, y, 42)
      gradient.addColorStop(0, highlight)
      gradient.addColorStop(.24, highlight)
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      context.globalAlpha = index === 3 ? .3 : .9
      context.fillStyle = gradient
      context.fillRect(0, 0, 64, 64)
      return canvas
    })
    const result = new THREE.CubeTexture(images)
    result.colorSpace = THREE.SRGBColorSpace
    result.needsUpdate = true
    return result
  }, [mood])

  useLayoutEffect(() => {
    const previous = scene.environment
    scene.environment = texture
    return () => {
      if (scene.environment === texture) scene.environment = previous
      texture.dispose()
    }
  }, [scene, texture])
  return null
}

export function CinematicLighting({
  mood = 'cool',
  intensity = 1,
  target = [0, 0, 0],
  shadows = false,
}) {
  const warm = mood === 'warm'
  const neutral = mood === 'neutral'
  const key = warm ? '#fff0c2' : neutral ? '#ffffff' : '#dff8ff'
  const rim = warm ? '#ff8a52' : neutral ? '#bfe8ff' : '#69dfff'
  const fill = warm ? '#ffd9a0' : neutral ? '#dbe8ff' : '#c3a8ff'
  return (
    <>
      <StudioEnvironment mood={mood} />
      <ambientLight intensity={0.32 * intensity} />
      <hemisphereLight args={[key, '#061013', 0.86 * intensity]} />
      <spotLight position={[4.8, 6.2, 4.6]} target-position={target} intensity={6.8 * intensity} angle={0.5} penumbra={0.9} decay={2} color={key} castShadow={shadows} shadow-bias={-0.00025} />
      <pointLight position={[-4.2, 1.8, -2.8]} intensity={4.2 * intensity} distance={12} decay={2} color={rim} />
      <pointLight position={[0, -2.2, 3.4]} intensity={2.3 * intensity} distance={9} decay={2} color={fill} />
      <AimedRectAreaLight position={[-3.4, 3.2, 4.2]} target={target} width={3.4} height={5.2} intensity={5.4 * intensity} color={key} />
      <AimedRectAreaLight position={[3.8, 0.4, 2.8]} target={target} width={2.2} height={4.6} intensity={3.4 * intensity} color={rim} />
    </>
  )
}

export function ContourShell({ radius = 1, color = '#b8f3ff', opacity = 0.16, scale = 1.055, geometry = 'sphere' }) {
  return (
    <mesh scale={scale * radius}>
      {geometry === 'icosahedron' ? <icosahedronGeometry args={[1, 2]} /> : <sphereGeometry args={[1, 32, 32]} />}
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function seeded(index, seed) {
  const value = Math.sin((index + 1) * (seed + 17.31) * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

export function ScientificSparkles({ count = 40, scale = 5, size = 1, speed = 0.2, opacity = 0.5, color = '#ffffff', position = [0, 0, 0] }) {
  const mesh = useRef()
  const group = useRef()
  const bounds = Array.isArray(scale) ? scale : [scale, scale, scale]
  const points = useMemo(() => Array.from({ length: Math.min(220, count) }, (_, index) => ({
    position: [
      (seeded(index, 3) - 0.5) * bounds[0],
      (seeded(index, 7) - 0.5) * bounds[1],
      (seeded(index, 13) - 0.5) * bounds[2],
    ],
    size: (0.008 + seeded(index, 19) * 0.012) * Math.max(0.5, size),
  })), [bounds[0], bounds[1], bounds[2], count, size])
  const material = useMemo(() => {
    const result = new MeshBasicNodeMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    })
    const pulse = time.mul(Math.max(0.08, speed)).add(0.7).sin().mul(0.12).add(0.88)
    result.colorNode = tslColor(color).mul(pulse)
    result.opacityNode = float(opacity).mul(pulse)
    return result
  }, [color, opacity, speed])

  useLayoutEffect(() => {
    if (!mesh.current) return
    const dummy = new THREE.Object3D()
    points.forEach((point, index) => {
      dummy.position.set(...point.position)
      dummy.scale.setScalar(point.size)
      dummy.rotation.set(index * 0.37, index * 0.23, index * 0.41)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(index, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  }, [points])

  useFrame(({ clock }, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * speed * 0.08
    group.current.rotation.z = Math.sin(clock.elapsedTime * speed * 0.35) * 0.035
  })

  useEffect(() => () => material.dispose(), [material])

  return (
    <group ref={group} position={position}>
      <instancedMesh ref={mesh} args={[null, null, points.length]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 0]} />
        <primitive object={material} attach="material" />
      </instancedMesh>
    </group>
  )
}
