import { createReaction, generatedReactions, reactionPairKey } from './reactionCatalog.js'

export const compounds = [
  ['Water', 'H2O', 'liquid', 'A bent polar molecule and Earth’s most important solvent.'],
  ['Carbon dioxide', 'CO2', 'gas', 'A linear molecule used by plants during photosynthesis.'],
  ['Oxygen', 'O2', 'gas', 'The diatomic oxidizer used in cellular respiration.'],
  ['Nitrogen', 'N2', 'gas', 'A strong triple bond makes atmospheric nitrogen quite stable.'],
  ['Hydrogen', 'H2', 'gas', 'The lightest molecule and a clean fuel when reacted carefully.'],
  ['Methane', 'CH4', 'gas', 'A tetrahedral molecule and the main component of natural gas.'],
  ['Ammonia', 'NH3', 'gas', 'A trigonal-pyramidal base used to make fertilizers.'],
  ['Sodium chloride', 'NaCl', 'crystal', 'An ionic lattice better known as table salt.'],
  ['Hydrogen chloride', 'HCl', 'gas', 'Dissolves in water to make hydrochloric acid.'],
  ['Sulfuric acid', 'H2SO4', 'liquid', 'A strong diprotic acid used throughout industry.'],
  ['Nitric acid', 'HNO3', 'liquid', 'A strong acid and powerful oxidizing agent.'],
  ['Glucose', 'C6H12O6', 'solid', 'A sugar that cells use as a readily available energy source.'],
  ['Ethanol', 'C2H6O', 'liquid', 'A polar alcohol used as a solvent and biofuel.'],
  ['Hydrogen peroxide', 'H2O2', 'liquid', 'An oxygen–oxygen bond makes this a useful oxidizer.'],
  ['Sulfur dioxide', 'SO2', 'gas', 'A bent gas produced by sulfur combustion.'],
  ['Sulfur trioxide', 'SO3', 'gas', 'A trigonal-planar precursor to sulfuric acid.'],
  ['Nitric oxide', 'NO', 'gas', 'A reactive signaling molecule with one unpaired electron.'],
  ['Nitrogen dioxide', 'NO2', 'gas', 'A reddish-brown pollutant that helps form nitric acid.'],
  ['Nitrous oxide', 'N2O', 'gas', 'A linear greenhouse gas sometimes called laughing gas.'],
  ['Carbon monoxide', 'CO', 'gas', 'A toxic gas that binds strongly to hemoglobin.'],
  ['Calcium carbonate', 'CaCO3', 'solid', 'The principal mineral in chalk, limestone, and shells.'],
  ['Sodium bicarbonate', 'NaHCO3', 'solid', 'Baking soda releases carbon dioxide when acidified.'],
  ['Sodium hydroxide', 'NaOH', 'solid', 'A strong ionic base also called lye.'],
  ['Potassium hydroxide', 'KOH', 'solid', 'A strong base used in alkaline batteries and soap.'],
  ['Magnesium oxide', 'MgO', 'solid', 'A high-melting ionic solid with a cubic lattice.'],
  ['Calcium oxide', 'CaO', 'solid', 'Quicklime reacts with water and releases heat.'],
  ['Iron(III) oxide', 'Fe2O3', 'solid', 'The red-brown main component of ordinary rust.'],
  ['Magnetite', 'Fe3O4', 'solid', 'A naturally magnetic mixed iron oxide.'],
  ['Copper(II) oxide', 'CuO', 'solid', 'A black solid containing copper in the +2 state.'],
  ['Copper(I) oxide', 'Cu2O', 'solid', 'A red solid containing copper in the +1 state.'],
  ['Aluminum oxide', 'Al2O3', 'solid', 'A hard ceramic that protects aluminum from corrosion.'],
  ['Silicon dioxide', 'SiO2', 'solid', 'A network solid found in quartz and most sand.'],
  ['Potassium chloride', 'KCl', 'crystal', 'An ionic salt used as fertilizer and electrolyte.'],
  ['Calcium chloride', 'CaCl2', 'crystal', 'A hygroscopic salt used for de-icing and drying.'],
  ['Magnesium chloride', 'MgCl2', 'crystal', 'An ionic compound present in seawater.'],
  ['Ammonium chloride', 'NH4Cl', 'crystal', 'An ionic salt of ammonium and chloride ions.'],
  ['Acetic acid', 'C2H4O2', 'liquid', 'The weak acid responsible for vinegar’s sour taste.'],
  ['Propane', 'C3H8', 'gas', 'A three-carbon fuel stored as a liquefied gas.'],
  ['Butane', 'C4H10', 'gas', 'A four-carbon fuel commonly used in lighters.'],
  ['Ethene', 'C2H4', 'gas', 'A plant hormone with a carbon–carbon double bond.'],
  ['Ethyne', 'C2H2', 'gas', 'Acetylene has a carbon–carbon triple bond.'],
  ['Ozone', 'O3', 'gas', 'A bent allotrope that absorbs ultraviolet radiation.'],
  ['Hydrogen sulfide', 'H2S', 'gas', 'A toxic gas with the smell of rotten eggs.'],
  ['Carbon disulfide', 'CS2', 'liquid', 'A linear, volatile sulfur-containing solvent.'],
  ['Phosphorus', 'P4', 'solid', 'White phosphorus forms strained tetrahedral P₄ units.'],
  ['Phosphorus trichloride', 'PCl3', 'liquid', 'A reactive trigonal-pyramidal phosphorus compound.'],
  ['Phosphorus pentachloride', 'PCl5', 'solid', 'A chlorinating reagent with five P–Cl bonds.'],
  ['Sulfur hexafluoride', 'SF6', 'gas', 'A very stable octahedral gas and strong greenhouse gas.'],
  ['Carbon tetrafluoride', 'CF4', 'gas', 'A highly stable tetrahedral fluorocarbon.'],
  ['Carbon tetrachloride', 'CCl4', 'liquid', 'A nonpolar tetrahedral solvent that is hazardous to health.'],
  ['Chloroform', 'CHCl3', 'liquid', 'A dense volatile liquid with a tetrahedral carbon center.'],
  ['Sodium carbonate', 'Na2CO3', 'solid', 'Washing soda is a basic ionic compound.'],
  ['Potassium nitrate', 'KNO3', 'crystal', 'Saltpeter supplies oxygen in some energetic mixtures.'],
  ['Calcium sulfate', 'CaSO4', 'solid', 'The main compound in gypsum and plaster.'],
  ['Copper(II) sulfate', 'CuSO4', 'crystal', 'Hydrated crystals are vividly blue.'],
  ['Potassium permanganate', 'KMnO4', 'crystal', 'A deep-purple salt and strong oxidizer.'],
  ['Silver nitrate', 'AgNO3', 'crystal', 'A light-sensitive salt used to test for halides.'],
  ['Zinc oxide', 'ZnO', 'solid', 'A white semiconductor used in sunscreens.'],
  ['Zinc chloride', 'ZnCl2', 'solid', 'A hygroscopic Lewis acid used as a flux.'],
  ['Iron(III) chloride', 'FeCl3', 'solid', 'A brown-yellow salt used to etch copper.'],
  ['Sodium sulfate', 'Na2SO4', 'solid', 'A stable ionic salt used in detergents.'],
  ['Magnesium sulfate', 'MgSO4', 'crystal', 'Its hydrated form is known as Epsom salt.'],
  ['Lithium fluoride', 'LiF', 'crystal', 'A transparent ionic crystal with a wide band gap.'],
  ['Potassium iodide', 'KI', 'crystal', 'An iodide salt used to support thyroid health.'],
  ['Bromine', 'Br2', 'liquid', 'The only nonmetal that is liquid near room temperature.'],
  ['Iodine', 'I2', 'solid', 'A dark crystal that can sublime into violet vapor.'],
  ['Hydrogen fluoride', 'HF', 'gas', 'A strongly polar hydrogen halide that forms hydrofluoric acid when dissolved in water.'],
  ['Hydrogen bromide', 'HBr', 'gas', 'A polar hydrogen halide that dissolves readily in water.'],
  ['Hydrogen iodide', 'HI', 'gas', 'A polar, easily oxidized hydrogen halide with a relatively weak H–I bond.'],
  ['Boron trifluoride', 'BF3', 'gas', 'An electron-deficient trigonal-planar molecule and strong Lewis acid.'],
  ['Boron trichloride', 'BCl3', 'gas', 'A trigonal-planar molecular Lewis acid that fumes in moist air.'],
  ['Boron tribromide', 'BBr3', 'liquid', 'A dense molecular liquid used to cleave certain oxygen–carbon bonds.'],
  ['Boron triiodide', 'BI3', 'solid', 'A moisture-sensitive trigonal-planar boron halide.'],
  ['Silicon tetrafluoride', 'SiF4', 'gas', 'A tetrahedral molecular gas that reacts rapidly with moisture.'],
  ['Silicon tetrachloride', 'SiCl4', 'liquid', 'A volatile tetrahedral liquid that hydrolyzes in moist air.'],
  ['Silicon tetrabromide', 'SiBr4', 'liquid', 'A tetrahedral molecular liquid used as a silicon precursor.'],
  ['Silicon tetraiodide', 'SiI4', 'solid', 'A tetrahedral molecular solid with four silicon–iodine bonds.'],
  ['Boron trioxide', 'B2O3', 'solid', 'A glass-forming network oxide used in borosilicate materials.'],
  ['Phosphorus pentoxide', 'P4O10', 'solid', 'A cage-like molecular solid and powerful drying agent often written by its empirical formula P₂O₅.'],
  ['Phosphorus trifluoride', 'PF3', 'gas', 'A trigonal-pyramidal molecular gas with a lone pair on phosphorus.'],
  ['Phosphorus tribromide', 'PBr3', 'liquid', 'A colorless-to-pale liquid used to replace hydroxyl groups with bromine.'],
  ['Phosphorus triiodide', 'PI3', 'solid', 'An unstable red solid commonly generated where it is used.'],
  ['Sodium fluoride', 'NaF', 'crystal', 'A colorless ionic solid made from Na⁺ and F⁻ in a repeating lattice.'],
  ['Sodium bromide', 'NaBr', 'crystal', 'A colorless ionic bromide salt with a cubic lattice.'],
  ['Sodium iodide', 'NaI', 'crystal', 'A hygroscopic ionic solid used in radiation detectors and organic chemistry.'],
].map(([name, formula, state, fact], id) => ({ id, name, formula, state, fact }))

