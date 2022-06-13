import { ArrowsClockwise, Faders } from 'phosphor-react'
import { Box, Button, Heading, Stack, Text } from 'grommet'

import BaseFormGroupContainer from '../../containers/BaseFormGroupContainer'
import BaseLayerModal from '../../modals/BaseLayerModal'
import { CONDITION_STATUS_INFO } from '@cambrian/app/models/ConditionStatus'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import SolverConfigInfo from '../../info/SolverConfigInfo'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import StatusBadge from '../../badges/StatusBadge'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useState } from 'react'

interface SolverHeaderProps {
    metadata?: MetadataModel
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
            <Stack anchor="top-right">
                <Box pad={{ top: 'medium' }}>
                    <BaseFormGroupContainer
                        background="none"
                        width="xlarge"
                        direction="row"
                        justify="between"
                        align="center"
                        pad={{
                            vertical: 'small',
                            horizontal: 'medium',
                        }}
                        border
                    >
                        <Box>
                            <Text size="small" color="dark-4">
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
                                label={'Configurations'}
                                icon={
                                    <Faders
                                        color={cpTheme.global.colors['dark-4']}
                                    />
                                }
                                onClick={toggleShowSolverConfigModal}
                            />
                            <Button
                                disabled
                                color="dark-4"
                                size="small"
                                label={' Conditions'}
                                icon={
                                    <ArrowsClockwise
                                        color={cpTheme.global.colors['dark-4']}
                                    />
                                }
                            />
                        </Box>
                    </BaseFormGroupContainer>
                </Box>
                <StatusBadge
                    status={
                        CONDITION_STATUS_INFO[currentCondition.status]?.name ||
                        'Unknown Status'
                    }
                    background={
                        CONDITION_STATUS_INFO[currentCondition.status]?.color ||
                        'status-error'
                    }
                    tipContent={
                        CONDITION_STATUS_INFO[currentCondition.status]
                            ?.description || undefined
                    }
                />
            </Stack>
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
