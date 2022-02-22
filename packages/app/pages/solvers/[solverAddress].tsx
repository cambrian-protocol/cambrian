import LoginScreen from '@cambrian/app/ui/auth/LoginScreen'
import React from 'react'
import Solver from '@cambrian/app/components/solver/Solver'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

const SOLVER_ABI = require('@artifacts/contracts/Solver.sol/Solver.json').abi

export default function SolverPage() {
    const { currentUser, login } = useCurrentUser()
    const router = useRouter()
    const { solverAddress } = router.query // 0x8aCd85898458400f7Db866d53FCFF6f0D49741FF

    React.useEffect(() => {
        if (!currentUser) {
            getLogin()
        } else {
            console.log(currentUser)
        }
    }, [currentUser])

    const getLogin = async () => {
        await login()
    }

    if (
        typeof solverAddress == 'string' &&
        ethers.utils.isAddress(solverAddress) &&
        currentUser
    ) {
        return (
            <Solver
                address={solverAddress}
                abi={SOLVER_ABI}
                currentUser={currentUser}
            />
        )
    } else {
        return <LoginScreen onConnectWallet={getLogin} />
    }
}