export function parseFormula(formula) {
  const stack = [{}]
  const tokens = formula.match(/[A-Z][a-z]?|\d+|\(|\)/g) || []
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i]
    if (token === '(') {
      stack.push({})
    } else if (token === ')') {
      const group = stack.pop()
      const multiplier = /^\d+$/.test(tokens[i + 1] || '') ? Number(tokens[++i]) : 1
      Object.entries(group).forEach(([symbol, count]) => {
        stack.at(-1)[symbol] = (stack.at(-1)[symbol] || 0) + count * multiplier
      })
    } else if (/^[A-Z]/.test(token)) {
      const count = /^\d+$/.test(tokens[i + 1] || '') ? Number(tokens[++i]) : 1
      stack.at(-1)[token] = (stack.at(-1)[token] || 0) + count
    }
  }
  return stack[0]
}

export function compositionKey(composition) {
  return Object.entries(composition)
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([symbol, count]) => `${symbol}${count}`)
    .join('|')
}

export const compoundByComposition = Object.fromEntries(
  compounds.map((compound) => [compositionKey(parseFormula(compound.formula)), compound]),
)

const coreReactionDetails = [
  { pair: ['H', 'O'], equation: '2 H₂ + O₂ → 2 H₂O(g)', product: 'Water', formula: 'H2O', ratio: '2 hydrogen : 1 oxygen', effect: 'Ignition releases intense heat; hot water vapor forms, then condenses on cooling.', type: 'Combustion', productState: 'vapor', appearance: 'colorless water vapor · droplets form on cooling', energy: 'intense', visual: 'flame', flameColor: '#8fcfff', yield: 'Near-complete with an exact 2:1 mixture', leftovers: 'None in the ideal stoichiometric model', condition: 'Ignition source; controlled H₂/O₂ mixture' },
  { pair: ['Na', 'Cl'], equation: '2 Na + Cl₂ → 2 NaCl(s)', product: 'Sodium chloride', formula: 'NaCl', ratio: '2 sodium : 1 chlorine molecule', effect: 'Sodium burns brightly in chlorine and leaves white cubic salt crystals.', type: 'Synthesis', productState: 'crystal', appearance: 'white cubic ionic crystals', energy: 'intense', visual: 'flame', flameColor: '#ffe56d', yield: 'Complete in the ideal closed chamber', leftovers: 'None at the balanced ratio', condition: 'Dry chlorine atmosphere' },
  { pair: ['C', 'O'], equation: 'C + O₂ → CO₂(g)', product: 'Carbon dioxide', formula: 'CO2', ratio: '1 carbon : 1 oxygen molecule', effect: 'Carbon glows while invisible carbon dioxide gas disperses.', type: 'Combustion', productState: 'gas', appearance: 'colorless carbon dioxide gas', energy: 'high', visual: 'flame', flameColor: '#ff9f55', yield: 'Complete combustion with excess oxygen', leftovers: 'None at the balanced ratio', condition: 'Sufficient oxygen and ignition' },
  { pair: ['Mg', 'O'], equation: '2 Mg + O₂ → 2 MgO(s)', product: 'Magnesium oxide', formula: 'MgO', ratio: '2 magnesium : 1 oxygen molecule', effect: 'An intense white flare leaves a fine white magnesium oxide powder.', type: 'Combustion', productState: 'solid', appearance: 'fine white magnesium oxide powder', energy: 'intense', visual: 'white-flare', flameColor: '#ffffff', yield: 'High; a little nitride can form in air', leftovers: 'None in pure oxygen at the balanced ratio', condition: 'Ignited magnesium ribbon' },
  { pair: ['Fe', 'O'], equation: '4 Fe + 3 O₂ → 2 Fe₂O₃(s)', product: 'Iron(III) oxide', formula: 'Fe2O3', ratio: '4 iron : 3 oxygen molecules', effect: 'Oxidation slowly builds a rough red-brown iron oxide surface.', type: 'Oxidation', productState: 'solid', appearance: 'porous red-brown iron oxide scale', energy: 'low', visual: 'surface', yield: 'Surface-limited; moisture accelerates corrosion', leftovers: 'Unreacted iron remains beneath the oxide', condition: 'Oxygen; rusting usually also needs water' },
  { pair: ['Cu', 'O'], equation: '2 Cu + O₂ → 2 CuO(s)', product: 'Copper(II) oxide', formula: 'CuO', ratio: '2 copper : 1 oxygen molecule', effect: 'Heated copper develops a black copper(II) oxide coating.', type: 'Oxidation', productState: 'solid', appearance: 'black copper(II) oxide surface', energy: 'moderate', visual: 'surface', yield: 'Surface layer grows while heated', leftovers: 'Metallic copper remains below the coating', condition: 'Copper heated in oxygen' },
  { pair: ['Al', 'O'], equation: '4 Al + 3 O₂ → 2 Al₂O₃(s)', product: 'Aluminum oxide', formula: 'Al2O3', ratio: '4 aluminum : 3 oxygen molecules', effect: 'A thin, transparent ceramic oxide film seals the aluminum surface.', type: 'Oxidation', productState: 'solid', appearance: 'thin, hard aluminum oxide ceramic', energy: 'moderate', visual: 'surface', yield: 'Self-limiting protective surface film', leftovers: 'Bulk aluminum remains protected underneath', condition: 'Room air; powder reacts much more vigorously' },
  { pair: ['N', 'H'], equation: 'N₂ + 3 H₂ ⇌ 2 NH₃(g)', product: 'Ammonia', formula: 'NH3', ratio: '1 nitrogen : 3 hydrogen molecules', effect: 'An iron catalyst establishes an equilibrium mixture containing ammonia.', type: 'Haber process', productState: 'gas', appearance: 'colorless ammonia gas in an equilibrium mixture', energy: 'moderate', visual: 'gas', yield: 'Partial per pass; ammonia is condensed and gases recycled', leftovers: 'Unreacted N₂ and H₂ remain at equilibrium', condition: '≈450 °C, ≈200 atm, iron catalyst' },
  { pair: ['K', 'Cl'], equation: '2 K + Cl₂ → 2 KCl(s)', product: 'Potassium chloride', formula: 'KCl', ratio: '2 potassium : 1 chlorine molecule', effect: 'Potassium reacts vigorously with violet light and leaves a white ionic solid.', type: 'Synthesis', productState: 'crystal', appearance: 'white cubic potassium chloride crystals', energy: 'intense', visual: 'flame', flameColor: '#bb78ff', yield: 'Complete in the ideal closed chamber', leftovers: 'None at the balanced ratio', condition: 'Dry chlorine atmosphere' },
  { pair: ['H', 'Cl'], equation: 'H₂ + Cl₂ → 2 HCl(g)', product: 'Hydrogen chloride', formula: 'HCl', ratio: '1 hydrogen : 1 chlorine molecule', effect: 'Light triggers a rapid chain reaction producing colorless hydrogen chloride gas.', type: 'Photochemical synthesis', productState: 'gas', appearance: 'colorless hydrogen chloride gas · fumes in moist air', energy: 'intense', visual: 'flash', flameColor: '#d8ecff', yield: 'Near-complete after initiation', leftovers: 'None at the balanced ratio', condition: 'Ultraviolet light or a spark' },
  { pair: ['S', 'O'], equation: 'S + O₂ → SO₂(g)', product: 'Sulfur dioxide', formula: 'SO2', ratio: '1 sulfur : 1 oxygen molecule', effect: 'Sulfur burns with a blue flame, releasing colorless, pungent sulfur dioxide.', type: 'Combustion', productState: 'gas', appearance: 'colorless sulfur dioxide gas', energy: 'high', visual: 'flame', flameColor: '#628cff', yield: 'High in sufficient oxygen', leftovers: 'None at the balanced ratio', condition: 'Ignited sulfur in oxygen' },
  { pair: ['Ca', 'O'], equation: '2 Ca + O₂ → 2 CaO(s)', product: 'Calcium oxide', formula: 'CaO', ratio: '2 calcium : 1 oxygen molecule', effect: 'Calcium burns orange-red and leaves a white calcium oxide solid.', type: 'Synthesis', productState: 'solid', appearance: 'white-to-gray calcium oxide powder', energy: 'high', visual: 'flame', flameColor: '#ff7d43', yield: 'High; some nitride can form in air', leftovers: 'None in pure oxygen at the balanced ratio', condition: 'Ignited calcium metal' },
  { pair: ['Li', 'F'], equation: '2 Li + F₂ → 2 LiF(s)', product: 'Lithium fluoride', formula: 'LiF', ratio: '2 lithium : 1 fluorine molecule', effect: 'Electron transfer produces a tightly bound colorless ionic crystal.', type: 'Synthesis', productState: 'crystal', appearance: 'colorless lithium fluoride ionic crystal', energy: 'intense', visual: 'flame', flameColor: '#e04252', yield: 'Complete under controlled conditions', leftovers: 'None at the balanced ratio', condition: 'Specialized sealed apparatus; fluorine is extremely hazardous' },
  { pair: ['P', 'Cl'], equation: 'P₄ + 6 Cl₂ → 4 PCl₃(l)', product: 'Phosphorus trichloride', formula: 'PCl3', ratio: '1 P₄ unit : 6 chlorine molecules', effect: 'Controlled chlorination forms a colorless, fuming liquid.', type: 'Synthesis', productState: 'liquid', appearance: 'colorless fuming phosphorus trichloride liquid', energy: 'high', visual: 'flame', flameColor: '#d8f0a0', yield: 'PCl₃ favored when chlorine is carefully limited', leftovers: 'Excess chlorine can oxidize PCl₃ onward to PCl₅', condition: 'Dry inert equipment with limited chlorine' },
]

