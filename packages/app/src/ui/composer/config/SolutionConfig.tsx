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

const initalSolutionConfigInput = {
    collateralToken: '',
}

export type SolutionConfigFormType = {
    collateralToken: string
}
const SolutionConfig = () => {
    const { composer, dispatch } = useComposerContext()

    const [input, setInput] = useState<SolutionConfigFormType>(
        initalSolutionConfigInput
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
        event: FormExtendedEvent<SolutionConfigFormType, Element>
    ) => {
        event.preventDefault()
        dispatch({ type: 'UPDATE_SOLUTION_SETTINGS', payload: input })
    }

    return (
        <Box gap="small">
            <HeaderTextSection
                title="Solution Settings"
                subTitle="Global settings"
                paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. "
            />
            <Form<SolutionConfigFormType>
                value={input}
                onSubmit={(event) => onSubmit(event)}
                onChange={(nextValue: SolutionConfigFormType) => {
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
                        label="Save"
                    />
                </Box>
            </Form>
        </Box>
    )
}

export default SolutionConfig
