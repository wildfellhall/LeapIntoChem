const subscripts = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' }

export function displayFormula(formula) {
  return formula.replace(/\d/g, (digit) => subscripts[digit])
}

function speciesLabel(species) {
  const coefficient = species.coefficient > 1 ? `${species.coefficient} ` : ''
  return `${coefficient}${displayFormula(species.formula)}${species.state ? `(${species.state})` : ''}`
}

function expandSpecies(species) {
  return species.flatMap((item) => Array.from({ length: item.coefficient }, () => item.formula))
}

export function createReaction({
  pair,
  reactants,
  products,
  product,
  formula = products[0].formula,
  ratio,
  effect,
  type,
  productState,
  appearance,
  energy = 'high',
  visual = 'flame',
  flameColor = '#ffd978',
  yield: modeledYield = 'High under the stated controlled conditions',
  leftovers = 'None in the ideal stoichiometric model',
  condition,
  arrow = '→',
  thermalEffect = 'exothermic',
  safety = 'Teacher-led simulation only; do not reproduce this reaction outside an appropriately equipped laboratory.',
}) {
  return {
    pair,
    reactants,
    products,
    equation: `${reactants.map(speciesLabel).join(' + ')} ${arrow} ${products.map(speciesLabel).join(' + ')}`,
    product,
    formula,
    ratio,
    effect,
    type,
    productState,
    appearance,
    energy,
    visual,
    flameColor,
    yield: modeledYield,
    leftovers,
    condition,
    thermalEffect,
    safety,
    reactantParticles: expandSpecies(reactants),
    productParticles: expandSpecies(products),
  }
}

export function reactionPairKey(pair) {
  return [...pair].sort().join('|')
}

const elementNames = {
  H: 'Hydrogen', Li: 'Lithium', Be: 'Beryllium', B: 'Boron', C: 'Carbon', N: 'Nitrogen', O: 'Oxygen', F: 'Fluorine',
  Na: 'Sodium', Mg: 'Magnesium', Al: 'Aluminum', Si: 'Silicon', P: 'Phosphorus', S: 'Sulfur', Cl: 'Chlorine',
  K: 'Potassium', Ca: 'Calcium', Fe: 'Iron', Cu: 'Copper', Zn: 'Zinc', Br: 'Bromine', Rb: 'Rubidium',
  Sr: 'Strontium', Ag: 'Silver', I: 'Iodine', Cs: 'Cesium', Ba: 'Barium',
}

const halogens = [
  { symbol: 'F', molecule: 'F2', suffix: 'fluoride', name: 'fluorine', condition: 'Specialized sealed equipment with fluorine gas; fluorine is extremely hazardous', color: '#fff4a2' },
  { symbol: 'Cl', molecule: 'Cl2', suffix: 'chloride', name: 'chlorine', condition: 'Dry chlorine atmosphere with controlled heating or ignition', color: '#d7eb63' },
  { symbol: 'Br', molecule: 'Br2', suffix: 'bromide', name: 'bromine', condition: 'Dry bromine vapor in sealed corrosion-resistant laboratory equipment', color: '#e06f47' },
  { symbol: 'I', molecule: 'I2', suffix: 'iodide', name: 'iodine', condition: 'Heated iodine vapor in a closed laboratory vessel', color: '#b07be8' },
]

const halideMetals = [
  { symbol: 'Li', charge: 1 }, { symbol: 'Na', charge: 1 }, { symbol: 'K', charge: 1 }, { symbol: 'Rb', charge: 1 }, { symbol: 'Cs', charge: 1 },
  { symbol: 'Be', charge: 2 }, { symbol: 'Mg', charge: 2 }, { symbol: 'Ca', charge: 2 }, { symbol: 'Sr', charge: 2 }, { symbol: 'Ba', charge: 2 },
  { symbol: 'Al', charge: 3 }, { symbol: 'Zn', charge: 2 }, { symbol: 'Ag', charge: 1 }, { symbol: 'Fe', charge: 3 }, { symbol: 'Cu', charge: 2 },
]

