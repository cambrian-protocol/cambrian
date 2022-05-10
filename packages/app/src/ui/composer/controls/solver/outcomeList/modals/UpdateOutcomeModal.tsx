import { Box, FormExtendedEvent } from 'grommet'
import React, { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
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
    const [isPinning, setIsPinning] = useState(false)

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

    const onSubmit = async (
        event: FormExtendedEvent<OutcomeModel, Element>
    ) => {
        event.preventDefault()
        try {
            setIsPinning(true)
            const ipfs = new IPFSAPI()
            const res = await ipfs.pinRemote({
                title: input.title,
                description: input.description,
                context: input.context,
            })
            if (!res || !res.IpfsHash) throw GENERAL_ERROR['IPFS_PIN_ERROR']

            const outcomeToSave: OutcomeModel = { ...input, uri: res.IpfsHash }
            dispatch({ type: 'UPDATE_OUTCOME', payload: outcomeToSave })
            onClose()
        } catch (e) {
            console.error(e)
        }
        setIsPinning(false)
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
                    isPinning={isPinning}
                />
            </Box>
        </BaseLayerModal>
    )
}

export default UpdateOutcomeModal
