import React, { useState } from 'react'
import SlotConfigForm, {
    SlotConfigFormType,
    mapSlotConfigFormToSlotActionPayload,
} from '../forms/SlotConfigForm'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import { Box } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { SlotTagFormInputType } from '../../general/forms/SlotTagForm'
import SlotTagModal from '../../general/modals/SlotTagModal'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { Tag } from 'phosphor-react'
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

export const initialSlotInput: SlotConfigFormType = {
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

    const [slotInput, setSlotInput] =
        useState<SlotConfigFormType>(initialSlotInput)

    const [slotTagInput, setSlotTagInput] = useState(initialSlotTagInput)

    const [showSlotTagModal, setShowSlotTagModal] = useState(false)

    const toggleShowSlotTagModal = () => setShowSlotTagModal(!showSlotTagModal)

    const onSubmit = (event: FormExtendedEvent<{}, Element>) => {
        event.preventDefault()
        dispatch({
            type: 'CREATE_SLOT',
            payload: {
                slot: mapSlotConfigFormToSlotActionPayload(slotInput),
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
                    paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra."
                />
                <Box fill>
                    <BaseMenuListItem
                        subTitle="Define a label, a description and more..."
                        title="Tag"
                        icon={<Tag />}
                        onClick={toggleShowSlotTagModal}
                    />
                    <PlainSectionDivider />
                    <HeaderTextSection paragraph="Setup the type of slot and it's according configuration for the smart contract." />
                    <SlotConfigForm
                        onSubmit={onSubmit}
                        slotInput={slotInput}
                        setSlotInput={setSlotInput}
                        submitLabel="Create slot"
                    />
                </Box>
            </BaseLayerModal>
            {showSlotTagModal && (
                <SlotTagModal
                    onBack={toggleShowSlotTagModal}
                    slotTagInput={slotTagInput}
                    setSlotTagInput={setSlotTagInput}
                />
            )}
        </>
    )
}

export default CreateSlotFormModal
