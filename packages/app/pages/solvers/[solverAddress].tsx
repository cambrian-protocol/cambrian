import Solver from '@cambrian/app/components/solver/Solver'
import React from 'react'
import { useRouter } from 'next/router'
import { UserContext } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'

const SOLVER_ABI = require('@artifacts/contracts/Solver.sol/Solver.json').abi

export default function SolverPage() {
    const user = React.useContext(UserContext)
    const router = useRouter()
    const { solverAddress } = router.query // 0x8aCd85898458400f7Db866d53FCFF6f0D49741FF

    React.useEffect(() => {
        async function getLogin() {
            await user.login()
        }
        if (!user.currentSigner) {
            getLogin()
        } else {
            console.log(user.currentSigner)
        }
    }, [user])

    if (
        typeof solverAddress == 'string' &&
        ethers.utils.isAddress(solverAddress) &&
        user.currentSigner
    ) {
        return (
            <Solver
                address={ethers.utils.getAddress(solverAddress)}
                abi={SOLVER_ABI}
                signer={user.currentSigner}
            />
        )
    } else {
        return <p>Please log in</p>
    }
}
