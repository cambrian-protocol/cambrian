import React, { useEffect, useState } from 'react'

import { BASE_SOLVER_IFACE } from 'packages/app/config/ContractInterfaces'
import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import InvalidQueryComponent from '@cambrian/app/components/errors/InvalidQueryComponent'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import Solver from '@cambrian/app/components/solver/Solver'
import { ethers } from 'ethers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/router'

export default function SolverPage() {
    const { currentUser } = useCurrentUser()
    const router = useRouter()
    const { solverAddress } = router.query

    const [solverContract, setSolverContract] = useState<ethers.Contract>()
    const [showInvalidQueryComponent, setShowInvalidQueryComponent] =
        useState(false)

    useEffect(() => {
        if (!router.isReady) return

        initSolverContract()
    }, [currentUser, router])

    const initSolverContract = async () => {
        try {
            if (
                !solverAddress ||
                typeof solverAddress !== 'string' ||
                !currentUser.chainId ||
                !SUPPORTED_CHAINS[currentUser.chainId] ||
                !ethers.utils.isAddress(solverAddress)
            )
                throw new Error()

            const contract = new ethers.Contract(
                solverAddress,
                BASE_SOLVER_IFACE,
                currentUser.signer
            )

            // Check if we actually received a Solver
            await contract.trackingId()
            setSolverContract(contract)
        } catch (e) {
            setShowInvalidQueryComponent(true)
        }
    }

    return (
        <>
            {currentUser.signer ? (
                solverContract ? (
                    <Solver
                        solverContract={solverContract}
                        currentUser={currentUser}
                    />
                ) : showInvalidQueryComponent ? (
                    <PageLayout contextTitle="Solver">
                        <InvalidQueryComponent context="Solver" />
                    </PageLayout>
                ) : (
                    <LoadingScreen context={LOADING_MESSAGE['SOLVER']} />
                )
            ) : (
                <PageLayout contextTitle="Solver">
                    <ConnectWalletSection />
                </PageLayout>
            )}
        </>
    )
}
