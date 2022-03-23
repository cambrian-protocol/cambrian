import { Box, FormExtendedEvent } from 'grommet'
import RecipientConfigForm, {
    RecipientFormType,
    initialRecipientConfigFormInput,
} from '../forms/RecipientConfigForm'
import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import { ComposerSlotModel } from '@cambrian/app/models/SlotModel'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { SlotTagFormInputType } from '../../general/forms/SlotTagForm'
import SlotTagModal from '../../general/modals/SlotTagModal'
import { Tag } from 'phosphor-react'
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
                    paragraph="Edit the new address for this recipient."
                />
                <Box fill>
                    <RecipientConfigForm
                        recipientTagInput={slotTagInput}
                        setRecipientTagInput={setSlotTagInput}
                        onSubmit={onSubmit}
                        setRecipientInput={setInput}
                        recipientInput={input}
                        submitLabel="Save"
                    />
                </Box>
            </BaseLayerModal>
        </>
    )
}

export default UpdateRecipientModal
