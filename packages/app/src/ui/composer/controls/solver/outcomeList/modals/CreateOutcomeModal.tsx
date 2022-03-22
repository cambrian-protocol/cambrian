import { Box, FormExtendedEvent } from 'grommet'
import React, { useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import OutcomeConfigForm from '../forms/OutcomeConfigForm'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { ulid } from 'ulid'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

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
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title="Create new outcome"
                subTitle="What could happen?"
                paragraph="Define the important conditions of the outcome under Description and include other relevant information under Context."
            />
            <OutcomeConfigForm
                onSubmit={onSubmit}
                outcomeInput={input}
                setOutcomeInput={setInput}
                submitLabel="Create"
            />
        </BaseLayerModal>
    )
}

export default CreateOutcomeModal