const coreReactionSpecies = {
  'H|O': { reactants: [{ formula: 'H2', coefficient: 2, state: 'g' }, { formula: 'O2', coefficient: 1, state: 'g' }], products: [{ formula: 'H2O', coefficient: 2, state: 'g' }] },
  'Cl|Na': { reactants: [{ formula: 'Na', coefficient: 2, state: 's' }, { formula: 'Cl2', coefficient: 1, state: 'g' }], products: [{ formula: 'NaCl', coefficient: 2, state: 's' }] },
  'C|O': { reactants: [{ formula: 'C', coefficient: 1, state: 's' }, { formula: 'O2', coefficient: 1, state: 'g' }], products: [{ formula: 'CO2', coefficient: 1, state: 'g' }] },
  'Mg|O': { reactants: [{ formula: 'Mg', coefficient: 2, state: 's' }, { formula: 'O2', coefficient: 1, state: 'g' }], products: [{ formula: 'MgO', coefficient: 2, state: 's' }] },
  'Fe|O': { reactants: [{ formula: 'Fe', coefficient: 4, state: 's' }, { formula: 'O2', coefficient: 3, state: 'g' }], products: [{ formula: 'Fe2O3', coefficient: 2, state: 's' }] },
  'Cu|O': { reactants: [{ formula: 'Cu', coefficient: 2, state: 's' }, { formula: 'O2', coefficient: 1, state: 'g' }], products: [{ formula: 'CuO', coefficient: 2, state: 's' }] },
  'Al|O': { reactants: [{ formula: 'Al', coefficient: 4, state: 's' }, { formula: 'O2', coefficient: 3, state: 'g' }], products: [{ formula: 'Al2O3', coefficient: 2, state: 's' }] },
  'H|N': { reactants: [{ formula: 'N2', coefficient: 1, state: 'g' }, { formula: 'H2', coefficient: 3, state: 'g' }], products: [{ formula: 'NH3', coefficient: 2, state: 'g' }], arrow: '⇌' },
  'Cl|K': { reactants: [{ formula: 'K', coefficient: 2, state: 's' }, { formula: 'Cl2', coefficient: 1, state: 'g' }], products: [{ formula: 'KCl', coefficient: 2, state: 's' }] },
  'Cl|H': { reactants: [{ formula: 'H2', coefficient: 1, state: 'g' }, { formula: 'Cl2', coefficient: 1, state: 'g' }], products: [{ formula: 'HCl', coefficient: 2, state: 'g' }] },
  'O|S': { reactants: [{ formula: 'S', coefficient: 1, state: 's' }, { formula: 'O2', coefficient: 1, state: 'g' }], products: [{ formula: 'SO2', coefficient: 1, state: 'g' }] },
  'Ca|O': { reactants: [{ formula: 'Ca', coefficient: 2, state: 's' }, { formula: 'O2', coefficient: 1, state: 'g' }], products: [{ formula: 'CaO', coefficient: 2, state: 's' }] },
  'F|Li': { reactants: [{ formula: 'Li', coefficient: 2, state: 's' }, { formula: 'F2', coefficient: 1, state: 'g' }], products: [{ formula: 'LiF', coefficient: 2, state: 's' }] },
  'Cl|P': { reactants: [{ formula: 'P4', coefficient: 1, state: 's' }, { formula: 'Cl2', coefficient: 6, state: 'g' }], products: [{ formula: 'PCl3', coefficient: 4, state: 'l' }] },
}

