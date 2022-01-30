import { ArrowSquareIn, WarningCircle } from 'phosphor-react'
import { Box, Text } from 'grommet'
import { SlotModel, SlotTypes } from '@cambrian/app/models/SlotModel'

import ListItem from '@cambrian/app/components/list/ListItem'
import UpdateSlotFormModal from './modals/UpdateSlotModal'
import { getSlotTitle } from '@cambrian/app/utils/helpers/slotHelpers'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

interface SlotListItemProps {
    slotModel: SlotModel
}

const SlotListItem = ({ slotModel }: SlotListItemProps) => {
    const { composer, dispatch } = useComposerContext()
    const [showUpdateSlotModal, setShowUpdateSlotModal] = useState(false)

    const toggleUpdateSlotModal = () =>
        setShowUpdateSlotModal(!showUpdateSlotModal)

    const currentSlotTypeLabel =
        slotModel.slotType === SlotTypes.Callback
            ? 'Callback'
            : slotModel.slotType === SlotTypes.Function
            ? 'Function'
            : slotModel.slotType === SlotTypes.Manual
            ? 'Manual'
            : 'Constant'

    const handleRemoveSlot = () => {
        dispatch({
            type: 'DELETE_SLOT',
            payload: { slotToDelete: slotModel },
        })
    }

    const currentTitle = getSlotTitle(slotModel, composer.solvers)

    return (
        <>
            <ListItem
                icon={<ArrowSquareIn size={'24'} />}
                description={currentSlotTypeLabel}
                title={currentTitle}
                onEdit={
                    slotModel.solverConfigAddress === undefined && slotModel.id
                        ? toggleUpdateSlotModal
                        : undefined
                }
                onRemove={slotModel.id ? handleRemoveSlot : undefined}
            />
            {showUpdateSlotModal && (
                <UpdateSlotFormModal
                    slotModel={slotModel}
                    onClose={toggleUpdateSlotModal}
                />
            )}
        </>
    )
}

export default SlotListItem
