import { Box, FormExtendedEvent } from 'grommet'
import React, { useEffect, useState } from 'react'

import BaseModal from '@cambrian/app/components/modals/BaseModal'
import { FloppyDisk } from 'phosphor-react'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import OutcomeConfigForm from '../forms/OutcomeConfigForm'
import { OutcomeModel } from '@cambrian/app/models/ConditionModel'
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
        <BaseModal onClose={onClose}>
            <Box gap="small">
                <HeaderTextSection
                    title="Update outcome"
                    subTitle="Configurate your outcome"
                    paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra."
                />
                <OutcomeConfigForm
                    onSubmit={onSubmit}
                    outcomeInput={input}
                    setOutcomeInput={setInput}
                    submitIcon={<FloppyDisk />}
                    submitLabel="Save outcome"
                />
            </Box>
        </BaseModal>
    )
}

export default UpdateOutcomeModal
