import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextInput,
} from 'grommet'
import { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import FormFieldInputWithTag from '@cambrian/app/components/inputs/FormFieldInputWithTag'
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

    // TODO saving collateral Token must be possible without having to select a solver
    return (
        <>
            <HeaderTextSection
                title="Solution Settings"
                subTitle="Global settings"
                paragraph="These settings are universal between Solvers."
            />
            <Form<SolutionConfigFormType>
                value={input}
                onSubmit={(event) => onSubmit(event)}
                onChange={(nextValue: SolutionConfigFormType) => {
                    setInput(nextValue)
                }}
            >
                <BaseFormContainer>
                    <FormFieldInputWithTag
                        slotId="collateralToken"
                        label="Collateral token address"
                        input={<TextInput name="collateralToken" />}
                    />
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
                </BaseFormContainer>
            </Form>
        </>
    )
}

export default SolutionConfig