function halideAppearance(metal, halogen) {
  const special = {
    AgF: 'dark-brown to black silver(II) fluoride solid', AgCl: 'white light-sensitive solid', AgBr: 'cream light-sensitive solid', AgI: 'yellow light-sensitive solid',
    BeF: 'colorless network solid', BeCl: 'white hygroscopic polymeric solid', BeBr: 'white hygroscopic crystalline solid', BeI: 'white hygroscopic crystalline solid',
    AlF: 'white high-melting crystalline solid', AlCl: 'white-to-pale-yellow hygroscopic molecular solid', AlBr: 'colorless-to-pale-yellow hygroscopic molecular solid', AlI: 'white hygroscopic molecular solid',
    FeF3: 'pale-green to white crystalline solid', FeCl3: 'yellow-brown crystalline solid', FeBr3: 'dark red-brown crystalline solid', FeI2: 'gray-violet crystalline solid',
    CuF2: 'white crystalline solid', CuCl2: 'brown anhydrous solid; hydrated material is blue-green', CuBr2: 'dark brown to black crystalline solid', CuI: 'white crystalline solid',
  }
  return special[`${metal}${halogen}`] || 'white or colorless crystalline solid'
}

function halideReaction(metal, halogen) {
  const charge = metal.symbol === 'Ag' && halogen.symbol === 'F' ? 2 : metal.symbol === 'Fe' && halogen.symbol === 'I' ? 2 : metal.symbol === 'Cu' && halogen.symbol === 'I' ? 1 : metal.charge
  const formula = charge === 1 ? `${metal.symbol}${halogen.symbol}` : `${metal.symbol}${halogen.symbol}${charge}`
  const reactants = charge === 1
    ? [{ formula: metal.symbol, coefficient: 2, state: 's' }, { formula: halogen.molecule, coefficient: 1, state: halogen.symbol === 'Br' ? 'l' : halogen.symbol === 'I' ? 's' : 'g' }]
    : charge === 2
      ? [{ formula: metal.symbol, coefficient: 1, state: 's' }, { formula: halogen.molecule, coefficient: 1, state: halogen.symbol === 'Br' ? 'l' : halogen.symbol === 'I' ? 's' : 'g' }]
      : [{ formula: metal.symbol, coefficient: 2, state: 's' }, { formula: halogen.molecule, coefficient: 3, state: halogen.symbol === 'Br' ? 'l' : halogen.symbol === 'I' ? 's' : 'g' }]
  const products = [{ formula, coefficient: charge === 1 || charge === 3 ? 2 : 1, state: 's' }]
  const roman = metal.symbol === 'Fe' ? charge === 2 ? '(II)' : '(III)' : metal.symbol === 'Cu' ? charge === 1 ? '(I)' : '(II)' : metal.symbol === 'Ag' && charge === 2 ? '(II)' : ''
  const product = `${elementNames[metal.symbol]}${roman} ${halogen.suffix}`
  return createReaction({
    pair: [metal.symbol, halogen.symbol], reactants, products, product,
    ratio: `${reactants[0].coefficient} ${elementNames[metal.symbol].toLowerCase()} : ${reactants[1].coefficient} ${halogen.name} molecule${reactants[1].coefficient === 1 ? '' : 's'}`,
    effect: `${elementNames[metal.symbol]} transfers electrons to ${halogen.name}, producing ${product.toLowerCase()} in a strongly exothermic binary synthesis.`,
    type: 'Halide synthesis', productState: 'crystal', appearance: halideAppearance(metal.symbol, halogen.symbol), energy: 'intense', visual: 'flame', flameColor: halogen.color,
    condition: halogen.condition,
  })
}

