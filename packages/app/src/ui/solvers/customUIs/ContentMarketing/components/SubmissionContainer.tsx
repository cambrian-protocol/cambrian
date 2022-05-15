import { Box, Text } from 'grommet'
import { useEffect, useState } from 'react'

import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import { GenericMethods } from '@cambrian/app/components/solver/Solver'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import SubmissionForm from './SubmissionForm'
import { SubmissionModel } from '../models/SubmissionModel'
import SubmissionView from './SubmissionView'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
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

export const initialSubmission = {
    conditionId: '',
    sender: { address: '' },
    submission: '',
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
        initSubmission()
        solverContract.on(submittedWorkFilter, initSubmission)
        return () => {
            isMounted = false
            solverContract.removeListener(submittedWorkFilter, initSubmission)
        }
    }, [currentUser])

    const initSubmission = async () => {
        initLatestSubmission()
            .then((submission) => {
                if (submission !== undefined) setLatestSubmission(submission)
            })
            .catch((e) => cpLogger.push(e))
    }

    const initLatestSubmission = async () => {
        const logs = await solverContract.queryFilter(submittedWorkFilter)
        return await fetchLatestSubmission(logs, currentCondition)
    }
    return (
        <Box gap="small" flex>
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
            {latestSubmission.timestamp !== undefined && (
                <Text size="small" color="brand">
                    Latest submission:{' '}
                    {new Date(latestSubmission.timestamp).toLocaleString()}
                </Text>
            )}
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
    )
}

export default SubmissionContainer
