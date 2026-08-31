import { compounds, parseFormula } from './chemistry.js'

// A deliberate learning progression: familiar small particles first, then common
// household/earth materials, followed by polyatomic ions and advanced molecular formulas.
export const questFormulaOrder = [
  'H2O', 'O2', 'N2', 'H2', 'CO2', 'CH4', 'NH3', 'NaCl', 'HCl', 'O3', 'CO', 'NO',
  'SO2', 'H2O2', 'MgO', 'CaO', 'KCl', 'LiF', 'Br2', 'I2',
  'C2H4', 'C2H2', 'C2H6O', 'C2H4O2', 'C3H8', 'C4H10', 'H2S', 'CS2', 'NO2', 'N2O',
  'SO3', 'SiO2', 'Fe2O3', 'Fe3O4', 'CuO', 'Cu2O', 'Al2O3', 'ZnO', 'CaCO3', 'NaHCO3',
  'NaOH', 'KOH', 'CaCl2', 'MgCl2', 'NH4Cl', 'Na2CO3', 'KNO3', 'CaSO4', 'CuSO4', 'AgNO3',
  'ZnCl2', 'FeCl3', 'Na2SO4', 'MgSO4', 'KI', 'HNO3', 'H2SO4', 'KMnO4', 'P4', 'PCl3',
  'PCl5', 'SF6', 'CF4', 'CCl4', 'CHCl3', 'C6H12O6',
  'HF', 'HBr', 'HI', 'BF3', 'BCl3', 'BBr3', 'BI3', 'SiF4', 'SiCl4', 'SiBr4', 'SiI4',
  'B2O3', 'P4O10', 'PF3', 'PBr3', 'PI3', 'NaF', 'NaBr', 'NaI',
]

const metalSymbols = new Set(['Li', 'Na', 'K', 'Mg', 'Ca', 'Fe', 'Cu', 'Al', 'Zn', 'Ag'])

function strandFor(compound, composition) {
  const symbols = Object.keys(composition)
  if (symbols.length === 1) return 'Elemental particles'
  if (compound.formula === 'H2O' || compound.formula === 'H2O2') return 'Water and peroxides'
  if (compound.name.includes('acid') || compound.name === 'Hydrogen chloride') return 'Acids and molecular compounds'
  if (symbols.every((symbol) => ['C', 'H'].includes(symbol))) return 'Hydrocarbons'
  if (symbols.includes('C') && symbols.includes('H') && symbols.includes('O')) return 'Carbon compounds'
  if (symbols.includes('O') && symbols.length === 2) return 'Oxides'
  if (symbols.some((symbol) => metalSymbols.has(symbol)) || compound.formula.startsWith('NH4')) return 'Ionic compounds'
  return 'Molecular compounds'
}

function objectiveFor(strand) {
  if (strand === 'Elemental particles') return 'Recall how this element occurs as a particle, then assemble one correct representative unit.'
  if (strand === 'Ionic compounds') return 'Recall the simplest whole-number ion ratio for this compound, then build one correct formula unit.'
  return 'Recall the elements and atom ratio in this compound, then build one conserved representative particle.'
}

export const questCurriculum = questFormulaOrder.map((formula, index) => {
  const compound = compounds.find((item) => item.formula === formula)
  if (!compound) throw new Error(`Quest formula ${formula} is missing from the substance library.`)
  const composition = parseFormula(formula)
  const atomCount = Object.values(composition).reduce((sum, count) => sum + count, 0)
  const difficulty = index < 20 ? 'Foundation' : index < 50 ? 'Developing' : 'Advanced'
  const gradeBand = difficulty === 'Foundation' ? 'Grades 5–6' : difficulty === 'Developing' ? 'Grades 6–8' : 'Grades 8–9'
  const strand = strandFor(compound, composition)
  return {
    ...compound,
    questNumber: index + 1,
    difficulty,
    gradeBand,
    strand,
    atomCount,
    elementCount: Object.keys(composition).length,
    learningObjective: objectiveFor(strand),
    successCriteria: 'Build one correct representative particle or formula unit with no missing or extra atoms.',
  }
})
