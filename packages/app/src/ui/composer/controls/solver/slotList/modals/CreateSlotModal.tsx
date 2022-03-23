import CreateSlotForm, { SlotFormType } from '../forms/CreateSlotForm'
import React, { useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { SlotActionPayload } from '@cambrian/app/store/composer/composer.types'
import { SlotTagFormInputType } from '../../general/forms/SlotTagForm'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import _uniqueId from 'lodash/uniqueId'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

type CreateSlotModalProps = {
    onClose: () => void
}

export type SlotDataInputType = {
    id: string
    data: any
    dataType: SolidityDataTypes
}

export const initialSlotInput: SlotFormType = {
    slotType: SlotType.Constant,
    dataInputFields: [
        { id: _uniqueId(), data: '', dataType: SolidityDataTypes.Bytes },
    ],
}

export const initialSlotTagInput: SlotTagFormInputType = {
    label: '',
    description: '',
    isFlex: false,
}

const CreateSlotFormModal = ({ onClose }: CreateSlotModalProps) => {
    const { dispatch } = useComposerContext()

    const [slotInput, setSlotInput] = useState<SlotFormType>(initialSlotInput)

    const [slotTagInput, setSlotTagInput] = useState(initialSlotTagInput)

    const onSubmit = (event: FormExtendedEvent<{}, Element>) => {
        event.preventDefault()
        dispatch({
            type: 'CREATE_SLOT',
            payload: {
                slot: mapSlotFormTypeToSlotActionPayload(slotInput),
                slotTag: slotTagInput,
            },
        })

        onClose()
    }

    return (
        <>
            <BaseLayerModal onClose={onClose}>
                <HeaderTextSection
                    title="Create new Slot"
                    subTitle="Manual slot configuration"
                    paragraph="Create a new slot which provides data to this Solver during runtime. If you don't know, you can ignore this."
                />
                <Box fill>
                    <CreateSlotForm
                        slotTagInput={slotTagInput}
                        setSlotTagInput={setSlotTagInput}
                        onSubmit={onSubmit}
                        slotInput={slotInput}
                        setSlotInput={setSlotInput}
                    />
                </Box>
            </BaseLayerModal>
        </>
    )
}

export default CreateSlotFormModal

export const mapSlotFormTypeToSlotActionPayload = (
    slotConfigFormInput: SlotFormType
): SlotActionPayload => {
    const dataTypes: SolidityDataTypes[] = []
    slotConfigFormInput.dataInputFields?.forEach((field) => {
        dataTypes.push(field.dataType)
    })
    const data: any[] = []

    slotConfigFormInput.dataInputFields?.forEach((field) => {
        let dataToAdd: any = field.data
        // Parse to number if possible
        if (field.dataType === SolidityDataTypes.Uint256) {
            const parsedInt = parseInt(field.data)
            if (!isNaN(parsedInt)) {
                dataToAdd = parsedInt
            }
        }
        data.push(dataToAdd)
    })

    const slotPayload: SlotActionPayload = {
        slotType: slotConfigFormInput.slotType,
        dataTypes: dataTypes,
        data: data,
        reference: slotConfigFormInput.reference,
    }

    switch (slotConfigFormInput.slotType) {
        case SlotType.Callback:
            // Doesn't hurt to check
            if (slotConfigFormInput.reference !== undefined) {
                slotPayload.targetSolverId =
                    slotConfigFormInput.reference.solverId
            }
            break
        case SlotType.Function:
            slotPayload.targetSolverId = slotConfigFormInput.targetSolverId
            slotPayload.solverFunction = slotConfigFormInput.solverFunction
            break
    }
    return slotPayload
}
