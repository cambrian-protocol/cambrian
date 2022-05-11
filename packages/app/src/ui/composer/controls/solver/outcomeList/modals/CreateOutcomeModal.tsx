import React, { useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { FormExtendedEvent } from 'grommet'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import OutcomeConfigForm from '../forms/OutcomeConfigForm'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import { ulid } from 'ulid'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

export const initialOutcomeInput: OutcomeModel = {
    id: ulid(),
    title: '',
    description: '',
    context: '',
    uri: '',
}

type CreateOutcomeModalProps = {
    onClose: () => void
}

const CreateOutcomeModal = ({ onClose }: CreateOutcomeModalProps) => {
    const { dispatch } = useComposerContext()
    const [input, setInput] = useState<OutcomeModel>(initialOutcomeInput)
    const [isPinning, setIsPinning] = useState(false)

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
            dispatch({ type: 'CREATE_OUTCOME', payload: outcomeToSave })
            onClose()
        } catch (e) {
            console.error(e)
        }
        setIsPinning(false)
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
                isPinning={isPinning}
            />
        </BaseLayerModal>
    )
}

export default CreateOutcomeModal
