import { Box, Button, Form, FormExtendedEvent, FormField } from 'grommet'
import SelectRecipient, {
    SelectRecipientType,
} from '@cambrian/app/components/selects/SelectRecipient'

import { FloppyDisk } from 'phosphor-react'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'
import { useState } from 'react'

type SelectRecipientFormProps = {
    onClose: () => void
}

const SelectRecipientForm = ({ onClose }: SelectRecipientFormProps) => {
    const { dispatch } = useComposerContext()

    const [selectedRecipient, setSelectedRecipient] =
        useState<SelectRecipientType>({
            title: '',
        })

    const onSubmit = (event: FormExtendedEvent<{}, Element>) => {
        event.preventDefault()
        if (selectedRecipient.address !== undefined) {
            dispatch({
                type: 'ADD_RECIPIENT',
                payload: selectedRecipient.address,
            })
        }
        onClose()
    }

    return (
        <Box gap="small">
            <HeaderTextSection
                title="Select recipient"
                subTitle="Choose an existant address from your solution"
                paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis."
            />
            <Form onSubmit={(event) => onSubmit(event)}>
                <FormField>
                    <SelectRecipient
                        selectedRecipient={selectedRecipient}
                        setSelectedRecipient={setSelectedRecipient}
                    />
                </FormField>
                <Box>
                    <Button
                        primary
                        type="submit"
                        label="Save"
                        icon={<FloppyDisk size="24" />}
                    />
                </Box>
            </Form>
        </Box>
    )
}

export default SelectRecipientForm
