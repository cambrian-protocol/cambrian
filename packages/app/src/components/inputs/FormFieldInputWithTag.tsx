import { Box } from 'grommet'
import { Button } from 'grommet'
import { FormField } from 'grommet'
import { SlotTagFormInputType } from '@cambrian/app/ui/composer/controls/solver/general/forms/SlotTagForm'
import SlotTagModal from '@cambrian/app/ui/composer/controls/solver/general/modals/SlotTagModal'
import { Tag } from 'phosphor-react'
import { initialSlotTagInput } from '@cambrian/app/ui/composer/controls/solver/slotList/modals/CreateSlotModal'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

interface FormFieldInputWithTagProps {
    label: string
    input: JSX.Element
    slotId: string
}

const FormFieldInputWithTag = ({
    label,
    input,
    slotId,
}: FormFieldInputWithTagProps) => {
    const { currentSolver, dispatch } = useComposerContext()

    if (!currentSolver) throw new Error('No current Solver defined!')

    const [showTagModal, setShowTagModal] = useState(false)
    const toggleShowTagModal = () => setShowTagModal(!showTagModal)

    const [slotTagInput, setSlotTagInput] = useState<SlotTagFormInputType>(
        currentSolver.slotTags[slotId] || initialSlotTagInput
    )

    const onSubmitTag = (slotTag: SlotTagFormInputType) => {
        dispatch({
            type: 'UPDATE_SLOT_TAG',
            payload: { slotIdToUpdate: slotId, slotTag: slotTag },
        })
        setSlotTagInput(slotTag)
        console.log(currentSolver)
    }

    return (
        <>
            <Box direction="row" align="center">
                <Box flex>
                    <FormField label={label}>{input}</FormField>
                </Box>
                <Box basis="1/5" pad={'xsmall'}>
                    <Button
                        icon={<Tag size="24" />}
                        onClick={toggleShowTagModal}
                    />
                </Box>
            </Box>
            {showTagModal && (
                <SlotTagModal
                    slotTagInput={slotTagInput}
                    onSubmit={onSubmitTag}
                    onBack={toggleShowTagModal}
                />
            )}
        </>
    )
}

export default FormFieldInputWithTag
