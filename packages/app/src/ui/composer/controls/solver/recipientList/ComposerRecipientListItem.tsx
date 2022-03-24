import { ArrowArcLeft, PuzzlePiece, User } from 'phosphor-react'
import React, { useState } from 'react'

import { ComposerSlotPathType } from '@cambrian/app/src/models/SlotModel'
import ListItem from '@cambrian/app/components/list/ListItem'
import { SlotType } from '@cambrian/app/src/models/SlotType'
import UpdateRecipientModal from './modals/UpdateRecipientModal'
import { getSlotTitle } from '@cambrian/app/utils/helpers/slotHelpers'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

interface ComposerRecipientListItemProps {
    recipientSlotPath: ComposerSlotPathType
}

const ComposerRecipientListItem = ({
    recipientSlotPath,
}: ComposerRecipientListItemProps) => {
    const { composer, dispatch, currentSolver } = useComposerContext()
    if (!currentSolver) throw Error('No current Solver defined!')

    const [showEditRecipientModal, setShowEditRecipientModal] = useState(false)

    const toggleShowEditRecipientModal = () => {
        setShowEditRecipientModal(!showEditRecipientModal)
    }

    const recipientSlot = composer.solvers?.find(
        (x) => x.id === recipientSlotPath.solverId
    )?.config.slots[recipientSlotPath.slotId]

    if (!recipientSlot) {
        throw new Error('Could not find recipient model')
    }

    const currentIcon =
        recipientSlot.slotType === SlotType.Callback ? (
            <ArrowArcLeft size="24" />
        ) : recipientSlot.slotType === SlotType.Function ? (
            <PuzzlePiece size="24" />
        ) : (
            <User size="24" />
        )

    const currentTitle = getSlotTitle(
        recipientSlot,
        currentSolver.slotTags,
        composer.solvers
    )
    // TODO custom confirmation modal
    const handleDeleteRecipient = () => {
        if (window.confirm('Are you sure?')) {
            dispatch({
                type: 'DELETE_SLOT',
                payload: { slotToDelete: recipientSlot },
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
                onEdit={toggleShowEditRecipientModal}
            />
            {showEditRecipientModal && (
                <UpdateRecipientModal
                    onClose={toggleShowEditRecipientModal}
                    recipientSlot={recipientSlot}
                />
            )}
        </>
    )
}

export default ComposerRecipientListItem
