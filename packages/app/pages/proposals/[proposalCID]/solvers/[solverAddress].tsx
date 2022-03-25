import React, { useContext, useEffect, useState } from 'react'
import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'

import InvalidCIDUI from '@cambrian/app/ui/general/InvalidCIDUI'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import Solver from '@cambrian/app/components/solver/Solver'
import { ethers } from 'ethers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/router'
import { IPFSSolutionsHubContext } from '@cambrian/app/store/IPFSSolutionsHubContext'
import { ProposalsHubContext } from '@cambrian/app/store/ProposalsHubContext'

const SOLVER_ABI = require('@artifacts/contracts/Solver.sol/Solver.json').abi
const WRITER_ABI =
    require('@artifacts/contracts/WriterSolverV1.sol/WriterSolverV1.json').abi

export default function SolverPage() {
    const [stagehand] = useState(new Stagehand())
    const { currentUser, login } = useCurrentUser()
    const [currentProposal, setCurrentProposal] = useState<ProposalModel>()
    const [showError, setShowError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const solutionsHub = useContext(IPFSSolutionsHubContext)
    const proposalsHub = useContext(ProposalsHubContext)
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
        if (!router.isReady || !proposalsHub || !solutionsHub) return

        if (
            typeof solverAddress !== 'string' ||
            !ethers.utils.isAddress(solverAddress)
        ) {
            setShowError(true)
        }

        if (
            solverAddress !== undefined &&
            proposalCID !== undefined &&
            typeof proposalCID === 'string' &&
            currentUser
        ) {
            init(proposalCID)
        }
    }, [router, currentUser, solutionsHub, proposalsHub])

    const init = async (proposalCID: string) => {
        // Fetch IPFS Stage
        const proposal = (await stagehand.loadStage(
            proposalCID,
            StageNames.proposal
        )) as ProposalModel

        if (solverAddress) {
            if (proposal) {
                setCurrentProposal(proposal)
            } else {
                setErrorMessage('Proposal not found.')
                setShowError(true)
            }
        } else {
            setErrorMessage('Solver not found.')
            setShowError(true)
        }

        setIsLoading(false)
    }

    const USE_WRITER = true // TODO TEMP
    return (
        <>
            {typeof solverAddress == 'string' &&
                ethers.utils.isAddress(solverAddress) &&
                currentUser && (
                    <Solver
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
