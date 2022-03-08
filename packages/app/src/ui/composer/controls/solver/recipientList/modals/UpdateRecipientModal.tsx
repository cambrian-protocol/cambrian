import { Box, FormExtendedEvent } from 'grommet'
import RecipientConfigForm, {
    RecipientFormType,
    initialRecipientConfigFormInput,
} from '../forms/RecipientConfigForm'
import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Button } from 'grommet'
import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import { SlotTagFormInputType } from '../../general/forms/SlotTagForm'
import SlotTagModal from '../../general/modals/SlotTagModal'
import { initialSlotTagInput } from '../../slotList/modals/CreateSlotModal'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'

interface UpdateRecipientModalProps {
    onClose: () => void
    recipientSlot: ComposerSlotModel
}

const UpdateRecipientModal = ({
    onClose,
    recipientSlot,
}: UpdateRecipientModalProps) => {
    const { dispatch, currentSolver } = useComposerContext()

    if (!currentSolver) throw Error('No current Solver defined!')

    const [input, setInput] = useState<RecipientFormType>(
        initialRecipientConfigFormInput
    )

    const [slotTagInput, setSlotTagInput] =
        useState<SlotTagFormInputType>(initialSlotTagInput)

    const [showSlotTagModal, setShowSlotTagModal] = useState(false)
    const toggleShowSlotTagModal = () => setShowSlotTagModal(!showSlotTagModal)

    useEffect(() => {
        //Init
        if (recipientSlot.data.length === 1) {
            setInput({
                address: recipientSlot.data[0].toString(),
            })
        }

        const slotTag = currentSolver.slotTags[recipientSlot.id]
        if (slotTag) {
            setSlotTagInput({
                description: slotTag.description,
                label: slotTag.label,
                isFlex: slotTag.isFlex,
            })
        }
    }, [])

    const onSubmit = (event: FormExtendedEvent<RecipientFormType, Element>) => {
        event.preventDefault()

        dispatch({
            type: 'UPDATE_RECIPIENT',
            payload: {
                slotId: recipientSlot.id,
                recipientData: input,
                slotTag: slotTagInput,
            },
        })
        onClose()
    }

    return (
        <>
            <BaseLayerModal onBack={onClose}>
                <HeaderTextSection
                    title="Edit recipient"
                    subTitle="Changed your mind?"
                    paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra."
                />
                <Button
                    onClick={toggleShowSlotTagModal}
                    secondary
                    label="Tag"
                />
                <Box fill>
                    <RecipientConfigForm
                        onSubmit={onSubmit}
                        setRecipientInput={setInput}
                        recipientInput={input}
                        submitLabel="Save"
                    />
                </Box>
            </BaseLayerModal>
            {showSlotTagModal && (
                <SlotTagModal
                    onBack={toggleShowSlotTagModal}
                    slotTagInput={slotTagInput}
                    setSlotTagInput={setSlotTagInput}
                />
            )}
        </>
    )
}

export default UpdateRecipientModal
