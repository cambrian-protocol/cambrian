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
import { fetchSubmissions } from '../helpers/fetchLatestSubmission'
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
    const [submissions, setSubmissions] = useState<SubmissionModel[]>([])

    const submittedWorkFilter = moduleContract.filters.SubmittedWork(
        solverAddress,
        null,
        null,
        null
    )
    useEffect(() => {
        initSubmission()
        moduleContract.on(submittedWorkFilter, initSubmission)
        return () => {
            moduleContract.removeListener(submittedWorkFilter, initSubmission)
        }
    }, [currentUser])

    const initSubmission = async () => {
        initLatestSubmission()
            .then((submissions) => {
                if (submissions !== undefined) {
                    setSubmissions(submissions)
                    if (submissions[submissions.length - 1])
                        setLatestSubmission(submissions[submissions.length - 1])
                }
            })
            .catch((e) => cpLogger.push(e))
    }

    const initLatestSubmission = async () => {
        const logs = await moduleContract.queryFilter(submittedWorkFilter)
        return await fetchSubmissions(logs, currentCondition)
    }
    return (
        <Box gap="medium">
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
            <Box direction="row" border={{ side: 'top' }} wrap justify="end">
                <Box pad="small">
                    <Text size="small" color="brand">
                        Latest submission:{' '}
                        {latestSubmission && latestSubmission.timestamp
                            ? `${new Date(
                                  latestSubmission.timestamp
                              ).toLocaleString()}`
                            : 'Nothing submitted yet'}
                    </Text>
                </Box>
                <Box pad="small">
                    <Text size="small" color="brand">
                        Submissions: {submissions.length}
                    </Text>
                </Box>
            </Box>
        </Box>
    )
}

export default SubmissionContainer
