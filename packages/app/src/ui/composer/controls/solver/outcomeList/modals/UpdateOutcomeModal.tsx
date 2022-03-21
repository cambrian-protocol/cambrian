import { Box, FormExtendedEvent } from 'grommet'
import React, { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import OutcomeConfigForm from '../forms/OutcomeConfigForm'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { initialOutcomeInput } from './CreateOutcomeModal'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

interface UpdateOutcomeModalProps {
    onClose: () => void
    outcome: OutcomeModel
}

const UpdateOutcomeModal = ({ outcome, onClose }: UpdateOutcomeModalProps) => {
    const { dispatch } = useComposerContext()
    const [input, setInput] = useState<OutcomeModel>(initialOutcomeInput)

    useEffect(() => {
        // Init
        setInput({
            title: outcome.title,
            description: outcome.description,
            uri: outcome.uri,
            context: outcome.context,
            id: outcome.id,
        })
    }, [])

    const onSubmit = (event: FormExtendedEvent<OutcomeModel, Element>) => {
        event.preventDefault()
        dispatch({ type: 'UPDATE_OUTCOME', payload: input })
        onClose()
    }

    return (
        <BaseLayerModal onClose={onClose}>
            <HeaderTextSection
                title="Update outcome"
                subTitle="Configurate your outcome"
                paragraph="Define the important conditions of the outcome under Description and include other relevant information under Context."
            />
            <Box fill>
                <OutcomeConfigForm
                    onSubmit={onSubmit}
                    outcomeInput={input}
                    setOutcomeInput={setInput}
                    submitLabel="Save"
                />
            </Box>
        </BaseLayerModal>
    )
}

export default UpdateOutcomeModal
