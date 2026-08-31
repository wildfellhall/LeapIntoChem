import { elementBySymbol } from './elements.js'

function covalentProfile({ id, title, formula, left, right, bondOrder, polarity, summary, caveat }) {
  const leftElement = elementBySymbol[left]
  const rightElement = elementBySymbol[right]
  const delta = Math.abs(leftElement.electronegativity - rightElement.electronegativity)
  return {
    id,
    title,
    formula,
    kind: polarity === 'nonpolar' ? 'nonpolar-covalent' : 'polar-covalent',
    kindLabel: polarity === 'nonpolar' ? 'Nonpolar covalent' : 'Polar covalent',
    left: { symbol: left, initialShells: leftElement.shells, targetOuter: left === 'H' ? 2 : 8, charge: polarity === 'polar' ? 'δ+' : null },
    right: { symbol: right, initialShells: rightElement.shells, targetOuter: right === 'H' ? 2 : 8, charge: polarity === 'polar' ? 'δ−' : null },
    bondOrder,
    sharedElectrons: bondOrder * 2,
    transferElectrons: 0,
    electronegativityDelta: Number(delta.toFixed(2)),
    pull: polarity === 'nonpolar' ? 'equal' : 'right',
    summary,
    caveat,
    phases: [
      `Separate neutral atoms show their starting valence electrons: ${leftElement.shells.at(-1)} on ${left} and ${rightElement.shells.at(-1)} on ${right}.`,
      polarity === 'nonpolar'
        ? 'Both positive nuclei attract the negative valence electrons equally as the atomic orbitals overlap.'
        : `${right} is more electronegative, so both nuclei attract the shared electrons but the electron density shifts toward ${right}.`,
      `${bondOrder === 1 ? 'One shared pair forms a single bond' : bondOrder === 2 ? 'Two shared pairs form a double bond' : 'Three shared pairs form a triple bond'}. Each atom counts the shared electrons in its outer-shell bookkeeping.`,
    ],
  }
}

function ionicProfile({ id, title, formula, left, right, transferElectrons, summary }) {
  const leftElement = elementBySymbol[left]
  const rightElement = elementBySymbol[right]
  const leftFinal = leftElement.shells.slice(0, -1)
  const rightFinal = [...rightElement.shells]
  rightFinal[rightFinal.length - 1] += transferElectrons
  return {
    id,
    title,
    formula,
    kind: 'ionic',
    kindLabel: 'Ionic attraction',
    left: { symbol: left, initialShells: leftElement.shells, finalShells: leftFinal, targetOuter: leftFinal.at(-1), charge: transferElectrons === 1 ? '+' : `${transferElectrons}+`, chargeNumber: transferElectrons },
    right: { symbol: right, initialShells: rightElement.shells, finalShells: rightFinal, targetOuter: 8, charge: transferElectrons === 1 ? '−' : `${transferElectrons}−`, chargeNumber: -transferElectrons },
    bondOrder: 0,
    sharedElectrons: 0,
    transferElectrons,
    electronegativityDelta: Number(Math.abs(leftElement.electronegativity - rightElement.electronegativity).toFixed(2)),
    pull: 'right',
    summary,
    caveat: `${formula} is represented as one electron-transfer event. In a bulk solid, many oppositely charged ions assemble into a three-dimensional lattice rather than isolated ${formula} molecules.`,
    phases: [
      `Separate neutral atoms show ${leftElement.shells.at(-1)} outer electron${leftElement.shells.at(-1) === 1 ? '' : 's'} on ${left} and ${rightElement.shells.at(-1)} on ${right}.`,
      `${right} attracts valence electrons much more strongly. ${left} transfers ${transferElectrons} electron${transferElectrons === 1 ? '' : 's'} to a lower-energy ionic arrangement.`,
      `${left}${transferElectrons === 1 ? '⁺' : '²⁺'} and ${right}${transferElectrons === 1 ? '⁻' : '²⁻'} have opposite net charges, so electrostatic attraction holds the ionic lattice together.`,
    ],
  }
}