const coreReactions = coreReactionDetails.map((reaction) => createReaction({
  ...reaction,
  ...coreReactionSpecies[reactionPairKey(reaction.pair)],
}))

const coreReactionKeys = new Set(coreReactions.map((reaction) => reactionPairKey(reaction.pair)))
export const reactions = [
  ...coreReactions,
  ...generatedReactions.filter((reaction) => !coreReactionKeys.has(reactionPairKey(reaction.pair))),
]

export function reactionPartners(symbol) {
  return reactions
    .filter((reaction) => reaction.pair.includes(symbol))
    .map((reaction) => reaction.pair.find((item) => item !== symbol))
}

export function findReaction(a, b) {
  return reactions.find((reaction) => reaction.pair.includes(a) && reaction.pair.includes(b))
}

export const atomColors = {
  H: '#f2f5f3', C: '#38413f', N: '#4d74e6', O: '#f05b5b', F: '#77d06b', Cl: '#64c65d',
  Br: '#9b463e', I: '#7551a7', S: '#f3ce45', P: '#ed984e', Na: '#8c6ade', K: '#9865c7',
  Li: '#b56ce0', Mg: '#70c96a', Ca: '#63b95e', Fe: '#bf7956', Cu: '#d57a43', Zn: '#879cb5',
  Al: '#aeb8bf', Si: '#c19c78', Ag: '#c7d0d3', Au: '#e8be3d', U: '#67b863',
}
