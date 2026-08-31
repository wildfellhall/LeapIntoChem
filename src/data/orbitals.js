const SUBSHELLS = [
  { key: 's', capacity: 2, orbitals: 1 },
  { key: 'p', capacity: 6, orbitals: 3 },
  { key: 'd', capacity: 10, orbitals: 5 },
  { key: 'f', capacity: 14, orbitals: 7 },
]

/**
 * Convert the verified principal-shell populations in elements.js into occupied
 * subshells. This preserves known cross-shell exceptions already represented by
 * those populations (for example Cr and Cu) while applying s/p/d/f capacities.
 */
export function occupiedSubshells(shells = []) {
  return shells.flatMap((electronCount, shellIndex) => {
    const principal = shellIndex + 1
    let remaining = electronCount
    return SUBSHELLS.slice(0, Math.min(principal, SUBSHELLS.length)).flatMap((subshell, angular) => {
      const electrons = Math.min(subshell.capacity, remaining)
      remaining -= electrons
      if (!electrons) return []
      const paired = Math.max(0, electrons - subshell.orbitals)
      const unpaired = electrons <= subshell.orbitals
        ? electrons
        : Math.max(0, subshell.orbitals - paired)
      return [{
        principal,
        angular,
        type: subshell.key,
        capacity: subshell.capacity,
        orbitalCount: subshell.orbitals,
        electrons,
        paired,
        unpaired,
        radialNodes: Math.max(0, principal - angular - 1),
        label: `${principal}${subshell.key}${electrons}`,
        isValenceShell: shellIndex === shells.length - 1,
      }]
    })
  })
}

export function subshellNotation(shells = []) {
  return occupiedSubshells(shells).map(({ principal, type, electrons }) => `${principal}${type}${superscript(electrons)}`).join(' ')
}

export function orbitalBoxLedger(shells = []) {
  return occupiedSubshells(shells).map((subshell) => {
    const boxes = Array.from({ length: subshell.orbitalCount }, (_, index) => {
      const first = index < Math.min(subshell.electrons, subshell.orbitalCount)
      const second = index < Math.max(0, subshell.electrons - subshell.orbitalCount)
      return `${first ? '↑' : ''}${second ? '↓' : ''}`
    })
    return { ...subshell, boxes }
  })
}

export function valenceSummary(shells = []) {
  const occupied = occupiedSubshells(shells)
  const valence = occupied.filter((item) => item.isValenceShell)
  return valence.map((item) => `${item.principal}${item.type}${superscript(item.electrons)}`).join(' ')
}

function superscript(value) {
  const digits = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
  return String(value).split('').map((digit) => digits[digit]).join('')
}
