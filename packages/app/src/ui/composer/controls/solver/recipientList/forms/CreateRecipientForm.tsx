import { Box, FormExtendedEvent } from 'grommet'

import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import RecipientConfigForm from './RecipientConfigForm'
import { UserPlus } from 'phosphor-react'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

type CreateRecipientFormProps = {
    onClose: () => void
}

export type RecipientFormType = {
    address: string
    description: string
}

const CreateRecipientForm = ({ onClose }: CreateRecipientFormProps) => {
    const { dispatch } = useComposerContext()

    const [input, setInput] = useState<RecipientFormType>({
        address: '',
        description: '',
    })

    const onSubmit = (event: FormExtendedEvent<RecipientFormType, Element>) => {
        event.preventDefault()
        dispatch({
            type: 'CREATE_RECIPIENT',
            payload: input,
        })
        onClose()
    }

    return (
        <Box gap="small">
            <HeaderTextSection
                title="Create new recipient"
                subTitle="Who else deserves a share?"
                paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra."
            />
            <RecipientConfigForm
                onSubmit={onSubmit}
                setRecipientInput={setInput}
                recipientInput={input}
                submitIcon={<UserPlus />}
                submitLabel="Create recipient"
            />
        </Box>
    )
}

export default CreateRecipientForm
