import { ArrowsClockwise, Faders, IconContext } from 'phosphor-react'
import { Box, Button, Heading, ResponsiveContext, Stack, Text } from 'grommet'

import BaseLayerModal from '../../modals/BaseLayerModal'
import { CONDITION_STATUS_INFO } from '@cambrian/app/models/ConditionStatus'
import SolverConfigInfo from '../../info/SolverConfigInfo'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverMetadataModel } from '@cambrian/app/models/SolverMetadataModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import SolverStatusBadge from '../../badges/SolverStatusBadge'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useState } from 'react'

interface SolverHeaderProps {
    metadata?: SolverMetadataModel
    solverData: SolverModel
    currentCondition: SolverContractCondition
}

const SolverHeader = ({
    metadata,
    solverData,
    currentCondition,
}: SolverHeaderProps) => {
    const [showSolverConfigModal, setShowSolverConfigModal] = useState(false)

    const toggleShowSolverConfigModal = () =>
        setShowSolverConfigModal(!showSolverConfigModal)

    return (
        <>
            <IconContext.Provider value={{ size: '24' }}>
                <ResponsiveContext.Consumer>
                    {(screenSize) => {
                        return (
                            <Box height={{ min: 'auto' }}>
                                <Stack anchor="top-right">
                                    <Box pad={{ top: 'medium' }}>
                                        <Box
                                            direction="row"
                                            justify="between"
                                            align="center"
                                            pad={{
                                                vertical: 'small',
                                                horizontal: 'medium',
                                            }}
                                            border
                                            round="xsmall"
                                        >
                                            <Box>
                                                <Text
                                                    size="small"
                                                    color="dark-4"
                                                >
                                                    Solver
                                                </Text>
                                                <Heading level="3">
                                                    {metadata?.solverTag.title}
                                                </Heading>
                                            </Box>
                                            <Box
                                                direction="row"
                                                gap="small"
                                                alignSelf="end"
                                                pad={{ top: 'large' }}
                                            >
                                                <Button
                                                    color="dark-4"
                                                    size="small"
                                                    label={
                                                        screenSize !== 'small'
                                                            ? 'Configuration'
                                                            : undefined
                                                    }
                                                    icon={
                                                        <Faders
                                                            color={
                                                                cpTheme.global
                                                                    .colors[
                                                                    'dark-4'
                                                                ]
                                                            }
                                                        />
                                                    }
                                                    onClick={
                                                        toggleShowSolverConfigModal
                                                    }
                                                />
                                                <Button
                                                    disabled
                                                    color="dark-4"
                                                    size="small"
                                                    label={
                                                        screenSize !== 'small'
                                                            ? ' Conditions'
                                                            : undefined
                                                    }
                                                    icon={
                                                        <ArrowsClockwise
                                                            color={
                                                                cpTheme.global
                                                                    .colors[
                                                                    'dark-4'
                                                                ]
                                                            }
                                                        />
                                                    }
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                    <SolverStatusBadge
                                        status={
                                            CONDITION_STATUS_INFO[
                                                currentCondition.status
                                            ]?.name || 'Unknown Status'
                                        }
                                        background={
                                            CONDITION_STATUS_INFO[
                                                currentCondition.status
                                            ]?.color || 'status-error'
                                        }
                                        tipContent={
                                            CONDITION_STATUS_INFO[
                                                currentCondition.status
                                            ]?.description || undefined
                                        }
                                    />
                                </Stack>
                            </Box>
                        )
                    }}
                </ResponsiveContext.Consumer>
            </IconContext.Provider>
            {showSolverConfigModal && (
                <BaseLayerModal onClose={toggleShowSolverConfigModal}>
                    <SolverConfigInfo
                        solverData={solverData}
                        currentCondition={currentCondition}
                    />
                </BaseLayerModal>
            )}
        </>
    )
}

export default SolverHeader