const oxideEntries = [
  ['Li','Li2O',4,1,2,'Lithium oxide','white crystalline solid','Limited oxygen; lithium metal ignited under controlled conditions'],
  ['Na','Na2O2',2,1,1,'Sodium peroxide','pale-yellow ionic solid','Excess dry oxygen; sodium burns under controlled conditions'],
  ['K','KO2',1,1,1,'Potassium superoxide','yellow-orange ionic solid','Excess dry oxygen; controlled sealed apparatus'],
  ['Rb','RbO2',1,1,1,'Rubidium superoxide','yellow-orange ionic solid','Excess dry oxygen; controlled sealed apparatus'],
  ['Cs','CsO2',1,1,1,'Cesium superoxide','yellow-orange ionic solid','Excess dry oxygen; controlled sealed apparatus'],
  ['Be','BeO',2,1,2,'Beryllium oxide','white refractory solid','Strong heating in oxygen; beryllium compounds require specialized controls'],
  ['Mg','MgO',2,1,2,'Magnesium oxide','fine white refractory powder','Ignited magnesium ribbon in oxygen'],
  ['Ca','CaO',2,1,2,'Calcium oxide','white-to-gray quicklime solid','Ignited calcium metal in oxygen'],
  ['Sr','SrO',2,1,2,'Strontium oxide','white ionic solid','Heated strontium in controlled oxygen'],
  ['Ba','BaO',2,1,2,'Barium oxide','white-to-yellow ionic solid','Limited oxygen; barium can form peroxide in excess oxygen'],
  ['Al','Al2O3',4,3,2,'Aluminum oxide','thin hard ceramic oxide or white bulk solid','Bulk aluminum passivates in air; powder reacts vigorously'],
  ['Zn','ZnO',2,1,2,'Zinc oxide','yellow when hot and white when cool','Strongly heated zinc in oxygen'],
  ['Fe','Fe2O3',4,3,2,'Iron(III) oxide','porous red-brown oxide scale','Oxygen; ordinary rusting generally also requires water'],
  ['Cu','CuO',2,1,2,'Copper(II) oxide','black oxide surface','Copper strongly heated in oxygen'],
  ['C','CO2',1,1,1,'Carbon dioxide','colorless gas','Sufficient oxygen and ignition'],
  ['B','B2O3',4,3,2,'Boron trioxide','colorless glassy solid','Boron strongly heated in oxygen'],
  ['Si','SiO2',1,1,1,'Silicon dioxide','colorless network solid','Silicon heated strongly in oxygen'],
  ['P','P4O10',1,5,1,'Phosphorus pentoxide','white hygroscopic molecular solid','Phosphorus burned in excess dry oxygen'],
  ['S','SO2',1,1,1,'Sulfur dioxide','colorless pungent gas','Sulfur ignited in oxygen'],
  ['H','H2O',2,1,2,'Water','colorless hot water vapor that condenses on cooling','Controlled hydrogen/oxygen mixture with an ignition source'],
  ['N','NO',1,1,2,'Nitric oxide','colorless reactive gas','Very high temperature or electric discharge; equilibrium is favored only while hot'],
]

function oxideReaction([symbol, formula, elementCoefficient, oxygenCoefficient, productCoefficient, product, appearance, condition]) {
  const elementalFormula = symbol === 'H' ? 'H2' : symbol === 'N' ? 'N2' : symbol === 'P' ? 'P4' : symbol
  return createReaction({
    pair: [symbol,'O'],
    reactants: [{ formula: elementalFormula, coefficient: elementCoefficient, state: symbol === 'H' || symbol === 'N' ? 'g' : 's' }, { formula: 'O2', coefficient: oxygenCoefficient, state: 'g' }],
    products: [{ formula, coefficient: productCoefficient, state: ['CO2','SO2','H2O','NO'].includes(formula) ? 'g' : 's' }],
    product, ratio: `${elementCoefficient} ${elementNames[symbol].toLowerCase()} unit${elementCoefficient === 1 ? '' : 's'} : ${oxygenCoefficient} oxygen molecule${oxygenCoefficient === 1 ? '' : 's'}`,
    effect: `${elementNames[symbol]} is oxidized and ${product.toLowerCase()} forms; atoms are conserved in the displayed reaction event.`,
    type: symbol === 'H' || ['C','S','P'].includes(symbol) ? 'Combustion' : 'Oxidation', productState: ['CO2','SO2','H2O','NO'].includes(formula) ? formula === 'H2O' ? 'vapor' : 'gas' : 'solid', appearance,
    energy: symbol === 'N' ? 'low' : 'high', visual: ['CO2','SO2','H2O'].includes(formula) ? 'flame' : ['Fe2O3','CuO','Al2O3'].includes(formula) ? 'surface' : 'white-flare', condition,
    yield: symbol === 'N' ? 'Small equilibrium yield at very high temperature' : 'High under the stated controlled conditions',
    leftovers: symbol === 'N' ? 'Nitrogen and oxygen remain because the reaction is an equilibrium' : 'None in the ideal stoichiometric model',
    thermalEffect: symbol === 'N' ? 'endothermic' : 'exothermic',
  })
}

