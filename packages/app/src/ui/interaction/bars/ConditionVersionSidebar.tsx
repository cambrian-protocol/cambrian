import { Box, Card, CardBody, CardHeader, Text } from 'grommet'
import { CircleDashed, ClockCounterClockwise, SpinnerGap } from 'phosphor-react'

import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import { CONDITION_STATUS_DETAILS } from '@cambrian/app/constants/ConditionStatus'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { SolverContractCondition } from '@cambrian/app/models/SolverModel'

interface ConditionVersionSidebarProps {
    solverTitle: string
    solverMetaVersion?: string
    solverConditions: SolverContractCondition[]
    updateCondition: (updatedCondition: SolverContractCondition) => void
    currentCondition?: SolverContractCondition
}

const ConditionVersionSidebar = ({
    solverTitle,
    solverMetaVersion,
    solverConditions,
    currentCondition,
    updateCondition,
}: ConditionVersionSidebarProps) => {
    const conditions = [...solverConditions]

    const newestCondition = conditions.pop()
    conditions.reverse()
    return (
        <Card fill margin={{ right: 'small' }} background="background-front">
            <CardHeader pad="medium" elevation="small">
                <Text>{solverTitle}</Text>
                <Text size="small" color="dark-3">
                    {solverMetaVersion}
                </Text>
            </CardHeader>
            <CardBody pad="medium" gap="small" overflow={{ vertical: 'auto' }}>
                <Box height={{ min: 'auto' }} fill>
                    {newestCondition !== undefined ? (
                        <Box gap="medium">
                            <Box direction="row" gap="small">
                                <Box>
                                    <SpinnerGap size="24" />
                                </Box>
                                <Text>Current</Text>
                            </Box>
                            <Text size="small" color="dark-6">
                                Current solver version description text, Lorem
                                ipsum dolor sit amet, consectetur adipiscing
                                elit. Suspendisse vel erat et enim blandit
                                pharetra. Nam nec justo ultricies, tristique
                                justo ege.
                            </Text>
                            <BaseMenuListItem
                                title={
                                    CONDITION_STATUS_DETAILS[
                                        newestCondition.status
                                    ].label
                                }
                                icon={
                                    CONDITION_STATUS_DETAILS[
                                        newestCondition.status
                                    ].icon
                                }
                                onClick={() => updateCondition(newestCondition)}
                                isActive={currentCondition === newestCondition}
                            />
                            {conditions.length > 0 && (
                                <Box gap="medium" height={{ min: 'auto' }}>
                                    <PlainSectionDivider />
                                    <Box direction="row" gap="small">
                                        <Box>
                                            <ClockCounterClockwise size="24" />
                                        </Box>
                                        <Text>History</Text>
                                    </Box>
                                    <Text size="small" color="dark-6">
                                        History solver version description text,
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit. Suspendisse vel erat et
                                        enim blandit pharetra.
                                    </Text>
                                    {conditions.map((condition, idx) => (
                                        <BaseMenuListItem
                                            key={idx}
                                            title={
                                                CONDITION_STATUS_DETAILS[
                                                    condition.status
                                                ].label
                                            }
                                            icon={
                                                CONDITION_STATUS_DETAILS[
                                                    condition.status
                                                ].icon
                                            }
                                            onClick={() =>
                                                updateCondition(condition)
                                            }
                                            isActive={
                                                currentCondition?.conditionId ===
                                                condition.conditionId
                                            }
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Box fill justify="center" align="center" gap="medium">
                            <CircleDashed size="32" />
                            <Text>No condition history found</Text>
                        </Box>
                    )}
                </Box>
            </CardBody>
        </Card>
    )
}

export default ConditionVersionSidebar
