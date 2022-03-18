import React, { useEffect, useState } from 'react'
import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'

import LoginScreen from '@cambrian/app/ui/auth/LoginScreen'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { SolutionModel } from '@cambrian/app/models/SolutionModel'
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
    const [currentSolution, setCurrentSolution] = useState<SolutionModel>()
    const [showError, setShowError] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const { proposalCID, solverAddress } = router.query

    useEffect(() => {
        setShowError(false)
        if (!router.isReady) return
        if (proposalCID !== undefined && typeof proposalCID === 'string') {
            fetchProposal(proposalCID)
        } else {
            setShowError(true)
        }
    }, [router])

    useEffect(() => {
        if (!currentUser) {
            getLogin()
        }
    }, [currentUser])

    const getLogin = async () => {
        await login()
    }

    const fetchProposal = async (proposalCID: string) => {
        try {
            const proposal = (await stagehand.loadStage(
                proposalCID,
                StageNames.proposal
            )) as ProposalModel

            const solution = stagehand.solution as SolutionModel

            if (proposal && solution) {
                console.log(proposal)
                console.log(solution)
                setCurrentProposal(proposal)
                setCurrentSolution(solution)
            } else {
                setShowError(true)
            }
        } catch {
            setShowError(true)
            console.warn('Cannot fetch proposal')
        }
        setIsLoading(false)
    }

    const USE_WRITER = true // TODO TEMP
    if (
        typeof solverAddress == 'string' &&
        ethers.utils.isAddress(solverAddress) &&
        currentUser &&
        currentSolution
    ) {
        return (
            <Solver
                solverTag={
                    currentSolution.finalComposition.solvers[0].solverTag!!
                }
                slotTags={
                    currentSolution.finalComposition.solvers[0].slotTags!!
                }
                address={solverAddress}
                abi={USE_WRITER ? WRITER_ABI : SOLVER_ABI}
                currentUser={currentUser}
            />
        )
    } else {
        return <LoginScreen onConnectWallet={getLogin} />
    }
}
