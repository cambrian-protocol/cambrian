import { Box, Stack, Text, TextArea } from 'grommet'
import { SubmissionModel, WriterSolverRole } from './WriterSolverUI'

import { CircleDashed } from 'phosphor-react'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import OutcomeNotification from '@cambrian/app/components/notifications/OutcomeNotification'
import { SetStateAction } from 'react'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface WriterSolverContentUI {
    roles: WriterSolverRole[]
    setWorkInput: React.Dispatch<SetStateAction<SubmissionModel>>
    workInput: SubmissionModel
    currentCondition: SolverContractCondition
    submittedWork: SubmissionModel[]
    proposedOutcome?: OutcomeCollectionModel
    token: TokenModel
}

const WriterSolverContentUI = ({
    token,
    roles,
    setWorkInput,
    workInput,
    currentCondition,
    submittedWork,
    proposedOutcome,
}: WriterSolverContentUI) => {
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
                            title={'TODO Solver title'}
                            subTitle="Most recent state of"
                            paragraph={'TODO Solver description'}
                        />
                        <Stack anchor="center" fill>
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
                        </Stack>
                        {submittedWork !== undefined &&
                            submittedWork.length > 0 && (
                                <Text size="small" color="dark-4">
                                    Last submission:{' '}
                                    {new Date(
                                        submittedWork[
                                            submittedWork.length - 1
                                        ]?.timestamp
                                    ).toLocaleString()}
                                </Text>
                            )}
                    </Box>
                )
            } else {
                return (
                    <WorkContentContainer
                        title={'TODO Solver title'}
                        description={'TODO Solver description'}
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
                                token={token}
                                outcomeCollection={proposedOutcome}
                                status={currentCondition.status}
                                canRequestArbitration={
                                    roles.includes('Buyer') ||
                                    roles.includes('Writer')
                                }
                            />
                            <WorkContentContainer
                                title={'TODO Solver title'}
                                description={'TODO Solver description'}
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
                                token={token}
                                outcomeCollection={proposedOutcome}
                                status={currentCondition.status}
                            />
                            <WorkContentContainer
                                title={'TODO Solver title'}
                                description={'TODO Solver description'}
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
        {submittedWork !== undefined && (
            <Text size="small" color="dark-4">
                {submittedWork &&
                    `Last submission: ${new Date(
                        submittedWork.timestamp
                    ).toLocaleString()}`}
            </Text>
        )}
    </Box>
)
