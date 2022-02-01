import Solver from '@cambrian/app/components/solver/Solver'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { getBytes32FromMultihash } from '@cambrian/app/utils/helpers/multihash'
import React from 'react'
import { UserContext } from '@cambrian/app/store/UserContext'

const SOLVER_ABI = require('@artifacts/contracts/Solver.sol/Solver.json').abi
const SOLVER_FACTORY_ABI =
    require('@artifacts/contracts/SolverFactory.sol/SolverFactory.json').abi

export default function SolverPage() {
    const user = React.useContext(UserContext)
    const address = '0xTODO'

    // new ethers.providers.JsonRpcProvider(
    //     'http://127.0.0.1:8545/' // local hardhat
    // )

    if (user.currentSigner) {
        return (
            <Solver
                address={address}
                abi={SOLVER_ABI}
                signer={user.currentSigner}
            />
        )
    } else {
        return <>NOPE</>
    }
}
