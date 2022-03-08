import { ArrowSquareIn } from 'phosphor-react'
import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import ListItem from '@cambrian/app/components/list/ListItem'
import { SlotType } from '@cambrian/app/models/SlotType'
import UpdateSlotFormModal from './modals/UpdateSlotModal'
import { getSlotTitle } from '@cambrian/app/utils/helpers/slotHelpers'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

interface SlotListItemProps {
    slotModel: ComposerSlotModel
}

const SlotListItem = ({ slotModel }: SlotListItemProps) => {
    const { composer, dispatch, currentSolver } = useComposerContext()

    if (!currentSolver) throw Error('No current Solver defined!')

    const [showUpdateSlotModal, setShowUpdateSlotModal] = useState(false)

    const toggleUpdateSlotModal = () =>
        setShowUpdateSlotModal(!showUpdateSlotModal)

    const currentSlotTypeLabel =
        slotModel.slotType === SlotType.Callback
            ? 'Callback'
            : slotModel.slotType === SlotType.Function
            ? 'Function'
            : slotModel.slotType === SlotType.Manual
            ? 'Manual'
            : 'Constant'

    const handleRemoveSlot = () => {
        dispatch({
            type: 'DELETE_SLOT',
            payload: { slotToDelete: slotModel },
        })
    }

    const currentTitle = getSlotTitle(
        slotModel,
        currentSolver.slotTags,
        composer.solvers
    )

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
