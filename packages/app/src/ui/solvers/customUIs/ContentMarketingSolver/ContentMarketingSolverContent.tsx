import WriterUI, { initialSubmission } from './WriterUI'
import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import { GenericMethods } from '@cambrian/app/components/solver/Solver'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { ParticipantModel } from '@cambrian/app/models/ParticipantModel'
import PublicUI from './PublicUI'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { fetchLatestSubmission } from './fetchLatestSubmission'
import usePermission from '@cambrian/app/hooks/usePermission'

interface ContentMarketingSolverContentProps {
    currentUser: UserType
    solverContract: ethers.Contract
    solverData: SolverModel
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
}

export type SubmissionModel = {
    submission: string
    sender: ParticipantModel
    conditionId: string
    timestamp?: Date
}

const ContentMarketingSolverContent = ({
    solverData,
    solverContract,
    currentCondition,
    currentUser,
}: ContentMarketingSolverContentProps) => {
    const allowedToWrite = usePermission('Writer')
    const [latestSubmission, setLatestSubmission] =
        useState<SubmissionModel>(initialSubmission)

    const submittedWorkFilter = solverContract.filters.SubmittedWork()

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
                    title={solverData.solverTag?.title || 'Solver'}
                    subTitle="Most recent state of"
                    paragraph={solverData.solverTag?.description}
                />
                {allowedToWrite &&
                currentCondition.status === ConditionStatus.Executed ? (
                    <WriterUI
                        currentCondition={currentCondition}
                        currentUser={currentUser}
                        solverContract={solverContract}
                        latestSubmission={latestSubmission}
                    />
                ) : (
                    <PublicUI latestSubmission={latestSubmission} />
                )}
            </Box>
        </>
    )
}

export default ContentMarketingSolverContent
