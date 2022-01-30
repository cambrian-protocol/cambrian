import { Box, FormExtendedEvent } from 'grommet'
import React, { useState } from 'react'

import BaseModal from '@cambrian/app/components/modals/BaseModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import OutcomeConfigForm from '../forms/OutcomeConfigForm'
import { OutcomeModel } from '@cambrian/app/models/ConditionModel'
import { PlusCircle } from 'phosphor-react'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { ulid } from 'ulid'

export const initialOutcomeInput: OutcomeModel = {
    id: ulid(),
    title: '',
    description: '',
    uri: '',
}

type CreateOutcomeModalProps = {
    onClose: () => void
}

const CreateOutcomeModal = ({ onClose }: CreateOutcomeModalProps) => {
    const { dispatch } = useComposerContext()
    const [input, setInput] = useState<OutcomeModel>(initialOutcomeInput)

    const onSubmit = (event: FormExtendedEvent<OutcomeModel, Element>) => {
        event.preventDefault()
        dispatch({ type: 'CREATE_OUTCOME', payload: input })
        onClose()
    }

    return (
        <BaseModal onClose={onClose}>
            <Box gap="small">
                <HeaderTextSection
                    title="Create new outcome"
                    subTitle="What could happen?"
                    paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra."
                />
                <OutcomeConfigForm
                    onSubmit={onSubmit}
                    outcomeInput={input}
                    setOutcomeInput={setInput}
                    submitIcon={<PlusCircle />}
                    submitLabel="Create outcome"
                />
            </Box>
        </BaseModal>
    )
}

export default CreateOutcomeModal
