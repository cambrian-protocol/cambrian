import { ArrowArcLeft, PuzzlePiece, User, WarningCircle } from 'phosphor-react'
import {
    ComposerSlotPathType,
    SlotTypes,
} from '@cambrian/app/src/models/SlotModel'
import React, { useState } from 'react'

import { ComposerSolverModel } from '@cambrian/app/src/models/SolverModel'
import ListItem from '@cambrian/app/components/list/ListItem'
import { RecipientAmountModel } from '@cambrian/app/models/ConditionModel'
import UpdateRecipientAmountModal from './modals/UpdateRecipientAmountModal'
import UpdateRecipientModal from '../../solver/recipientList/modals/UpdateRecipientModal'
import { getSlotTitle } from '@cambrian/app/utils/helpers/slotHelpers'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

type RecipientAmountListItemProps = {
    recipientSlotPath: ComposerSlotPathType
    currentSolver: ComposerSolverModel
    currentOcId: string
}

const RecipientAmountListItem = ({
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

    const recipientAmountModel = findRecipientAmountModel(
        currentSolver,
        currentOcId,
        recipientSlotPath
    )

    // TODO Error handling
    if (recipientAmountModel === undefined) {
        console.error("Couldn't find a recipientAmountModel")
        return null
    }

    const currentIcon =
        recipientAmountModel.recipientModel.slotType === SlotTypes.Callback ? (
            <ArrowArcLeft size="24" />
        ) : recipientAmountModel.recipientModel.slotType ===
          SlotTypes.Function ? (
            <PuzzlePiece size="24" />
        ) : (
            <User size="24" />
        )

    const currentTitle = getSlotTitle(
        recipientAmountModel.recipientModel,
        composer.solvers
    )

    const currentAllocation = recipientAmountModel.amountModel?.data[0]

    // TODO custom confirmation modal
    const handleDeleteRecipient = () => {
        if (
            recipientAmountModel !== undefined &&
            recipientAmountModel.recipientModel !== undefined &&
            window.confirm(
                'Are you sure? If you delete a constant recipient, any callback slot to it will also be deleted.'
            )
        ) {
            dispatch({
                type: 'DELETE_SLOT',
                payload: { slotToDelete: recipientAmountModel.recipientModel },
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
                    recipientAmountModel.recipientModel.slotType ===
                        SlotTypes.Constant &&
                    recipientAmountModel.recipientModel.solverConfigAddress ===
                        undefined
                        ? toggleShowEditRecipientModal
                        : undefined
                }
            />
            {showEditAmountModal && (
                <UpdateRecipientAmountModal
                    recipientSlotPath={recipientSlotPath}
                    onClose={toggleShowEditAmountModal}
                    recipientAmountModel={recipientAmountModel}
                />
            )}
            {showEditRecipientModal && (
                <UpdateRecipientModal
                    onClose={toggleShowEditRecipientModal}
                    recipientModel={recipientAmountModel.recipientModel}
                />
            )}
        </>
    )
}

export default RecipientAmountListItem

export const findRecipientAmountModel = (
    solver: ComposerSolverModel,
    ocId: string,
    recipientSlotPath: ComposerSlotPathType
): RecipientAmountModel | undefined => {
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
