import { Box } from 'grommet'
import { Button } from 'grommet'
import { FormField } from 'grommet'
import SlotTagModal from '@cambrian/app/ui/composer/controls/solver/general/modals/SlotTagModal'
import { Tag } from 'phosphor-react'
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
    const [showTagModal, setShowTagModal] = useState(false)
    const toggleShowTagModal = () => setShowTagModal(!showTagModal)

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
                <SlotTagModal slotId={slotId} onBack={toggleShowTagModal} />
            )}
        </>
    )
}

export default FormFieldInputWithTag