export const bondingProfiles = [
  covalentProfile({ id: 'h2', title: 'Hydrogen molecule', formula: 'H2', left: 'H', right: 'H', bondOrder: 1, polarity: 'nonpolar', summary: 'One equally shared electron pair gives both hydrogen atoms access to a filled 1s shell.', caveat: 'This shell view is Lewis-style electron bookkeeping. The real bond is a shared quantum-mechanical molecular orbital with electron density between both nuclei.' }),
  covalentProfile({ id: 'hcl', title: 'Hydrogen chloride', formula: 'HCl', left: 'H', right: 'Cl', bondOrder: 1, polarity: 'polar', summary: 'The bonding pair is shared, but chlorine’s stronger pull creates a partial-negative end and a partial-positive hydrogen end.', caveat: 'Partial charges are not whole ions. HCl remains a covalent molecule in the gas phase; it ionizes extensively only when dissolved in water.' }),
  covalentProfile({ id: 'o2', title: 'Oxygen molecule', formula: 'O2', left: 'O', right: 'O', bondOrder: 2, polarity: 'nonpolar', summary: 'Two shared pairs complete the Lewis octet count around each oxygen atom.', caveat: 'The double-line Lewis model tracks shell occupancy and bond order. Real O₂ molecular orbitals also contain two unpaired electrons, which explains oxygen’s paramagnetism.' }),
  covalentProfile({ id: 'n2', title: 'Nitrogen molecule', formula: 'N2', left: 'N', right: 'N', bondOrder: 3, polarity: 'nonpolar', summary: 'Three shared pairs create a short, strong triple bond while each nitrogen retains one lone pair.', caveat: 'The animation shows valence-shell bookkeeping; real bonding electrons occupy delocalized molecular orbitals across both nitrogen nuclei.' }),
  covalentProfile({ id: 'f2', title: 'Fluorine molecule', formula: 'F2', left: 'F', right: 'F', bondOrder: 1, polarity: 'nonpolar', summary: 'Each fluorine contributes one electron to a shared pair, completing both octet counts.', caveat: 'The compact cloud reflects strongly contracted fluorine valence orbitals. Individual electrons still occupy molecular orbitals rather than fixed paths.' }),
  covalentProfile({ id: 'cl2', title: 'Chlorine molecule', formula: 'Cl2', left: 'Cl', right: 'Cl', bondOrder: 1, polarity: 'nonpolar', summary: 'Equal chlorine atoms share one pair evenly, leaving three lone pairs on each atom.', caveat: 'The display combines occupied orbitals into one probability cloud; it does not assign a circular route to any electron.' }),
  covalentProfile({ id: 'hf', title: 'Hydrogen fluoride', formula: 'HF', left: 'H', right: 'F', bondOrder: 1, polarity: 'polar', summary: 'Fluorine pulls the shared density strongly toward itself, creating a highly polar covalent bond.', caveat: 'The δ symbols describe unequal probability density, not full ions in an isolated HF molecule.' }),
  covalentProfile({ id: 'hbr', title: 'Hydrogen bromide', formula: 'HBr', left: 'H', right: 'Br', bondOrder: 1, polarity: 'polar', summary: 'Bromine attracts the shared pair more strongly than hydrogen, producing partial-charge ends.', caveat: 'HBr is molecular as a pure gas. In water it transfers a proton to water and behaves as a strong acid.' }),
  covalentProfile({ id: 'br2', title: 'Bromine molecule', formula: 'Br2', left: 'Br', right: 'Br', bondOrder: 1, polarity: 'nonpolar', summary: 'Two identical bromine atoms share a bonding pair equally while retaining filled inner shells.', caveat: 'The large bromine clouds show combined shell probability density; their size is compressed relative to the nuclei for classroom visibility.' }),
  ionicProfile({ id: 'nacl', title: 'Sodium chloride', formula: 'NaCl', left: 'Na', right: 'Cl', transferElectrons: 1, summary: 'Sodium loses its 3s valence electron, chlorine gains it, and the resulting Na⁺ and Cl⁻ ions attract.' }),
  ionicProfile({ id: 'lif', title: 'Lithium fluoride', formula: 'LiF', left: 'Li', right: 'F', transferElectrons: 1, summary: 'Lithium exposes a filled first shell after losing one electron; fluorine reaches an eight-electron outer shell.' }),
  ionicProfile({ id: 'mgo', title: 'Magnesium oxide', formula: 'MgO', left: 'Mg', right: 'O', transferElectrons: 2, summary: 'Two electrons transfer from magnesium to oxygen, forming Mg²⁺ and O²⁻ ions that attract throughout the solid lattice.' }),
  ionicProfile({ id: 'kcl', title: 'Potassium chloride', formula: 'KCl', left: 'K', right: 'Cl', transferElectrons: 1, summary: 'Potassium loses its fourth-shell valence electron while chlorine gains one, producing K⁺ and Cl⁻.' }),
  ionicProfile({ id: 'cao', title: 'Calcium oxide', formula: 'CaO', left: 'Ca', right: 'O', transferElectrons: 2, summary: 'Calcium transfers two valence electrons to oxygen; the resulting 2+ and 2− ions assemble into a repeating lattice.' }),
]

export const bondingProfileById = Object.fromEntries(bondingProfiles.map((profile) => [profile.id, profile]))
