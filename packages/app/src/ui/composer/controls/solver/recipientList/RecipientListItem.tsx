import { ArrowArcLeft, PuzzlePiece, User, WarningCircle } from 'phosphor-react'
import { Box, Text } from 'grommet'
import React, { useState } from 'react'
import { SlotPath, SlotTypes } from '@cambrian/app/src/models/SlotModel'

import ListItem from '@cambrian/app/components/list/ListItem'
import UpdateRecipientModal from './modals/UpdateRecipientModal'
import { getSlotTitle } from '@cambrian/app/utils/helpers/slotHelpers'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

interface RecipientListItemProps {
    recipientSlotPath: SlotPath
}

const RecipientListItem = ({ recipientSlotPath }: RecipientListItemProps) => {
    const { composer, dispatch } = useComposerContext()
    const [showEditRecipientModal, setShowEditRecipientModal] = useState(false)

    const toggleShowEditRecipientModal = () => {
        setShowEditRecipientModal(!showEditRecipientModal)
    }

    const recipientModel = composer.solvers?.find(
        (x) => x.id === recipientSlotPath.solverId
    )?.config.slots[recipientSlotPath.slotId]

    if (!recipientModel) {
        throw new Error('Could not find recipient model')
    }

    const currentIcon =
        recipientModel.slotType === SlotTypes.Callback ? (
            <ArrowArcLeft size="24" />
        ) : recipientModel.slotType === SlotTypes.Function ? (
            <PuzzlePiece size="24" />
        ) : (
            <User size="24" />
        )

    const currentTitle = getSlotTitle(recipientModel, composer.solvers)
    // TODO custom confirmation modal
    const handleDeleteRecipient = () => {
        if (window.confirm('Are you sure?')) {
            dispatch({
                type: 'DELETE_SLOT',
                payload: { slotToDelete: recipientModel },
            })
        }
    }

    return (
        <>
            <ListItem
                description="Recipient"
                icon={currentIcon}
                title={currentTitle}
                onRemove={handleDeleteRecipient}
                onEdit={
                    recipientModel.slotType === SlotTypes.Constant &&
                    recipientModel.solverConfigAddress === undefined
                        ? toggleShowEditRecipientModal
                        : undefined
                }
            />
            {showEditRecipientModal && (
                <UpdateRecipientModal
                    onClose={toggleShowEditRecipientModal}
                    recipientModel={recipientModel}
                />
            )}
        </>
    )
}

export default RecipientListItem
