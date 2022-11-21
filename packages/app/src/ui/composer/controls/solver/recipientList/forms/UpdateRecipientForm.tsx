import { Button, Form, FormExtendedEvent, FormField } from 'grommet'
import {
    ComposerSlotModel,
    ComposerSlotPathType,
} from '@cambrian/app/models/SlotModel'
import { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { CreateRecipientFormType } from './CreateRecipientForm'
import ReferencedSlotInfo from '@cambrian/app/components/info/ReferencedSlotInfo'
import SlotTagFormFields from '../../general/forms/SlotTagFormFields'
import { defaultSlotTagValues } from '@cambrian/app/classes/Tags/SlotTag'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

interface RecipientConfigFormProps {
    onClose: () => void
    recipient: ComposerSlotModel
}

export const initialCreateRecipientFormInput = {
    ...defaultSlotTagValues,
    address: '',
}

export type UpdateRecipientFormType = CreateRecipientFormType & {
    reference?: ComposerSlotPathType
}

const UpdateRecipientForm = ({
    recipient,
    onClose,
}: RecipientConfigFormProps) => {
    const { dispatch, currentSolver } = useComposerContext()
    if (!currentSolver) throw Error('No current Solver defined!')

    const [input, setInput] = useState<UpdateRecipientFormType>(
        initialCreateRecipientFormInput
    )

    //Init
    useEffect(() => {
        if (recipient.data.length === 1) {
            const slotTag = currentSolver.slotTags[recipient.id]
            setInput({
                address: recipient.data[0].toString(),
                label: (slotTag && slotTag.label) || '',
                description: (slotTag && slotTag.description) || '',
                instruction: (slotTag && slotTag.instruction) || '',
                isFlex: (slotTag && slotTag.isFlex) || false,
                reference: recipient.reference,
                slotId: slotTag.slotId,
                solverId: slotTag.solverId,
            })
        }
    }, [])

    const onSubmit = (
        event: FormExtendedEvent<CreateRecipientFormType, Element>
    ) => {
        event.preventDefault()
        dispatch({
            type: 'UPDATE_RECIPIENT',
            payload: {
                slotId: recipient.id,
                recipientData: input,
            },
        })
        onClose()
    }

    return (
        <Form<CreateRecipientFormType>
            value={input}
            onSubmit={(event) => onSubmit(event)}
            onChange={(nextValue: CreateRecipientFormType) => {
                setInput(nextValue)
            }}
        >
            <BaseFormContainer>
                <SlotTagFormFields />
                <BaseFormGroupContainer>
                    {input.reference ? (
                        <ReferencedSlotInfo reference={input.reference} />
                    ) : (
                        <FormField name="address" label="Address" />
                    )}
                </BaseFormGroupContainer>
                <Button primary type="submit" label="Save recipient" />
            </BaseFormContainer>
        </Form>
    )
}

export default UpdateRecipientForm
