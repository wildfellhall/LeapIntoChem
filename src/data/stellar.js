export const stellarArchetypes = [
  {
    id: 'brown-dwarf', group: 'Substellar and remnants', label: 'Brown dwarf', spectral: 'L/T-type substellar',
    mass: .05, coreTemperature: 2, surfaceTemperature: 1800, luminosity: .0001, displayScale: .58,
    palette: ['#2b0c08', '#b64b24'], corona: '#f07b42', radiance: .55, coronaOpacity: .08, activity: .18, granulation: 2.4, pulse: .006, bloom: .24, wind: .05,
    fusionKey: 'none', fusionLabel: 'No sustained hydrogen fusion', ignition: false,
    diagnosis: 'Brown dwarf — substellar object', phase: 'Brown dwarf cooling in infrared',
    description: 'It formed like a star but never became massive enough for sustained ordinary hydrogen fusion; sufficiently massive brown dwarfs can briefly burn deuterium.',
  },
  {
    id: 'red-dwarf', group: 'Main sequence dwarfs', label: 'Red dwarf', spectral: 'M V',
    mass: .2, coreTemperature: 6, surfaceTemperature: 3200, luminosity: .006, displayScale: .72,
    palette: ['#71150c', '#ff6a2b'], corona: '#ff7441', radiance: .88, coronaOpacity: .18, activity: .65, granulation: 4.8, pulse: .014, bloom: .42, wind: .18,
    fusionKey: 'pp', fusionLabel: 'Proton–proton chain', ignition: true,
    diagnosis: 'orange-red main-sequence red dwarf', phase: 'Fully convective red-dwarf main sequence',
    description: 'A cool, low-mass main-sequence star that consumes hydrogen slowly through the proton–proton chain and can remain active for trillions of years.',
  },
  {
    id: 'orange-dwarf', group: 'Main sequence dwarfs', label: 'Orange dwarf', spectral: 'K V',
    mass: .75, coreTemperature: 12, surfaceTemperature: 4700, luminosity: .25, displayScale: .88,
    palette: ['#a52b0d', '#ffc06a'], corona: '#ffad62', radiance: 1.08, coronaOpacity: .18, activity: .34, granulation: 4.1, pulse: .012, bloom: .48, wind: .12,
    fusionKey: 'pp', fusionLabel: 'Proton–proton chain', ignition: true, evolvesTo: 'red-giant',
    diagnosis: 'orange K-type main-sequence dwarf', phase: 'Orange-dwarf hydrogen fusion',
    description: 'A stable K-type dwarf: cooler and dimmer than the Sun, with core hydrogen fusion dominated by the proton–proton chain.',
  },
  {
    id: 'yellow-dwarf', group: 'Main sequence dwarfs', label: 'Sun-like yellow dwarf', spectral: 'G2 V',
    mass: 1, coreTemperature: 15, surfaceTemperature: 5770, luminosity: 1, displayScale: 1,
    palette: ['#c64b12', '#fff2a5'], corona: '#fff0a0', radiance: 1.32, coronaOpacity: .22, activity: .28, granulation: 3.6, pulse: .01, bloom: .56, wind: .13,
    fusionKey: 'pp', fusionLabel: 'Proton–proton chain', ignition: true, evolvesTo: 'red-giant',
    diagnosis: 'yellow-white main-sequence star', phase: 'G-type dwarf in hydrostatic equilibrium',
    description: 'A Sun-like main-sequence star balancing gravity with pressure supplied by hydrogen fusion, primarily through the proton–proton chain.',
  },
  {
    id: 'blue-main-sequence', group: 'Main sequence dwarfs', label: 'Blue-white main sequence', spectral: 'B V',
    mass: 5, coreTemperature: 30, surfaceTemperature: 18000, luminosity: 700, displayScale: 1.08,
    palette: ['#477fd7', '#f3f8ff'], corona: '#a9d4ff', radiance: 1.95, coronaOpacity: .27, activity: .42, granulation: 3.1, pulse: .012, bloom: .72, wind: .38,
    fusionKey: 'cno', fusionLabel: 'CNO cycle dominates', ignition: true, evolvesTo: 'red-giant',
    diagnosis: 'blue-white B-type main-sequence star', phase: 'Hot B-type core hydrogen fusion',
    description: 'A hot, luminous main-sequence star whose hydrogen fusion is dominated by the temperature-sensitive CNO cycle.',
  },
  {
    id: 'red-giant', group: 'Giants and supergiants', label: 'Red giant', spectral: 'K/M III',
    mass: 1.2, coreTemperature: 100, surfaceTemperature: 4200, luminosity: 1000, displayScale: 1.5,
    palette: ['#5f0905', '#ff5722'], corona: '#ff7446', radiance: 1.08, coronaOpacity: .2, activity: .5, granulation: 1.65, pulse: .025, bloom: .58, wind: .42,
    fusionKey: 'triple-alpha', fusionLabel: 'Hydrogen shell + representative helium-burning core', ignition: true,
    diagnosis: 'Red giant phase', phase: 'Expanded red-giant envelope',
    description: 'Core hydrogen is depleted. Hydrogen burns in a shell, the envelope expands and cools, and sufficiently hot phases fuse helium into carbon.',
  },
  {
    id: 'blue-giant', group: 'Giants and supergiants', label: 'Blue giant', spectral: 'B III',
    mass: 8, coreTemperature: 38, surfaceTemperature: 15000, luminosity: 5000, displayScale: 1.3,
    palette: ['#3e72ce', '#f5f9ff'], corona: '#9dccff', radiance: 2.15, coronaOpacity: .3, activity: .48, granulation: 2.7, pulse: .015, bloom: .78, wind: .55,
    fusionKey: 'cno', fusionLabel: 'CNO-cycle hydrogen fusion', ignition: true, evolvesTo: 'red-supergiant',
    diagnosis: 'Blue giant phase', phase: 'Hot blue-giant phase',
    description: 'A hot, luminous giant with a large radius and strong ultraviolet output; its exact evolutionary route depends on mass and composition.',
  },
  {
    id: 'blue-supergiant', group: 'Giants and supergiants', label: 'Blue supergiant', spectral: 'B Ia',
    mass: 20, coreTemperature: 45, surfaceTemperature: 12000, luminosity: 120000, displayScale: 1.38,
    palette: ['#315fae', '#f4f9ff'], corona: '#8fc8ff', radiance: 2.45, coronaOpacity: .34, activity: .58, granulation: 2.35, pulse: .017, bloom: .88, wind: .82,
    fusionKey: 'cno', fusionLabel: 'CNO-cycle / advanced massive-star burning', ignition: true,
    diagnosis: 'Blue supergiant phase', phase: 'Luminous blue-supergiant outflow',
    description: 'An extremely luminous, hot, expanded massive star with powerful radiation-driven winds; the cutaway follows a representative CNO hydrogen-burning region.',
  },
  {
    id: 'red-supergiant', group: 'Giants and supergiants', label: 'Red supergiant', spectral: 'M Ia',
    mass: 15, coreTemperature: 110, surfaceTemperature: 3600, luminosity: 120000, displayScale: 1.48,
    palette: ['#4a0503', '#ff4219'], corona: '#ff623d', radiance: 1.12, coronaOpacity: .24, activity: .7, granulation: 1.2, pulse: .035, bloom: .62, wind: .75,
    fusionKey: 'triple-alpha', fusionLabel: 'Layered advanced fusion; helium core shown', ignition: true,
    diagnosis: 'Red supergiant phase', phase: 'Extended red-supergiant envelope',
    description: 'A cool-surfaced but enormously luminous massive star with giant convection cells and multiple internal burning shells; the microscope shows representative helium fusion.',
  },
  {
    id: 'white-dwarf', group: 'Substellar and remnants', label: 'White dwarf', spectral: 'DA remnant',
    mass: .6, coreTemperature: 20, surfaceTemperature: 25000, luminosity: .03, displayScale: .34,
    palette: ['#8fb7ff', '#ffffff'], corona: '#b9dcff', radiance: 2.65, coronaOpacity: .4, activity: .04, granulation: 7, pulse: .003, bloom: .92, wind: .02,
    fusionKey: 'none', fusionLabel: 'No fusion; residual thermal cooling', ignition: false,
    diagnosis: 'White dwarf remnant — no core fusion', phase: 'Compact white dwarf cooling',
    description: 'An Earth-sized stellar remnant supported by electron degeneracy pressure. It produces no new fusion energy and cools gradually from stored heat.',
  },
  {
    id: 'wolf-rayet', group: 'Rare and anomalous', label: 'Wolf–Rayet star', spectral: 'WN/WC',
    mass: 20, coreTemperature: 120, surfaceTemperature: 60000, luminosity: 300000, displayScale: 1.06,
    palette: ['#2b72ca', '#ffffff'], corona: '#72c9ff', radiance: 3.05, coronaOpacity: .42, activity: .86, granulation: 2.8, pulse: .02, bloom: 1, wind: 1,
    fusionKey: 'triple-alpha', fusionLabel: 'Exposed helium-burning core', ignition: true,
    diagnosis: 'Wolf–Rayet stripped star', phase: 'Exposed hot core with extreme stellar wind',
    description: 'A rare, very hot evolved star whose outer hydrogen layers have been stripped away; its exposed helium-rich layers drive a dense, fast wind.',
  },
  {
    id: 'neutron-star', group: 'Rare and anomalous', label: 'Neutron star / pulsar', spectral: 'Compact remnant',
    mass: 1.4, coreTemperature: 100, surfaceTemperature: 600000, luminosity: .2, displayScale: .24,
    palette: ['#6ea9ff', '#ffffff'], corona: '#86d8ff', radiance: 3.6, coronaOpacity: .52, activity: .92, granulation: 8, pulse: .008, bloom: 1.1, wind: .35, jets: true,
    fusionKey: 'none', fusionLabel: 'No steady fusion; residual heat and rotation', ignition: false,
    diagnosis: 'Neutron-star remnant — no core fusion', phase: 'Magnetized compact remnant',
    description: 'A city-sized collapsed core supported by neutron degeneracy pressure. Its glow is residual heat; a pulsar’s beams come from rotation-powered magnetospheric emission, not fusion.',
  },
]

