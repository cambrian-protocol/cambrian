import SlotTagFormFields, {
    SlotTagFormFieldsType,
    initialSlotTagInput,
} from './SlotTagFormFields'
import { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import { Button } from 'grommet'
import { Form } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

interface SlotTagFormProps {
    onClose: () => void
    slotId: string
}

const SlotTagForm = ({ onClose, slotId }: SlotTagFormProps) => {
    const { currentSolver, dispatch } = useComposerContext()

    const [input, setInput] =
        useState<SlotTagFormFieldsType>(initialSlotTagInput)

    //Init
    useEffect(() => {
        if (currentSolver && currentSolver.slotTags[slotId]) {
            setInput(currentSolver.slotTags[slotId])
        }
    }, [])

    const onSubmit = (
        event: FormExtendedEvent<SlotTagFormFieldsType, Element>
    ) => {
        event.preventDefault()
        dispatch({
            type: 'UPDATE_SLOT_TAG',
            payload: { slotIdToUpdate: slotId, slotTag: input },
        })
        onClose()
    }

    return (
        <Form<SlotTagFormFieldsType>
            value={input}
            onSubmit={(event) => onSubmit(event)}
            onChange={(nextValue: SlotTagFormFieldsType) => {
                setInput(nextValue)
            }}
        >
            <BaseFormContainer>
                <SlotTagFormFields />
                <Button primary type="submit" label="Save Tag" />
            </BaseFormContainer>
        </Form>
    )
}

export default SlotTagForm
