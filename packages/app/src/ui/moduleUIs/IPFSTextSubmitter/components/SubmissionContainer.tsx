import { Box, Text } from 'grommet'
import { useEffect, useState } from 'react'

import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
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
    solverAddress: string
    moduleContract: ethers.Contract
    currentCondition: SolverContractCondition
}

export const initialSubmission = {
    conditionId: '',
    sender: { address: '' },
    submission: '',
}

const SubmissionContainer = ({
    solverAddress,
    moduleContract,
    currentCondition,
    currentUser,
}: ContentMarketingSolverContentProps) => {
    const allowedToWrite = usePermission('Submitter')
    const [latestSubmission, setLatestSubmission] =
        useState<SubmissionModel>(initialSubmission)

    const submittedWorkFilter = moduleContract.filters.SubmittedWork(
        solverAddress,
        null,
        null,
        null
    )
    useEffect(() => {
        let isMounted = true
        initSubmission()
        moduleContract.on(submittedWorkFilter, initSubmission)
        return () => {
            isMounted = false
            moduleContract.removeListener(submittedWorkFilter, initSubmission)
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
        const logs = await moduleContract.queryFilter(submittedWorkFilter)
        return await fetchLatestSubmission(logs, currentCondition)
    }
    return (
        <Box gap="small">
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
                    solverAddress={solverAddress}
                    moduleContract={moduleContract}
                    latestSubmission={latestSubmission}
                />
            ) : (
                <SubmissionView latestSubmission={latestSubmission} />
            )}
        </Box>
    )
}

export default SubmissionContainer
