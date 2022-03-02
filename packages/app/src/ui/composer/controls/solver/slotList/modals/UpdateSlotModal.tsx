import {
    ComposerSlotModel,
    SlotPath,
    SlotTypes,
} from '@cambrian/app/models/SlotModel'
import React, { useEffect, useState } from 'react'
import SlotConfigForm, {
    SlotConfigFormType,
    mapSlotConfigFormToSlotActionPayload,
} from '../forms/SlotConfigForm'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { FormExtendedEvent } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import _uniqueId from 'lodash/uniqueId'
import { initialSlotInput } from './CreateSlotModal'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

type UpdateSlotFormModalProps = {
    slotModel: ComposerSlotModel
    onClose: () => void
}

const UpdateSlotFormModal = ({
    onClose,
    slotModel,
}: UpdateSlotFormModalProps) => {
    const { dispatch } = useComposerContext()

    const [slotInput, setSlotInput] =
        useState<SlotConfigFormType>(initialSlotInput)

    // Init
    useEffect(() => {
        const dataInputFields = slotModel.data.map((dataEntry, idx) => {
            return {
                id: _uniqueId(),
                data: dataEntry,
                dataType: slotModel.dataTypes[idx],
            }
        })

        let callbackTargetSlotPath: SlotPath | undefined
        if (
            slotModel.slotType === SlotTypes.Callback &&
            slotModel.targetSolverId != undefined &&
            slotModel.data.length === 1
        ) {
            callbackTargetSlotPath = {
                solverId: slotModel.targetSolverId,
                slotId: slotModel.data[0],
            }
        }

        setSlotInput({
            slotType: slotModel.slotType,
            dataInputFields: dataInputFields,
            solverFunction: slotModel.solverFunction,
            targetSolverId: slotModel.targetSolverId,
            slotDescription: slotModel.description || '',
            callbackTargetSlotPath: callbackTargetSlotPath,
        })
    }, [])

    const onSubmit = (event: FormExtendedEvent<{}, Element>) => {
        event.preventDefault()

        dispatch({
            type: 'UPDATE_SLOT',
            payload: {
                slotIdToUpdate: slotModel.id,
                updatedSlot: mapSlotConfigFormToSlotActionPayload(slotInput),
            },
        })

        onClose()
    }

    return (
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title="Edit Slot"
                subTitle="Manual slot configuration"
                paragraph="You should know what you do. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. "
            />
            <SlotConfigForm
                onSubmit={onSubmit}
                slotInput={slotInput}
                setSlotInput={setSlotInput}
                submitLabel="Save slot"
            />
        </BaseLayerModal>
    )
}

export default UpdateSlotFormModal
