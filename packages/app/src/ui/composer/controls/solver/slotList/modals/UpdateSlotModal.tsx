import React, { useEffect, useState } from 'react'
import {
    initialSlotInput,
    initialSlotTagInput,
    mapSlotFormTypeToSlotActionPayload,
} from './CreateSlotModal'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import { FormExtendedEvent } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { SlotFormType } from '../forms/CreateSlotForm'
import { SlotTagFormInputType } from '../../general/forms/SlotTagForm'
import { Text } from 'grommet'
import UpdateSlotForm from '../forms/UpdateSlotForm'
import _uniqueId from 'lodash/uniqueId'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

type UpdateSlotFormModalProps = {
    slotModel: ComposerSlotModel
    onClose: () => void
}

const UpdateSlotFormModal = ({
    onClose,
    slotModel,
}: UpdateSlotFormModalProps) => {
    const { dispatch, currentSolver } = useComposerContext()

    if (!currentSolver) throw Error('No current Solver defined!')

    const [slotInput, setSlotInput] = useState<SlotFormType>(initialSlotInput)

    const [slotTagInput, setSlotTagInput] =
        useState<SlotTagFormInputType>(initialSlotTagInput)

    // Init
    useEffect(() => {
        const dataInputFields = slotModel.data.map((dataEntry, idx) => {
            return {
                id: _uniqueId(),
                data: dataEntry,
                dataType: slotModel.dataTypes[idx],
            }
        })
        setSlotInput({
            slotType: slotModel.slotType,
            dataInputFields: dataInputFields,
            solverFunction: slotModel.solverFunction,
            targetSolverId: slotModel.targetSolverId,
            reference: slotModel.reference,
        })

        const slotTag = currentSolver.slotTags[slotModel.id]

        if (slotTag) {
            setSlotTagInput({
                description: slotTag.description,
                isFlex: slotTag.isFlex,
                label: slotTag.label,
            })
        }
    }, [])

    const onSubmit = (event: FormExtendedEvent<{}, Element>) => {
        event.preventDefault()
        dispatch({
            type: 'UPDATE_SLOT',
            payload: {
                slotIdToUpdate: slotModel.id,
                updatedSlot: mapSlotFormTypeToSlotActionPayload(slotInput),
                slotTag: slotTagInput,
            },
        })

        onClose()
    }

    // TODO UX Improvement: CTA Go to reference slot
    return (
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title="Edit Slot"
                subTitle={`Slot ID: ${slotModel.id}`}
            />
            <Box fill>
                {slotInput.reference === undefined ? (
                    <UpdateSlotForm
                        slotTagInput={slotTagInput}
                        setSlotTagInput={setSlotTagInput}
                        onSubmit={onSubmit}
                        slotInput={slotInput}
                        setSlotInput={setSlotInput}
                    />
                ) : (
                    <BaseFormContainer>
                        <Text size="small" color="status-warning">
                            This is a reference to a slot of the solver:{' '}
                            {slotInput.reference.solverId} and its slot:{' '}
                            {slotInput.reference.slotId}. If you want to edit
                            it, you must edit the referenced slot directly
                        </Text>
                    </BaseFormContainer>
                )}
            </Box>
        </BaseLayerModal>
    )
}

export default UpdateSlotFormModal
