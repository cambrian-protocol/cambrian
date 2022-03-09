import { SetStateAction, useState } from 'react'
import SlotTagForm, { SlotTagFormInputType } from '../forms/SlotTagForm'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
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
                title="Tag"
                paragraph="Define some Metadata that everybody knows what they are dealing with"
            />
            <BaseFormContainer>
                <SlotTagForm
                    onSubmit={onSubmit}
                    input={input}
                    setInput={setInput}
                />
            </BaseFormContainer>
        </BaseLayerModal>
    )
}

export default SlotTagModal
