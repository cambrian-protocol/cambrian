import SlotTagForm, { SlotTagFormInputType } from '../forms/SlotTagForm'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { FormExtendedEvent } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { useState } from 'react'

interface SlotTagModalProps {
    slotTagInput: SlotTagFormInputType
    onSubmit: (input: SlotTagFormInputType) => void
    onBack: () => void
}

const SlotTagModal = ({
    onBack,
    slotTagInput,
    onSubmit,
}: SlotTagModalProps) => {
    const [input, setInput] = useState<SlotTagFormInputType>(slotTagInput)

    const handleSubmit = (event: FormExtendedEvent<{}, Element>) => {
        event.preventDefault()
        onSubmit(input)
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
                    onSubmit={handleSubmit}
                    input={input}
                    setInput={setInput}
                />
            </BaseFormContainer>
        </BaseLayerModal>
    )
}

export default SlotTagModal
