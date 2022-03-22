import { Box, Button, Text } from 'grommet'
import {
    CircleDashed,
    Clipboard,
    ClockCounterClockwise,
    RepeatOnce,
} from 'phosphor-react'

import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import { CONDITION_STATUS_DETAILS } from '@cambrian/app/constants/ConditionStatus'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { SetStateAction } from 'react'
import SidebarCard from '@cambrian/app/components/cards/SidebarCard'
import SidebarCardBody from '@cambrian/app/components/cards/SidebarCardBody'
import SidebarCardHeader from '@cambrian/app/components/cards/SidebarCardHeader'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'

interface ConditionVersionSidebarProps {
    solverTitle: string
    solverMetaVersion?: string
    solverConditions: SolverContractCondition[]
    currentCondition: SolverContractCondition
    setCurrentCondition: React.Dispatch<
        SetStateAction<SolverContractCondition | undefined>
    >
    onRetryCondition: () => void
    isKeeper: boolean
}

const ConditionVersionSidebar = ({
    solverTitle,
    solverMetaVersion,
    solverConditions,
    currentCondition,
    setCurrentCondition,
    onRetryCondition,
    isKeeper,
}: ConditionVersionSidebarProps) => {
    const conditions = [...solverConditions]

    const newestCondition = conditions.pop()
    conditions.reverse()
    return (
        <SidebarCard>
            <SidebarCardHeader title={solverTitle} info={solverMetaVersion} />
            <SidebarCardBody>
                <Box height={{ min: 'auto' }} fill>
                    {newestCondition !== undefined ? (
                        <Box gap="medium">
                            <Box direction="row" gap="small">
                                <Box>
                                    <Clipboard size="24" />
                                </Box>
                                <Text>Current Solve</Text>
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
                                onClick={() =>
                                    setCurrentCondition(newestCondition)
                                }
                                isActive={
                                    currentCondition.conditionId ===
                                    newestCondition.conditionId
                                }
                            />
                            {newestCondition.status ===
                                ConditionStatus.OutcomeReported &&
                                isKeeper && (
                                    <Box gap="medium" height={{ min: 'auto' }}>
                                        <Text size="small" color="dark-6">
                                            You can start a retry of this solver
                                            with new settings
                                        </Text>
                                        <Button
                                            icon={<RepeatOnce size="24" />}
                                            secondary
                                            label="Retry"
                                            onClick={onRetryCondition}
                                        />
                                    </Box>
                                )}
                            {conditions.length > 0 && (
                                <Box gap="medium" height={{ min: 'auto' }}>
                                    <PlainSectionDivider />
                                    <Box direction="row" gap="small">
                                        <Box>
                                            <ClockCounterClockwise size="24" />
                                        </Box>
                                        <Text>Last Solves</Text>
                                    </Box>
                                    <Text size="small" color="dark-6">
                                        History of solves attempted on this
                                        Solver.
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
                                                setCurrentCondition(condition)
                                            }
                                            isActive={
                                                currentCondition.conditionId ===
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
                            <Text>No conditions found</Text>
                        </Box>
                    )}
                </Box>
            </SidebarCardBody>
        </SidebarCard>
    )
}

export default ConditionVersionSidebar
