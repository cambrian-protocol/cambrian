import { Box, Text } from 'grommet'
import { Gear, UsersThree } from 'phosphor-react'
import { Handle, Position } from 'react-flow-renderer'
import React, { memo, useState } from 'react'

import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import { ComposerSlotPathType } from '@cambrian/app/models/SlotModel'
import { ComposerSolverModel } from '@cambrian/app/models/SolverModel'
import { ParticipantModel } from '@cambrian/app/models/ParticipantModel'
import RecipientsModal from '@cambrian/app/components/modals/RecipientsModal'
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
    console.log(recipientsData)
    /* 
    
        Configuration should include:
        - Keeper Address
        - Arbitrator Address
        - Timelock
        - Dynamic Implementation / Core Input?? Privileges? Writer Buyer (maybe some kind of batches 'can chat', 'can submit work')

    
    */
    return (
        <>
            <Handle position={Position.Top} type="target" id="a" />
            <Box
                background="primary-gradient"
                pad="medium"
                round="small"
                width={{ min: 'small', max: 'medium' }}
                gap="small"
            >
                <Text>{solverTag.title}</Text>
                <Text size="small">{solverTag.description}</Text>
                <BaseMenuListItem
                    icon={<Gear />}
                    onClick={toggleShowSolverConfigurationModal}
                    title="Configuration"
                />
                <BaseMenuListItem
                    icon={<UsersThree />}
                    onClick={toggleShowRecipientsModal}
                    title="Recipients"
                />
            </Box>
            <Handle type="source" position={Position.Bottom} id="b" />
            {showRecipientsModal && (
                <RecipientsModal
                    recipientsData={recipientsData}
                    onClose={toggleShowRecipientsModal}
                />
            )}
            {showSolverConfigurationModal && <></>}
        </>
    )
})