const sulfideMetals = [
  { symbol: 'Li', charge: 1 }, { symbol: 'Na', charge: 1 }, { symbol: 'K', charge: 1 }, { symbol: 'Rb', charge: 1 }, { symbol: 'Cs', charge: 1 },
  { symbol: 'Be', charge: 2 }, { symbol: 'Mg', charge: 2 }, { symbol: 'Ca', charge: 2 }, { symbol: 'Sr', charge: 2 }, { symbol: 'Ba', charge: 2 },
  { symbol: 'Al', charge: 3 }, { symbol: 'Zn', charge: 2 }, { symbol: 'Ag', charge: 1 }, { symbol: 'Fe', charge: 2 }, { symbol: 'Cu', charge: 1 },
]

function sulfideReaction(metal) {
  const formula = metal.charge === 1 ? `${metal.symbol}2S` : metal.charge === 2 ? `${metal.symbol}S` : `${metal.symbol}2S3`
  const reactants = metal.charge === 1
    ? [{ formula: metal.symbol, coefficient: 2, state: 's' }, { formula: 'S', coefficient: 1, state: 's' }]
    : metal.charge === 2
      ? [{ formula: metal.symbol, coefficient: 1, state: 's' }, { formula: 'S', coefficient: 1, state: 's' }]
      : [{ formula: metal.symbol, coefficient: 2, state: 's' }, { formula: 'S', coefficient: 3, state: 's' }]
  const products = [{ formula, coefficient: 1, state: 's' }]
  const specialName = metal.symbol === 'Fe' ? 'Iron(II) sulfide' : metal.symbol === 'Cu' ? 'Copper(I) sulfide' : `${elementNames[metal.symbol]} sulfide`
  const appearance = metal.symbol === 'Zn' ? 'white to pale-yellow crystalline solid' : metal.symbol === 'Ag' ? 'black tarnish-like solid' : ['Fe','Cu'].includes(metal.symbol) ? 'dark metallic-looking solid' : 'white, gray, or pale ionic solid'
  return createReaction({ pair: [metal.symbol,'S'], reactants, products, product: specialName, ratio: `${reactants[0].coefficient} metal atom${reactants[0].coefficient === 1 ? '' : 's'} : ${reactants[1].coefficient} sulfur atom${reactants[1].coefficient === 1 ? '' : 's'}`, effect: `${elementNames[metal.symbol]} and sulfur combine on heating to form ${specialName.toLowerCase()}.`, type: 'Sulfide synthesis', productState: 'solid', appearance, energy: 'high', visual: 'flame', flameColor: '#ffd24c', condition: 'Carefully heated elemental mixture in an appropriate closed laboratory system' })
}

const nitrideEntries = [
  ['Li','Li3N',6,2,'Lithium nitride','red-brown crystalline solid'],
  ['Be','Be3N2',3,1,'Beryllium nitride','gray crystalline solid'],
  ['Mg','Mg3N2',3,1,'Magnesium nitride','greenish-yellow crystalline solid'],
  ['Ca','Ca3N2',3,1,'Calcium nitride','red-brown crystalline solid'],
  ['Sr','Sr3N2',3,1,'Strontium nitride','dark brown crystalline solid'],
  ['Ba','Ba3N2',3,1,'Barium nitride','dark brown crystalline solid'],
  ['Al','AlN',2,2,'Aluminum nitride','white-to-gray ceramic solid'],
]

