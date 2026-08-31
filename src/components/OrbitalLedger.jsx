import { useMemo } from 'react'
import { orbitalBoxLedger, subshellNotation } from '../data/orbitals.js'

export function OrbitalLedger({ shells, compact = false }) {
  const ledger = useMemo(() => orbitalBoxLedger(shells), [shells])
  return (
    <div className={`orbital-ledger ${compact ? 'compact' : ''}`} role="group" aria-label={`Occupied subshells: ${subshellNotation(shells)}`}>
      {ledger.map((subshell) => (
        <div className={`orbital-ledger-row orbital-${subshell.type} ${subshell.isValenceShell ? 'valence' : ''}`} key={`${subshell.principal}${subshell.type}`}>
          <strong>{subshell.principal}{subshell.type}<sup>{subshell.electrons}</sup></strong>
          <span className="orbital-boxes" role="img" aria-label={`${subshell.electrons} electrons in ${subshell.principal}${subshell.type}`}>
            {subshell.boxes.map((box, index) => <i key={index} aria-hidden="true">{box}</i>)}
          </span>
        </div>
      ))}
    </div>
  )
}
