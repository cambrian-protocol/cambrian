import { ArrowArcLeft, PuzzlePiece, User, WarningCircle } from 'phosphor-react'
import React, { useState } from 'react'

import BaseComposerListItem from '@cambrian/app/components/list/BaseComposerListItem'
import { ComposerAllocationType } from '@cambrian/app/models/AllocationModel'
import { ComposerSlotPathType } from '@cambrian/app/src/models/SlotModel'
import { ComposerSolverModel } from '@cambrian/app/src/models/SolverModel'
import { SlotType } from '@cambrian/app/src/models/SlotType'
import UpdateRecipientAllocationModal from './modals/UpdateRecipientAllocationModal'
import UpdateRecipientModal from '../../solver/recipientList/modals/UpdateRecipientModal'
import { getSlotTitle } from '@cambrian/app/utils/helpers/slotHelpers'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

type RecipientAllocationListItemProps = {
    recipientSlotPath: ComposerSlotPathType
    currentSolver: ComposerSolverModel
    currentOcId: string
}

const RecipientAllocationListItem = ({
    recipientSlotPath,
    currentSolver,
    currentOcId,
}: RecipientAllocationListItemProps) => {
    const { composer, dispatch } = useComposerContext()
    const [showEditAmountModal, setShowEditAmountModal] = useState(false)
    const [showEditRecipientModal, setShowEditRecipientModal] = useState(false)

    const toggleShowEditAmountModal = () => {
        setShowEditAmountModal(!showEditAmountModal)
    }

    const toggleShowEditRecipientModal = () => {
        setShowEditRecipientModal(!showEditRecipientModal)
    }

    const allocation = findAllocation(
        currentSolver,
        currentOcId,
        recipientSlotPath
    )

    // TODO Error handling
    if (allocation === undefined) {
        console.error("Couldn't find a recipientAmountModel")
        return null
    }

    const currentIcon =
        allocation.recipientModel.slotType === SlotType.Callback ? (
            <ArrowArcLeft size="24" />
        ) : allocation.recipientModel.slotType === SlotType.Function ? (
            <PuzzlePiece size="24" />
        ) : (
            <User size="24" />
        )

    const currentTitle = getSlotTitle(
        allocation.recipientModel,
        currentSolver.slotTags,
        composer.solvers
    )

    const currentAllocation = allocation.amountModel?.data[0]

    // TODO custom confirmation modal
    const handleDeleteRecipient = () => {
        if (
            allocation !== undefined &&
            allocation.recipientModel !== undefined &&
            window.confirm(
                'Are you sure? If you delete a constant recipient, any callback slot to it will also be deleted.'
            )
        ) {
            dispatch({
                type: 'DELETE_SLOT',
                payload: { slotToDelete: allocation.recipientModel },
            })
        }
    }

    return (
        <>
            <BaseComposerListItem
                description="Recipient"
                icon={currentIcon}
                title={currentTitle || <WarningCircle />}
                valueLabel={`${currentAllocation}`}
                valueUnit="BPs"
                onAllocate={toggleShowEditAmountModal}
                onRemove={handleDeleteRecipient}
                onEdit={toggleShowEditRecipientModal}
            />
            {showEditAmountModal && (
                <UpdateRecipientAllocationModal
                    onClose={toggleShowEditAmountModal}
                    allocation={allocation}
                />
            )}
            {showEditRecipientModal && (
                <UpdateRecipientModal
                    onClose={toggleShowEditRecipientModal}
                    recipientSlot={allocation.recipientModel}
                />
            )}
        </>
    )
}

export default RecipientAllocationListItem

export const findAllocation = (
    solver: ComposerSolverModel,
    ocId: string,
    recipientSlotPath: ComposerSlotPathType
): ComposerAllocationType | undefined => {
    const recipientAmountPath = solver.config.condition.recipientAmountSlots[
        ocId
    ]?.find(
        (recipientAmount) =>
            recipientAmount.recipient.slotId === recipientSlotPath.slotId &&
            recipientAmount.recipient.solverId === recipientSlotPath.solverId
    )

    if (recipientAmountPath !== undefined) {
        return {
            recipientModel:
                solver.config.slots[recipientAmountPath.recipient.slotId],
            amountModel: solver.config.slots[recipientAmountPath.amount.slotId],
        }
    }
}
