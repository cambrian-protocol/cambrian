import { Box, Paragraph, Text, TextArea } from 'grommet'
import {
    ConditionStatus,
    SolverComponentOC,
    SolverContractCondition,
    SolverContractData,
} from '@cambrian/app/models/SolverModel'
import { SubmissionModel, WriterSolverRole } from './WriterSolverUI'

import { CircleDashed } from 'phosphor-react'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import OutcomeNotification from '@cambrian/app/components/notifications/OutcomeNotification'
import { SetStateAction } from 'react'

interface WriterSolverContentUI {
    solverData: SolverContractData
    roles: WriterSolverRole[]
    setWorkInput: React.Dispatch<SetStateAction<SubmissionModel>>
    workInput: SubmissionModel
    currentCondition: SolverContractCondition
    submittedWork: SubmissionModel[]
    proposedOutcome?: SolverComponentOC
}

const WriterSolverContentUI = ({
    solverData,
    roles,
    setWorkInput,
    workInput,
    currentCondition,
    submittedWork,
    proposedOutcome,
}: WriterSolverContentUI) => {
    const dummyArticleTitle = 'Uniswap Brand update'
    const dummyArticleDescription = 'TODO Detailed Article description'

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
                    <Box fill>
                        <HeaderTextSection
                            title={dummyArticleTitle}
                            subTitle="Most recent state of"
                            paragraph={dummyArticleDescription}
                        />
                        <TextArea
                            fill
                            size="medium"
                            resize={false}
                            value={workInput.submission}
                            onChange={(event) =>
                                setWorkInput({
                                    ...workInput,
                                    submission: event.target.value,
                                })
                            }
                        />
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
                        <OutcomeNotification
                            status={currentCondition.status}
                            allocations={
                                solverData.allocationsHistory[
                                    currentCondition.conditionId
                                ]
                            }
                            outcomeCollection={proposedOutcome}
                            canRequestArbitration={
                                roles.includes('Buyer') ||
                                roles.includes('Writer')
                            }
                        />
                    )}
                    <WorkContentContainer
                        title={dummyArticleTitle}
                        description={dummyArticleDescription}
                        submittedWork={submittedWork[submittedWork.length - 1]}
                    />
                </>
            )
        case ConditionStatus.OutcomeReported:
            return (
                <>
                    {proposedOutcome && (
                        <OutcomeNotification
                            status={currentCondition.status}
                            allocations={
                                solverData.allocationsHistory[
                                    currentCondition.conditionId
                                ]
                            }
                            outcomeCollection={proposedOutcome}
                        />
                    )}
                    <WorkContentContainer
                        title={dummyArticleTitle}
                        description={dummyArticleDescription}
                        submittedWork={submittedWork[submittedWork.length - 1]}
                    />
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
                <Text wordBreak="break-all">{submittedWork.submission}</Text>
            )}
        </Box>
        <Paragraph fill textAlign="end" color={'dark-6'}>
            {submittedWork &&
                `Last submission: ${new Date(
                    submittedWork.timestamp
                ).toLocaleString()}`}
        </Paragraph>
    </Box>
)
