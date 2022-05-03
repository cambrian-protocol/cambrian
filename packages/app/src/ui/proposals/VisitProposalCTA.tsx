import { Box, Button } from 'grommet'
import { useEffect, useState } from 'react'

import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import IPFSSolutionsHub from '@cambrian/app/hubs/IPFSSolutionsHub'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface VisitProposalCTAProps {
    solutionId: string
    currentUser: UserType
}

const VisitProposalCTA = ({
    solutionId,
    currentUser,
}: VisitProposalCTAProps) => {
    const [solverAddress, setSolverAddress] = useState<string>()

    useEffect(() => {
        initSolverAddress()
    }, [currentUser])

    const initSolverAddress = async () => {
        if (currentUser.chainId && currentUser.signer) {
            try {
                const ipfsSolutionsHub = new IPFSSolutionsHub(
                    currentUser.signer,
                    currentUser.chainId
                )
                const solvers = await ipfsSolutionsHub.getSolvers(solutionId)
                if (!solvers) throw GENERAL_ERROR['NO_SOLVERS_FOUND']

                setSolverAddress(solvers[0])
            } catch (e) {
                cpLogger.push(e)
            }
        }
    }

    return (
        <>
            {solverAddress ? (
                <Box height={{ min: 'auto' }}>
                    <HeaderTextSection
                        title="Solver in Progress"
                        paragraph="This Proposal has been successfully funded and is currently running"
                    />
                    <Button
                        primary
                        label="Visit Solver"
                        href={`/solvers/${solverAddress}`}
                    />
                </Box>
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['SOLUTION']} />
            )}
        </>
    )
}

export default VisitProposalCTA
