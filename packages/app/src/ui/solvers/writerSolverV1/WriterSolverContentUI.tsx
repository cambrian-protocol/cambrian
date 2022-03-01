import { Box, Stack, Text, TextArea } from 'grommet'
import { CircleDashed, Lock } from 'phosphor-react'
import {
    ConditionStatus,
    SolverComponentOC,
    SolverContractCondition,
    SolverContractData,
} from '@cambrian/app/models/SolverModel'
import { SubmissionModel, WriterSolverRole } from './WriterSolverUI'

import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import OutcomeNotification from '@cambrian/app/components/notifications/OutcomeNotification'
import { SetStateAction } from 'react'

interface WriterSolverContentUI {
    isLoading: boolean
    solverData: SolverContractData
    roles: WriterSolverRole[]
    setWorkInput: React.Dispatch<SetStateAction<SubmissionModel>>
    workInput: SubmissionModel
    currentCondition: SolverContractCondition
    submittedWork: SubmissionModel[]
    proposedOutcome?: SolverComponentOC
}

const WriterSolverContentUI = ({
    isLoading,
    solverData,
    roles,
    setWorkInput,
    workInput,
    currentCondition,
    submittedWork,
    proposedOutcome,
}: WriterSolverContentUI) => {
    const dummyArticleTitle = 'Uniswap Brand update'
    const dummyArticleDescription =
        'Write a detailed artcile about the Uniswap brand update, including graphics, current state analysis and vision statement.'

    switch (currentCondition.status) {
        case ConditionStatus.Initiated:
            if (roles.includes('Keeper')) {
                return (
                    <Box fill justify="center">
                        <HeaderTextSection
                            title="Please follow the instructions"
                            subTitle="This solver is initiated"
                            paragraph="Add required data and execute this Solver in order to use and interact with it."
                        />
                    </Box>
                )
            } else {
                return (
                    <Box fill justify="center">
                        <HeaderTextSection
                            title="Please wait until this solver has been executed"
                            subTitle="This solver is initiated"
                        />
                    </Box>
                )
            }
        case ConditionStatus.Executed:
            if (roles.includes('Writer')) {
                return (
                    <Box fill gap="small">
                        <HeaderTextSection
                            title={dummyArticleTitle}
                            subTitle="Most recent state of"
                            paragraph={dummyArticleDescription}
                        />
                        <Stack anchor="center" fill>
                            <TextArea
                                fill
                                size="medium"
                                resize={false}
                                value={workInput.submission}
                                disabled={isLoading}
                                onChange={(event) =>
                                    setWorkInput({
                                        ...workInput,
                                        submission: event.target.value,
                                    })
                                }
                            />
                            {isLoading && (
                                <Box gap="small" align="center">
                                    <Lock size="32" />
                                    <Text size="small" textAlign="center">
                                        Input is locked until work has been
                                        submitted
                                    </Text>
                                </Box>
                            )}
                        </Stack>
                        <Text size="small" color="dark-4">
                            Last submission:{' '}
                            {new Date(
                                submittedWork[
                                    submittedWork.length - 1
                                ]?.timestamp
                            ).toLocaleString()}
                        </Text>
                    </Box>
                )
            } else {
                return (
                    <WorkContentContainer
                        title={dummyArticleTitle}
                        description={dummyArticleDescription}
                        submittedWork={submittedWork[submittedWork.length - 1]}
                    />
                )
            }
        case ConditionStatus.OutcomeProposed:
            return (
                <>
                    {proposedOutcome && (
                        <>
                            <OutcomeNotification
                                status={currentCondition.status}
                                allocations={
                                    solverData.allocationsHistory[
                                        currentCondition.conditionId
                                    ]
                                }
                                outcomeCollection={proposedOutcome!!}
                                canRequestArbitration={
                                    roles.includes('Buyer') ||
                                    roles.includes('Writer')
                                }
                            />
                            <WorkContentContainer
                                title={dummyArticleTitle}
                                description={dummyArticleDescription}
                                submittedWork={
                                    submittedWork[submittedWork.length - 1]
                                }
                            />
                        </>
                    )}
                </>
            )
        case ConditionStatus.OutcomeReported:
            return (
                <>
                    {proposedOutcome && (
                        <>
                            <OutcomeNotification
                                status={currentCondition.status}
                                allocations={
                                    solverData.allocationsHistory[
                                        currentCondition.conditionId
                                    ]
                                }
                                outcomeCollection={proposedOutcome}
                            />
                            <WorkContentContainer
                                title={dummyArticleTitle}
                                description={dummyArticleDescription}
                                submittedWork={
                                    submittedWork[submittedWork.length - 1]
                                }
                            />
                        </>
                    )}
                </>
            )
    }
    return <></>
}

export default WriterSolverContentUI

interface WorkContentContainerProps {
    submittedWork?: SubmissionModel
    title: string
    description: string
}

const WorkContentContainer = ({
    submittedWork,
    title,
    description,
}: WorkContentContainerProps) => (
    <Box gap="small" height={{ min: 'auto' }}>
        <HeaderTextSection
            title={title}
            subTitle="Most recent state of"
            paragraph={description}
        />
        <Box
            fill
            background={'background-front'}
            height={{ min: 'auto' }}
            pad="medium"
            round="small"
            elevation="small"
        >
            {submittedWork === undefined || submittedWork.submission === '' ? (
                <Box fill justify="center" align="center" gap="small">
                    <CircleDashed size="36" />
                    <Text textAlign="center">
                        Nothing has been submitted yet
                    </Text>
                </Box>
            ) : (
                <Text style={{ whiteSpace: 'pre-line' }}>
                    {submittedWork.submission}
                </Text>
            )}
        </Box>
        <Text size="small" color="dark-4">
            {submittedWork &&
                `Last submission: ${new Date(
                    submittedWork.timestamp
                ).toLocaleString()}`}
        </Text>
    </Box>
)
