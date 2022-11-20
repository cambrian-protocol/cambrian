import SlotTagFormFields, {
    SlotTagModel,
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

    const [input, setInput] = useState<SlotTagModel>(initialSlotTagInput)

    //Init
    useEffect(() => {
        if (currentSolver && currentSolver.slotTags[slotId]) {
            setInput(currentSolver.slotTags[slotId].metadata)
        }
    }, [])

    const onSubmit = (event: FormExtendedEvent<SlotTagModel, Element>) => {
        event.preventDefault()
        dispatch({
            type: 'UPDATE_SLOT_TAG',
            payload: { slotIdToUpdate: slotId, slotTag: input },
        })
        onClose()
    }

    return (
        <Form<SlotTagModel>
            value={input}
            onSubmit={(event) => onSubmit(event)}
            onChange={(nextValue: SlotTagModel) => {
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
