import { Box, Text } from 'grommet'
import { useEffect, useState } from 'react'

import { CERAMIC_NODE_ENDPOINT } from 'packages/app/config'
import CeramicClient from '@ceramicnetwork/http-client'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import SubmissionForm from './SubmissionForm'
import { SubmissionModel } from '../models/SubmissionModel'
import SubmissionView from './SubmissionView'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import usePermissionContext from '@cambrian/app/hooks/usePermissionContext'

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
    const allowedToWrite = usePermissionContext('Submitter')
    const [latestSubmission, setLatestSubmission] =
        useState<SubmissionModel>(initialSubmission)
    const submittedWorkFilter = moduleContract.filters.SubmittedWork(
        solverAddress,
        null,
        null,
        null
    )

    useEffect(() => {
        initLatestSubmission()
        moduleContract.on(submittedWorkFilter, initLatestSubmission)
        return () => {
            moduleContract.removeListener(
                submittedWorkFilter,
                initLatestSubmission
            )
        }
    }, [])

    const initLatestSubmission = async () => {
        // TODO Filter for Conditions
        const logs = await moduleContract.queryFilter(submittedWorkFilter)
        const commitIDs: any[] = logs.map((l) => l.args?.cid).filter(Boolean)
        if (commitIDs.length > 0) {
            const ceramicClient = new CeramicClient(CERAMIC_NODE_ENDPOINT)
            const latestCommit = await ceramicClient.loadStream(
                commitIDs[commitIDs.length - 1]
            )
            setLatestSubmission(latestCommit.content)
        }
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
            <Box border={{ side: 'top' }} align="end">
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
            </Box>
        </Box>
    )
}

export default SubmissionContainer
