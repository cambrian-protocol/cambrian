import { Box, Text } from 'grommet'
import { Handle, Position } from 'react-flow-renderer'
import React, { memo, useState } from 'react'

import { Button } from 'grommet'
import { Card } from 'grommet'
import { CardBody } from 'grommet'
import { CardHeader } from 'grommet'
import { ComposerSlotPathType } from '@cambrian/app/models/SlotModel'
import { ComposerSolverModel } from '@cambrian/app/models/SolverModel'
import { ParticipantModel } from '@cambrian/app/models/ParticipantModel'
import RecipientsModal from '@cambrian/app/components/modals/RecipientsModal'
import SolverConfigurationModal from '@cambrian/app/components/modals/SolverConfigurationModal'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'
import { getRecipientData } from '@cambrian/app/utils/helpers/slotHelpers'

interface PreviewSolverNodeProps {
    data: {
        currentSolver: ComposerSolverModel
        solvers: ComposerSolverModel[]
    }
}

export const PreviewSolverNode = memo(({ data }: PreviewSolverNodeProps) => {
    const [showRecipientsModal, setShowRecipientsModal] = useState(false)
    const [showSolverConfigurationModal, setShowSolverConfigurationModal] =
        useState(false)

    const toggleShowSolverConfigurationModal = () =>
        setShowSolverConfigurationModal(!showSolverConfigurationModal)

    const toggleShowRecipientsModal = () =>
        setShowRecipientsModal(!showRecipientsModal)
    const solverTag: SolverTagModel = data.currentSolver.solverTag

    const recipientsData: ParticipantModel[] =
        data.currentSolver.config.condition.recipients.map(
            (recipientSlotPath: ComposerSlotPathType) => {
                return getRecipientData(
                    data.currentSolver.config.slots[recipientSlotPath.slotId],
                    data.currentSolver,
                    data.solvers
                )
            }
        )

    return (
        <>
            <Handle position={Position.Top} type="target" id="a" />
            <Card background={'background-popup'}>
                <CardHeader
                    background={'background-front'}
                    pad={{ horizontal: 'medium', vertical: 'small' }}
                >
                    <Box>
                        <Text size="small" color="dark-4">
                            Solver
                        </Text>
                        <Text>{solverTag.title}</Text>
                    </Box>
                </CardHeader>
                <CardBody gap="medium" pad="medium">
                    <Button
                        primary
                        onClick={toggleShowSolverConfigurationModal}
                        label="Configuration"
                    />
                    <Button
                        primary
                        onClick={toggleShowRecipientsModal}
                        label="Recipients"
                    />
                </CardBody>
            </Card>
            <Handle type="source" position={Position.Bottom} id="b" />
            {showRecipientsModal && (
                <RecipientsModal
                    recipientsData={recipientsData}
                    onClose={toggleShowRecipientsModal}
                />
            )}
            {showSolverConfigurationModal && (
                <SolverConfigurationModal
                    solverData={data.currentSolver}
                    onClose={toggleShowSolverConfigurationModal}
                />
            )}
        </>
    )
})
