import React, { useEffect, useState } from 'react'
import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'

import InvalidCIDUI from '@cambrian/app/ui/general/InvalidCIDUI'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import Solver from '@cambrian/app/components/solver/Solver'
import { ethers } from 'ethers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/router'

const SOLVER_ABI = require('@artifacts/contracts/Solver.sol/Solver.json').abi
const WRITER_ABI =
    require('@artifacts/contracts/WriterSolverV1.sol/WriterSolverV1.json').abi

export default function SolverPage() {
    const [stagehand] = useState(new Stagehand())
    const { currentUser, login } = useCurrentUser()
    const [currentProposal, setCurrentProposal] = useState<ProposalModel>()
    const [showError, setShowError] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const { proposalCID, solverAddress } = router.query

    useEffect(() => {
        if (!currentUser) {
            getLogin()
        }
    }, [currentUser])

    const getLogin = async () => {
        await login()
    }

    useEffect(() => {
        if (!router.isReady) return
        if (
            typeof solverAddress !== 'string' ||
            !ethers.utils.isAddress(solverAddress)
        ) {
            setShowError(true)
        }

        if (
            proposalCID !== undefined &&
            typeof proposalCID === 'string' &&
            currentUser
        ) {
            init(proposalCID)
        }
    }, [router, currentUser])

    const init = async (proposalCID: string) => {
        // Fetch IPFS Stage
        const proposal = (await stagehand.loadStage(
            proposalCID,
            StageNames.proposal
        )) as ProposalModel

        if (proposal) {
            setCurrentProposal(proposal)
        } else {
            setShowError(true)
        }
        setIsLoading(false)
    }

    const USE_WRITER = true // TODO TEMP
    return (
        <>
            {typeof solverAddress == 'string' &&
                ethers.utils.isAddress(solverAddress) &&
                currentUser &&
                currentProposal && (
                    <Solver
                        proposal={currentProposal}
                        address={solverAddress}
                        abi={USE_WRITER ? WRITER_ABI : SOLVER_ABI}
                        currentUser={currentUser}
                    />
                )}
            {showError && (
                <InvalidCIDUI
                    contextTitle={'Loading proposal'}
                    stageName={StageNames.proposal}
                />
            )}
            {isLoading && <LoadingScreen context="Loading Solver" />}
        </>
    )
}
