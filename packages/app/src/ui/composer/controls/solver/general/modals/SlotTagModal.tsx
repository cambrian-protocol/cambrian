import { SetStateAction, useState } from 'react'
import SlotTagForm, { SlotTagFormInputType } from '../forms/SlotTagForm'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { FormExtendedEvent } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'

interface SlotTagModalProps {
    slotTagInput: SlotTagFormInputType
    setSlotTagInput: React.Dispatch<SetStateAction<SlotTagFormInputType>>
    onBack: () => void
}

const SlotTagModal = ({
    onBack,
    slotTagInput,
    setSlotTagInput,
}: SlotTagModalProps) => {
    const [input, setInput] = useState<SlotTagFormInputType>(slotTagInput)

    const onSubmit = (event: FormExtendedEvent<{}, Element>) => {
        event.preventDefault()
        setSlotTagInput(input)
        onBack()
    }

    return (
        <BaseLayerModal onBack={onBack}>
            <HeaderTextSection
                title="Slot Tag"
                paragraph="Define some Metadata that everybody knows what they are dealing with"
            />
            <SlotTagForm
                onSubmit={onSubmit}
                input={input}
                setInput={setInput}
            />
        </BaseLayerModal>
    )
}

export default SlotTagModal
