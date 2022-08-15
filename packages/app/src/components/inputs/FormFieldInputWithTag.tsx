import { Box, Text } from 'grommet'

import { Button } from 'grommet'
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
            <Box direction="row" align="end" gap="small">
                <Box flex gap="small">
                    <Text>{label}</Text>
                    {input}
                </Box>
                <Button icon={<Tag />} onClick={toggleShowTagModal} />
            </Box>
            {showTagModal && (
                <SlotTagModal slotId={slotId} onBack={toggleShowTagModal} />
            )}
        </>
    )
}

export default FormFieldInputWithTag