function nitrideReaction([symbol, formula, metalCoefficient, productCoefficient, product, appearance]) {
  return createReaction({ pair: [symbol,'N'], reactants: [{ formula: symbol, coefficient: metalCoefficient, state: 's' }, { formula: 'N2', coefficient: 1, state: 'g' }], products: [{ formula, coefficient: productCoefficient, state: 's' }], product, ratio: `${metalCoefficient} metal atoms : 1 nitrogen molecule`, effect: `${elementNames[symbol]} fixes nitrogen into ${product.toLowerCase()} under strong heating.`, type: 'Nitride synthesis', productState: 'solid', appearance, energy: 'high', visual: 'white-flare', condition: 'Strong heating in dry nitrogen; specialized laboratory controls required' })
}

const hydrideEntries = [
  ['Li','LiH',2,2,'Lithium hydride'], ['Na','NaH',2,2,'Sodium hydride'], ['K','KH',2,2,'Potassium hydride'], ['Rb','RbH',2,2,'Rubidium hydride'], ['Cs','CsH',2,2,'Cesium hydride'],
  ['Mg','MgH2',1,1,'Magnesium hydride'], ['Ca','CaH2',1,1,'Calcium hydride'], ['Sr','SrH2',1,1,'Strontium hydride'], ['Ba','BaH2',1,1,'Barium hydride'],
]

function hydrideReaction([symbol, formula, metalCoefficient, productCoefficient, product]) {
  return createReaction({ pair: [symbol,'H'], reactants: [{ formula: symbol, coefficient: metalCoefficient, state: 's' }, { formula: 'H2', coefficient: 1, state: 'g' }], products: [{ formula, coefficient: productCoefficient, state: 's' }], product, ratio: `${metalCoefficient} metal atom${metalCoefficient === 1 ? '' : 's'} : 1 hydrogen molecule`, effect: `${elementNames[symbol]} combines with hydrogen to form an ionic or saline hydride.`, type: 'Hydride synthesis', productState: 'solid', appearance: 'white-to-gray crystalline solid', energy: 'high', visual: 'flash', condition: 'Elevated temperature and, for some metals, elevated hydrogen pressure in specialized equipment', safety: 'Teacher-led simulation only. Metal hydrides can react violently with moisture and must not be handled without specialist facilities.' })
}

