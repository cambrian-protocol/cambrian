import Solver from '@cambrian/app/components/solver/Solver'

import React from 'react'
import { UserContext } from '@cambrian/app/store/UserContext'

const SOLVER_ABI = require('@artifacts/contracts/Solver.sol/Solver.json').abi

export default function SolverPage() {
    const user = React.useContext(UserContext)
    const address = '0xTODO'

    if (user.currentSigner) {
        return (
            <Solver
                address={address}
                abi={SOLVER_ABI}
                signer={user.currentSigner}
            />
        )
    } else {
        // Metamask prompt?
        return null
    }
}
