import { Box, Button, Text } from 'grommet'
import {
    CircleDashed,
    Clipboard,
    ClockCounterClockwise,
    RepeatOnce,
} from 'phosphor-react'

import { GenericMethods } from '@cambrian/app/components/solver/Solver'
import { SetStateAction } from 'react'
import SidebarCard from '@cambrian/app/components/cards/SidebarCard'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'
import usePermissionContext from '@cambrian/app/hooks/usePermissionContext'

interface ConditionVersionSidebarProps {
    solverConditions: SolverContractCondition[]
    currentCondition: SolverContractCondition
    setCurrentCondition: React.Dispatch<
        SetStateAction<SolverContractCondition | undefined>
    >
    solverMethods: GenericMethods
    solverTag?: SolverTagModel
}

const ConditionVersionSidebar = ({
    solverConditions,
    currentCondition,
    setCurrentCondition,
    solverMethods,
    solverTag,
}: ConditionVersionSidebarProps) => {
    const allowed = usePermissionContext('Keeper')

    const conditions = [...solverConditions]

    const newestCondition = conditions.pop()
    conditions.reverse()

    // TODO Transaction loader
    const onRetryCondition = async () => {
        solverMethods.prepareSolve(currentCondition.executions)
    }

    return (
        <SidebarCard>
            {/*  <SidebarCardHeader
                title={`Solver ${solverTag?.title}`}
                info={solverTag?.version}
            />
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
                                This is the most recent run of this solver. It's
                                current status is:
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
                                allowed && (
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
            </SidebarCardBody> */}
        </SidebarCard>
    )
}

export default ConditionVersionSidebar
