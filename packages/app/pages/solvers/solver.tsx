import SolverContract from '@cambrian/app/classes/SolverContract'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { getBytes32FromMultihash } from '@cambrian/app/utils/helpers/multihash'
import React from 'react'
import { ethers } from 'ethers'

const SOLVER_ABI = require('@artifacts/contracts/Solver.sol/Solver.json').abi
const SOLVER_FACTORY_ABI =
    require('@artifacts/contracts/SolverFactory.sol/SolverFactory.json').abi

export default function Solver() {
    const [contractProps, setContractProps] = React.useState({
        address: undefined,
        abi: SOLVER_ABI,
        provider: new ethers.providers.JsonRpcProvider(
            'http://127.0.0.1:8545/'
        ),
    })

    if (contractProps.address) {
        return (
            <>
                <div>HELLO</div>
                <SolverContract {...contractProps} />
            </>
        )
    } else {
        return <>NOPE</>
    }
}
