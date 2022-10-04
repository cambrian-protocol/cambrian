import { useEffect, useState } from 'react'

import { BASE_SOLVER_IFACE } from 'packages/app/config/ContractInterfaces'
import Custom404Page from 'packages/app/pages/404'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import Solver from '@cambrian/app/components/solver/Solver'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'

interface SolverUIProps {
    currentUser: UserType
    address: string
}

const SolverUI = ({ currentUser, address }: SolverUIProps) => {
    const [solverContract, setSolverContract] = useState<ethers.Contract>()
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        initSolverContract()
    }, [])

    const initSolverContract = async () => {
        try {
            if (
                !ethers.utils.isAddress(address) ||
                !SUPPORTED_CHAINS[currentUser.chainId]
            )
                throw new Error()

            const contract = new ethers.Contract(
                address,
                BASE_SOLVER_IFACE,
                currentUser.signer
            )

            // Check if we actually received a Solver
            await contract.trackingId()
            setSolverContract(contract)
        } catch (e) {
            console.warn(e)
        }
        setIsInitialized(true)
    }

    return (
        <>
            {isInitialized ? (
                solverContract ? (
                    <Solver
                        currentUser={currentUser}
                        solverContract={solverContract}
                    />
                ) : (
                    <Custom404Page />
                )
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['SOLVER']} />
            )}
        </>
    )
}

export default SolverUI