const additionalMolecularReactions = [
  createReaction({ pair: ['H','F'], reactants: [{ formula: 'H2', coefficient: 1, state: 'g' }, { formula: 'F2', coefficient: 1, state: 'g' }], products: [{ formula: 'HF', coefficient: 2, state: 'g' }], product: 'Hydrogen fluoride', ratio: '1 hydrogen molecule : 1 fluorine molecule', effect: 'Hydrogen and fluorine combine explosively even under very mild initiation, producing colorless hydrogen fluoride gas.', type: 'Hydrogen-halide synthesis', productState: 'gas', appearance: 'colorless hydrogen fluoride gas', energy: 'intense', visual: 'flash', flameColor: '#e9ffad', condition: 'Specialized remote sealed apparatus; the reaction can initiate at very low temperature' }),
  createReaction({ pair: ['H','Br'], reactants: [{ formula: 'H2', coefficient: 1, state: 'g' }, { formula: 'Br2', coefficient: 1, state: 'g' }], products: [{ formula: 'HBr', coefficient: 2, state: 'g' }], product: 'Hydrogen bromide', ratio: '1 hydrogen molecule : 1 bromine molecule', effect: 'On heating, hydrogen and bromine form colorless hydrogen bromide gas.', type: 'Hydrogen-halide synthesis', productState: 'gas', appearance: 'colorless hydrogen bromide gas', energy: 'high', visual: 'flame', flameColor: '#e47d54', condition: 'Heated bromine vapor and hydrogen in specialized sealed equipment' }),
  createReaction({ pair: ['H','I'], reactants: [{ formula: 'H2', coefficient: 1, state: 'g' }, { formula: 'I2', coefficient: 1, state: 'g' }], products: [{ formula: 'HI', coefficient: 2, state: 'g' }], product: 'Hydrogen iodide', ratio: '1 hydrogen molecule : 1 iodine molecule', effect: 'Hot hydrogen and iodine establish a reversible equilibrium with hydrogen iodide.', type: 'Equilibrium synthesis', productState: 'gas', appearance: 'colorless hydrogen iodide mixed with violet iodine vapor at equilibrium', energy: 'low', visual: 'vapor', flameColor: '#bd8cff', condition: 'High temperature in a sealed vessel', arrow: '⇌', thermalEffect: 'endothermic', yield: 'Equilibrium mixture; conversion depends strongly on temperature', leftovers: 'Hydrogen and iodine remain at equilibrium' }),
  createReaction({ pair: ['B','F'], reactants: [{ formula: 'B', coefficient: 2, state: 's' }, { formula: 'F2', coefficient: 3, state: 'g' }], products: [{ formula: 'BF3', coefficient: 2, state: 'g' }], product: 'Boron trifluoride', ratio: '2 boron atoms : 3 fluorine molecules', effect: 'Boron burns in fluorine to form electron-deficient boron trifluoride gas.', type: 'Molecular-halide synthesis', productState: 'gas', appearance: 'colorless boron trifluoride gas', energy: 'intense', visual: 'flame', flameColor: '#f5ffb5', condition: 'Dry fluorine in specialized corrosion-resistant sealed equipment' }),
  createReaction({ pair: ['B','Cl'], reactants: [{ formula: 'B', coefficient: 2, state: 's' }, { formula: 'Cl2', coefficient: 3, state: 'g' }], products: [{ formula: 'BCl3', coefficient: 2, state: 'g' }], product: 'Boron trichloride', ratio: '2 boron atoms : 3 chlorine molecules', effect: 'Strongly heated boron reacts with dry chlorine to form volatile boron trichloride.', type: 'Molecular-halide synthesis', productState: 'gas', appearance: 'colorless fuming boron trichloride gas', energy: 'high', visual: 'flame', flameColor: '#d9ed68', condition: 'Strong heating in dry chlorine; moisture excluded' }),
  createReaction({ pair: ['B','Br'], reactants: [{ formula: 'B', coefficient: 2, state: 's' }, { formula: 'Br2', coefficient: 3, state: 'g' }], products: [{ formula: 'BBr3', coefficient: 2, state: 'l' }], product: 'Boron tribromide', ratio: '2 boron atoms : 3 bromine molecules', effect: 'Heated boron and bromine vapor form dense molecular boron tribromide.', type: 'Molecular-halide synthesis', productState: 'liquid', appearance: 'colorless-to-faint-amber dense liquid', energy: 'high', visual: 'flame', flameColor: '#dc724d', condition: 'Heated bromine vapor over boron in dry sealed equipment' }),
  createReaction({ pair: ['B','I'], reactants: [{ formula: 'B', coefficient: 2, state: 's' }, { formula: 'I2', coefficient: 3, state: 'g' }], products: [{ formula: 'BI3', coefficient: 2, state: 's' }], product: 'Boron triiodide', ratio: '2 boron atoms : 3 iodine molecules', effect: 'Heated boron and iodine vapor form moisture-sensitive boron triiodide.', type: 'Molecular-halide synthesis', productState: 'solid', appearance: 'pale crystalline moisture-sensitive solid', energy: 'high', visual: 'vapor', flameColor: '#b58ae2', condition: 'Elevated temperature in a dry sealed vessel' }),
  createReaction({ pair: ['Si','F'], reactants: [{ formula: 'Si', coefficient: 1, state: 's' }, { formula: 'F2', coefficient: 2, state: 'g' }], products: [{ formula: 'SiF4', coefficient: 1, state: 'g' }], product: 'Silicon tetrafluoride', ratio: '1 silicon atom : 2 fluorine molecules', effect: 'Silicon reacts vigorously with fluorine to form tetrahedral silicon tetrafluoride gas.', type: 'Molecular-halide synthesis', productState: 'gas', appearance: 'colorless silicon tetrafluoride gas', energy: 'intense', visual: 'flame', flameColor: '#f4ffac', condition: 'Dry fluorine in specialized corrosion-resistant equipment' }),
  createReaction({ pair: ['Si','Cl'], reactants: [{ formula: 'Si', coefficient: 1, state: 's' }, { formula: 'Cl2', coefficient: 2, state: 'g' }], products: [{ formula: 'SiCl4', coefficient: 1, state: 'l' }], product: 'Silicon tetrachloride', ratio: '1 silicon atom : 2 chlorine molecules', effect: 'Heated silicon reacts with dry chlorine and the volatile product condenses as silicon tetrachloride.', type: 'Molecular-halide synthesis', productState: 'liquid', appearance: 'clear volatile liquid that fumes in moist air', energy: 'high', visual: 'flame', flameColor: '#d6e967', condition: 'Heated silicon in dry chlorine; moisture excluded' }),
  createReaction({ pair: ['Si','Br'], reactants: [{ formula: 'Si', coefficient: 1, state: 's' }, { formula: 'Br2', coefficient: 2, state: 'g' }], products: [{ formula: 'SiBr4', coefficient: 1, state: 'l' }], product: 'Silicon tetrabromide', ratio: '1 silicon atom : 2 bromine molecules', effect: 'Heated silicon combines with bromine vapor to form tetrahedral silicon tetrabromide.', type: 'Molecular-halide synthesis', productState: 'liquid', appearance: 'colorless-to-pale-yellow molecular liquid', energy: 'high', visual: 'flame', flameColor: '#dc7650', condition: 'Heated silicon and dry bromine vapor in sealed equipment' }),
  createReaction({ pair: ['Si','I'], reactants: [{ formula: 'Si', coefficient: 1, state: 's' }, { formula: 'I2', coefficient: 2, state: 'g' }], products: [{ formula: 'SiI4', coefficient: 1, state: 's' }], product: 'Silicon tetraiodide', ratio: '1 silicon atom : 2 iodine molecules', effect: 'Silicon and iodine combine on strong heating to form crystalline silicon tetraiodide.', type: 'Molecular-halide synthesis', productState: 'solid', appearance: 'colorless crystalline molecular solid', energy: 'high', visual: 'vapor', flameColor: '#b68ce0', condition: 'Strong heating with iodine vapor in dry sealed equipment' }),
  createReaction({ pair: ['C','F'], reactants: [{ formula: 'C', coefficient: 1, state: 's' }, { formula: 'F2', coefficient: 2, state: 'g' }], products: [{ formula: 'CF4', coefficient: 1, state: 'g' }], product: 'Carbon tetrafluoride', ratio: '1 carbon atom : 2 fluorine molecules', effect: 'Carbon burns in fluorine to form very stable carbon tetrafluoride gas.', type: 'Molecular-halide synthesis', productState: 'gas', appearance: 'colorless carbon tetrafluoride gas', energy: 'intense', visual: 'flame', flameColor: '#efffa8', condition: 'Specialized sealed fluorine apparatus with controlled ignition' }),
  createReaction({ pair: ['C','Cl'], reactants: [{ formula: 'C', coefficient: 1, state: 's' }, { formula: 'Cl2', coefficient: 2, state: 'g' }], products: [{ formula: 'CCl4', coefficient: 1, state: 'l' }], product: 'Carbon tetrachloride', ratio: '1 carbon atom : 2 chlorine molecules', effect: 'The modeled high-temperature chlorination produces molecular carbon tetrachloride.', type: 'Molecular-halide synthesis', productState: 'liquid', appearance: 'clear dense volatile liquid', energy: 'high', visual: 'flame', flameColor: '#d7e75e', condition: 'Idealized high-temperature direct synthesis in sealed dry equipment' }),
  createReaction({ pair: ['C','S'], reactants: [{ formula: 'C', coefficient: 4, state: 's' }, { formula: 'S8', coefficient: 1, state: 's' }], products: [{ formula: 'CS2', coefficient: 4, state: 'l' }], product: 'Carbon disulfide', ratio: '4 carbon atoms : 1 sulfur octamer', effect: 'At high temperature, carbon and sulfur vapor form volatile carbon disulfide.', type: 'Binary molecular synthesis', productState: 'liquid', appearance: 'clear, highly volatile carbon disulfide liquid', energy: 'high', visual: 'vapor', flameColor: '#83baff', condition: 'Industrial high-temperature furnace with vapor containment' }),
  createReaction({ pair: ['P','F'], reactants: [{ formula: 'P4', coefficient: 1, state: 's' }, { formula: 'F2', coefficient: 6, state: 'g' }], products: [{ formula: 'PF3', coefficient: 4, state: 'g' }], product: 'Phosphorus trifluoride', ratio: '1 phosphorus tetrahedron : 6 fluorine molecules', effect: 'Under fluorine-limited conditions, phosphorus forms trigonal-pyramidal phosphorus trifluoride.', type: 'Molecular-halide synthesis', productState: 'gas', appearance: 'colorless phosphorus trifluoride gas', energy: 'intense', visual: 'flame', flameColor: '#ecffa5', condition: 'Carefully fluorine-limited sealed synthesis; excess fluorine favors PF5' }),
  createReaction({ pair: ['P','Br'], reactants: [{ formula: 'P4', coefficient: 1, state: 's' }, { formula: 'Br2', coefficient: 6, state: 'l' }], products: [{ formula: 'PBr3', coefficient: 4, state: 'l' }], product: 'Phosphorus tribromide', ratio: '1 phosphorus tetrahedron : 6 bromine molecules', effect: 'Controlled bromination of phosphorus forms phosphorus tribromide.', type: 'Molecular-halide synthesis', productState: 'liquid', appearance: 'colorless-to-pale fuming liquid', energy: 'high', visual: 'flame', flameColor: '#dd724b', condition: 'Bromine added slowly to phosphorus under inert, moisture-free control' }),
  createReaction({ pair: ['P','I'], reactants: [{ formula: 'P4', coefficient: 1, state: 's' }, { formula: 'I2', coefficient: 6, state: 's' }], products: [{ formula: 'PI3', coefficient: 4, state: 's' }], product: 'Phosphorus triiodide', ratio: '1 phosphorus tetrahedron : 6 iodine molecules', effect: 'Phosphorus and iodine form unstable red phosphorus triiodide.', type: 'Molecular-halide synthesis', productState: 'solid', appearance: 'dark-red unstable solid', energy: 'high', visual: 'vapor', flameColor: '#b688dc', condition: 'Controlled dry combination; product is commonly prepared where it will be consumed' }),
  createReaction({ pair: ['S','F'], reactants: [{ formula: 'S8', coefficient: 1, state: 's' }, { formula: 'F2', coefficient: 24, state: 'g' }], products: [{ formula: 'SF6', coefficient: 8, state: 'g' }], product: 'Sulfur hexafluoride', ratio: '1 sulfur octamer : 24 fluorine molecules', effect: 'Excess fluorine converts elemental sulfur into stable octahedral sulfur hexafluoride gas.', type: 'Molecular-halide synthesis', productState: 'gas', appearance: 'colorless sulfur hexafluoride gas', energy: 'intense', visual: 'flame', flameColor: '#efffa5', condition: 'Excess fluorine in specialized corrosion-resistant sealed equipment' }),
]

export const generatedReactions = [
  ...additionalMolecularReactions,
  ...halideMetals.flatMap((metal) => halogens.map((halogen) => halideReaction(metal, halogen))),
  ...oxideEntries.map(oxideReaction),
  ...sulfideMetals.map(sulfideReaction),
  ...nitrideEntries.map(nitrideReaction),
  ...hydrideEntries.map(hydrideReaction),
]
