import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextInput,
} from 'grommet'
import React, { useEffect, useState } from 'react'

import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import FormFieldInputWithTag from '@cambrian/app/components/inputs/FormFieldInputWithTag'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import SolverTagModal from './modals/SolverTagModal'
import { Tag } from 'phosphor-react'
import _ from 'lodash'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

type SolverSettingsControlInputType = {
    keeperAddress: string
    arbitratorAddress: string
    timelockDays: number
    timelockHours: number
    timelockMinutes: number
}

const initialSolverSettingsInput: SolverSettingsControlInputType = {
    keeperAddress: '',
    arbitratorAddress: '',
    timelockDays: 0,
    timelockHours: 0,
    timelockMinutes: 0,
}
interface TimelockInputType {
    days: number
    hours: number
    minutes: number
}
const parseInputToSeconds = ({
    days,
    hours,
    minutes,
}: TimelockInputType): number => {
    const daysSeconds = days * 60 * 60 * 24
    const hoursSeconds = hours * 60 * 60
    const minutesSeconds = minutes * 60
    return daysSeconds + hoursSeconds + minutesSeconds
}

const parseSecondsToForm = (
    secondsToParse: number
): { days: number; hours: number; minutes: number } => {
    const day = parseInt(secondsToParse / (24 * 3600) + '')

    secondsToParse = secondsToParse % (24 * 3600)
    const hour = parseInt(secondsToParse / 3600 + '')

    secondsToParse %= 3600
    const minutes = parseInt((secondsToParse / 60).toFixed())

    return {
        days: day,
        hours: hour,
        minutes: minutes,
    }
}

const ComposerSolverSettingsControl = () => {
    const { dispatch, currentSolver } = useComposerContext()

    const [showSolverTagModal, setShowSolverTagModal] = useState(false)

    const toggleShowSolverTagModal = () =>
        setShowSolverTagModal(!showSolverTagModal)

    const [initialInput, setInitialInput] =
        useState<SolverSettingsControlInputType>(initialSolverSettingsInput)
    const [input, setInput] = useState<SolverSettingsControlInputType>(
        initialSolverSettingsInput
    )

    useEffect(() => {
        // Init
        if (currentSolver !== undefined) {
            const parsedSeconds = currentSolver.config.timelockSeconds
                ? parseSecondsToForm(currentSolver.config.timelockSeconds)
                : { weeks: 0, days: 0, hours: 0, minutes: 0 }
            const loadedInput = {
                keeperAddress: currentSolver.config.keeperAddress.address,
                arbitratorAddress:
                    currentSolver.config.arbitratorAddress.address,
                timelockDays: parsedSeconds.days,
                timelockHours: parsedSeconds.hours,
                timelockMinutes: parsedSeconds.minutes,
            }

            setInitialInput(loadedInput)
            setInput(loadedInput)
        }
    }, [currentSolver])

    const onSubmit = (
        event: FormExtendedEvent<SolverSettingsControlInputType>
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

        setInitialInput({
            keeperAddress: input.keeperAddress,
            arbitratorAddress: input.arbitratorAddress,
            timelockDays: input.timelockDays,
            timelockHours: input.timelockHours,
            timelockMinutes: input.timelockMinutes,
        })
    }

    if (!currentSolver) throw Error('No current Solver defined!')

    return (
        <>
            <Box gap="small" overflow={{ vertical: 'auto' }}>
                <HeaderTextSection
                    title="Solver settings"
                    subTitle="Lorem Ipsum"
                    paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra."
                />
                <BaseMenuListItem
                    title="Solver Tag"
                    icon={<Tag />}
                    onClick={toggleShowSolverTagModal}
                />
                <HeaderTextSection paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra." />
                <Form<SolverSettingsControlInputType>
                    value={input}
                    onSubmit={(event) => onSubmit(event)}
                    onChange={(nextValue: SolverSettingsControlInputType) => {
                        setInput(nextValue)
                    }}
                >
                    <FormFieldInputWithTag
                        slotId="keeperAddress"
                        label="Keeper"
                        input={<TextInput name="keeperAddress" />}
                    />
                    <FormFieldInputWithTag
                        slotId="arbitratorAddress"
                        label="Arbitrator"
                        input={<TextInput name="arbitratorAddress" />}
                    />
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
                    <Box flex>
                        <Button
                            disabled={_.isEqual(initialInput, input)}
                            primary
                            type="submit"
                            label={'Save'}
                        />
                    </Box>
                </Form>
            </Box>
            {showSolverTagModal && (
                <SolverTagModal
                    onBack={toggleShowSolverTagModal}
                    currentSolverTag={currentSolver.solverTag}
                />
            )}
        </>
    )
}

export default ComposerSolverSettingsControl
