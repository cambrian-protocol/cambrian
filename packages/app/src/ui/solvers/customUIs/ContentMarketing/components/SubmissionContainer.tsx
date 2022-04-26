import SubmissionForm, { initialSubmission } from './SubmissionForm'
import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import { GenericMethods } from '@cambrian/app/components/solver/Solver'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { SubmissionModel } from '../models/SubmissionModel'
import SubmissionView from './SubmissionView'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { fetchLatestSubmission } from '../helpers/fetchLatestSubmission'
import usePermission from '@cambrian/app/hooks/usePermission'

interface ContentMarketingSolverContentProps {
    currentUser: UserType
    solverContract: ethers.Contract
    solverData: SolverModel
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
    metadata?: MetadataModel
}

const SubmissionContainer = ({
    solverData,
    solverContract,
    currentCondition,
    currentUser,
    metadata,
}: ContentMarketingSolverContentProps) => {
    const allowedToWrite = usePermission('Writer')
    const [latestSubmission, setLatestSubmission] =
        useState<SubmissionModel>(initialSubmission)

    const submittedWorkFilter = solverContract.filters.SubmittedWork()
    const proposal = metadata?.stages?.proposal as ProposalModel

    useEffect(() => {
        let isMounted = true
        initLatestSubmission().then((submission) => {
            if (isMounted && submission !== undefined)
                setLatestSubmission(submission)
        })

        return () => {
            isMounted = false
        }
    }, [currentUser])

    const initLatestSubmission = async () => {
        const logs = await solverContract.queryFilter(submittedWorkFilter)
        return await fetchLatestSubmission(logs, currentCondition)
    }
    return (
        <>
            <Box gap="small" height={{ min: 'auto' }} fill>
                <HeaderTextSection
                    title={
                        proposal
                            ? proposal.title
                            : solverData.solverTag?.title || 'Solver'
                    }
                    subTitle="Most recent state of"
                    paragraph={
                        proposal
                            ? proposal.description
                            : solverData.solverTag?.description
                    }
                />
                {allowedToWrite &&
                currentCondition.status === ConditionStatus.Executed ? (
                    <SubmissionForm
                        currentCondition={currentCondition}
                        currentUser={currentUser}
                        solverContract={solverContract}
                        latestSubmission={latestSubmission}
                    />
                ) : (
                    <SubmissionView latestSubmission={latestSubmission} />
                )}
            </Box>
        </>
    )
}

export default SubmissionContainer
