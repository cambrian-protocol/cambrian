import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextInput,
} from 'grommet'
import { useEffect, useState } from 'react'

import BaseModal from '@cambrian/app/components/modals/BaseModal'
import { FloppyDisk } from 'phosphor-react'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

interface SolutionSettingsModalProps {
    onClose: () => void
}

const initalSolutionSettingsInput = {
    collateralToken: '',
}

export type SolutionSettingsFormType = {
    collateralToken: string
}
const SolutionSettingsModal = ({ onClose }: SolutionSettingsModalProps) => {
    const { composer, dispatch } = useComposerContext()

    const [input, setInput] = useState<SolutionSettingsFormType>(
        initalSolutionSettingsInput
    )

    useEffect(() => {
        // Grab collateral token from first solver
        if (composer.solvers[0] !== undefined) {
            setInput({
                collateralToken:
                    composer.solvers[0].config.collateralToken || '',
            })
        }
    }, [])

    // TODO Error handling
    if (composer.solvers[0] === undefined) {
        console.error('No solver/solution found. Create a Solver first!')
        return null
    }

    const onSubmit = (
        event: FormExtendedEvent<SolutionSettingsFormType, Element>
    ) => {
        event.preventDefault()
        dispatch({ type: 'UPDATE_SOLUTION_SETTINGS', payload: input })
        onClose()
    }

    return (
        <BaseModal onClose={onClose}>
            <Box gap="small">
                <HeaderTextSection
                    title="Solution Settings"
                    subTitle="Global settings"
                    paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. "
                />
                <Form<SolutionSettingsFormType>
                    value={input}
                    onSubmit={(event) => onSubmit(event)}
                    onChange={(nextValue: SolutionSettingsFormType) => {
                        setInput(nextValue)
                    }}
                >
                    <FormField label="Collateral token address">
                        <TextInput name="collateralToken" />
                    </FormField>
                    <Box flex>
                        <Button
                            disabled={
                                composer.solvers[0].config.collateralToken ===
                                input.collateralToken
                            }
                            type="submit"
                            primary
                            icon={<FloppyDisk size="24" />}
                            label="Save"
                        />
                    </Box>
                </Form>
            </Box>
        </BaseModal>
    )
}

export default SolutionSettingsModal
