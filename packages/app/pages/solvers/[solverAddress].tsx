import {
    BASE_SOLVER_IFACE,
    WRITER_IFACE,
} from 'packages/app/config/ContractInterfaces'
import React, { useEffect, useState } from 'react'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWallet'
import InvalidQueryComponent from '@cambrian/app/components/errors/InvalidQueryComponent'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { SUPPORTED_CHAINS } from 'packages/app/config/SupportedChains'
import Solver from '@cambrian/app/components/solver/Solver'
import { ethers } from 'ethers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/router'

export default function SolverPage() {
    const { currentUser } = useCurrentUser()
    const router = useRouter()
    const { solverAddress } = router.query

    const [solverContractAddress, setSolverContractAddress] = useState<string>()
    const [showInvalidQueryComponent, setShowInvalidQueryComponent] =
        useState(false)

    useEffect(() => {
        if (!router.isReady) return

        if (solverAddress !== undefined && typeof solverAddress === 'string') {
            if (
                currentUser.chainId &&
                SUPPORTED_CHAINS[currentUser.chainId] &&
                ethers.utils.isAddress(solverAddress)
            ) {
                setSolverContractAddress(solverAddress)
            } else {
                setShowInvalidQueryComponent(true)
            }
        }
    }, [currentUser, router])

    const USE_WRITER = true // TODO TEMP
    return (
        <>
            {currentUser.signer ? (
                solverContractAddress ? (
                    <Solver
                        address={solverContractAddress}
                        iface={USE_WRITER ? WRITER_IFACE : BASE_SOLVER_IFACE}
                        currentUser={currentUser}
                    />
                ) : showInvalidQueryComponent ? (
                    <BaseLayout contextTitle="Solver">
                        <InvalidQueryComponent context="Solver" />
                    </BaseLayout>
                ) : (
                    <LoadingScreen context={LOADING_MESSAGE['SOLVER']} />
                )
            ) : (
                <BaseLayout contextTitle="Solver">
                    <ConnectWalletSection />
                </BaseLayout>
            )}
        </>
    )
}
