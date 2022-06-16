import {
    parseInputToSeconds,
    parseSecondsToForm,
} from '@cambrian/app/utils/helpers/timeParsing'
import { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { Box } from 'grommet'
import { Button } from 'grommet'
import ComposerSolver from '@cambrian/app/classes/ComposerSolver'
import { Form } from 'grommet'
import { FormExtendedEvent } from 'grommet'
import { FormField } from 'grommet'
import FormFieldInputWithTag from '@cambrian/app/components/inputs/FormFieldInputWithTag'
import { TextInput } from 'grommet'
import _ from 'lodash'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

interface SolverSettingsFormProps {
    solver: ComposerSolver
    onClose: () => void
}

type SolverSettingsFormType = {
    keeperAddress: string
    arbitratorAddress: string
    timelockDays: number
    timelockHours: number
    timelockMinutes: number
}

const initialSolverSettingsInput: SolverSettingsFormType = {
    keeperAddress: '',
    arbitratorAddress: '',
    timelockDays: 0,
    timelockHours: 0,
    timelockMinutes: 0,
}

export interface TimelockFormInputType {
    days: number
    hours: number
    minutes: number
}

const SolverSettingsForm = ({ solver, onClose }: SolverSettingsFormProps) => {
    const { dispatch } = useComposerContext()

    const [input, setInput] = useState<SolverSettingsFormType>(
        initialSolverSettingsInput
    )

    // Init
    useEffect(() => {
        const parsedSeconds = solver.config.timelockSeconds
            ? parseSecondsToForm(solver.config.timelockSeconds)
            : { weeks: 0, days: 0, hours: 0, minutes: 0 }
        setInput({
            keeperAddress: solver.config.keeperAddress,
            arbitratorAddress: solver.config.arbitratorAddress,
            timelockDays: parsedSeconds.days,
            timelockHours: parsedSeconds.hours,
            timelockMinutes: parsedSeconds.minutes,
        })
    }, [])

    const onSubmit = (
        event: FormExtendedEvent<SolverSettingsFormType, Element>
    ) => {
        event.preventDefault()
        dispatch({
            type: 'UPDATE_SOLVER_MAIN_CONFIG',
            payload: {
                arbitratorAddress: input.arbitratorAddress,
                keeperAddress: input.keeperAddress,
                timelockSeconds: parseInputToSeconds({
                    days: input.timelockDays,
                    hours: input.timelockHours,
                    minutes: input.timelockMinutes,
                }),
            },
        })

        setInput({
            keeperAddress: input.keeperAddress,
            arbitratorAddress: input.arbitratorAddress,
            timelockDays: input.timelockDays,
            timelockHours: input.timelockHours,
            timelockMinutes: input.timelockMinutes,
        })

        onClose()
    }

    // TODO Implementation Contract Select, move Core Settings here
    return (
        <Form<SolverSettingsFormType>
            value={input}
            onSubmit={(event) => onSubmit(event)}
            onChange={(nextValue: SolverSettingsFormType) => {
                setInput(nextValue)
            }}
        >
            <BaseFormContainer>
                <BaseFormGroupContainer>
                    <FormFieldInputWithTag
                        slotId="keeper"
                        label="Keeper Address"
                        input={<TextInput name="keeperAddress" />}
                    />
                    <FormFieldInputWithTag
                        slotId="arbitrator"
                        label="Arbitrator Address"
                        input={<TextInput name="arbitratorAddress" />}
                    />
                </BaseFormGroupContainer>
                <BaseFormGroupContainer>
                    <FormFieldInputWithTag
                        slotId="timelockSeconds"
                        label="Timelock"
                        input={
                            <Box direction="row">
                                <FormField label="Days">
                                    <TextInput
                                        type="number"
                                        name="timelockDays"
                                    />
                                </FormField>
                                <FormField label="Hours">
                                    <TextInput
                                        type="number"
                                        name="timelockHours"
                                    />
                                </FormField>
                                <FormField label="Minutes">
                                    <TextInput
                                        type="number"
                                        name="timelockMinutes"
                                    />
                                </FormField>
                            </Box>
                        }
                    />
                </BaseFormGroupContainer>
                <Button primary type="submit" label={'Save settings'} />
            </BaseFormContainer>
        </Form>
    )
}

export default SolverSettingsForm