export const stellarArchetypeById = Object.fromEntries(stellarArchetypes.map((item) => [item.id, item]))
export const defaultStellarArchetype = 'yellow-dwarf'

export function stellarRadiusSolar(luminosity, surfaceTemperature) {
  return Math.sqrt(Math.max(luminosity, 1e-8)) / Math.max((surfaceTemperature / 5772) ** 2, 1e-8)
}

export function mainSequenceLuminosity(mass) {
  if (mass < .43) return .23 * mass ** 2.3
  if (mass < 2) return mass ** 4
  if (mass < 55) return 1.4 * mass ** 3.5
  return 32000 * mass
}

export function inferStellarArchetype({ mass, surfaceTemperature, luminosity }) {
  const radius = stellarRadiusSolar(luminosity, surfaceTemperature)
  if (mass < .075) return stellarArchetypeById['brown-dwarf']
  if (surfaceTemperature > 400000 && radius < .01) return stellarArchetypeById['neutron-star']
  if (radius < .04 && luminosity < 2 && mass >= .3) return stellarArchetypeById['white-dwarf']
  if (surfaceTemperature >= 45000 && luminosity >= 30000 && radius < 20) return stellarArchetypeById['wolf-rayet']
  if (luminosity >= 10000 && surfaceTemperature >= 9000) return stellarArchetypeById['blue-supergiant']
  if (luminosity >= 10000 && surfaceTemperature < 5500) return stellarArchetypeById['red-supergiant']
  if (luminosity >= 100 && surfaceTemperature >= 8000) return stellarArchetypeById['blue-giant']
  if (luminosity >= 100 && surfaceTemperature < 6000) return stellarArchetypeById['red-giant']
  if (surfaceTemperature < 3900 && mass < .65) return stellarArchetypeById['red-dwarf']
  if (surfaceTemperature < 5200) return stellarArchetypeById['orange-dwarf']
  if (surfaceTemperature < 7000) return stellarArchetypeById['yellow-dwarf']
  return stellarArchetypeById['blue-main-sequence']
}
