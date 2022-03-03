import { ArrowArcLeft, PuzzlePiece, User, WarningCircle } from 'phosphor-react'
import React, { useState } from 'react'

import { ComposerAllocationType } from '@cambrian/app/models/AllocationModel'
import { ComposerSlotPathType } from '@cambrian/app/src/models/SlotModel'
import { ComposerSolverModel } from '@cambrian/app/src/models/SolverModel'
import ListItem from '@cambrian/app/components/list/ListItem'
import { SlotType } from '@cambrian/app/src/models/SlotType'
import UpdateAllocationModal from './modals/UpdateAllocationModal'
import UpdateRecipientModal from '../../solver/recipientList/modals/UpdateRecipientModal'
import { getSlotTitle } from '@cambrian/app/utils/helpers/slotHelpers'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

type RecipientAmountListItemProps = {
    recipientSlotPath: ComposerSlotPathType
    currentSolver: ComposerSolverModel
    currentOcId: string
}

const AllocationListItem = ({
    recipientSlotPath,
    currentSolver,
    currentOcId,
}: RecipientAmountListItemProps) => {
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
            // TODO Check if amount is still being used - if not - delete amount slot
        }
    }

    return (
        <>
            <ListItem
                description="Recipient"
                icon={currentIcon}
                title={currentTitle || <WarningCircle />}
                valueLabel={`${currentAllocation}`}
                valueUnit="BPS"
                onAllocate={toggleShowEditAmountModal}
                onRemove={handleDeleteRecipient}
                onEdit={
                    allocation.recipientModel.slotType === SlotType.Constant &&
                    allocation.recipientModel.solverConfigAddress === undefined
                        ? toggleShowEditRecipientModal
                        : undefined
                }
            />
            {showEditAmountModal && (
                <UpdateAllocationModal
                    recipientSlotPath={recipientSlotPath}
                    onClose={toggleShowEditAmountModal}
                    allocation={allocation}
                />
            )}
            {showEditRecipientModal && (
                <UpdateRecipientModal
                    onClose={toggleShowEditRecipientModal}
                    recipientModel={allocation.recipientModel}
                />
            )}
        </>
    )
}

export default AllocationListItem

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
