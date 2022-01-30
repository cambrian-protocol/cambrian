import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    Text,
    TextInput,
} from 'grommet'
import {
    ClipboardText,
    FloppyDisk,
    Scales,
    Shield,
    Timer,
} from 'phosphor-react'
import React, { useEffect, useState } from 'react'

import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import _ from 'lodash'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

type SolverSettingsControlInputType = {
    title: string
    keeperAddress: string
    arbitratorAddress: string
    timelockDays: number
    timelockHours: number
    timelockMinutes: number
}

const initialSolverSettingsInput: SolverSettingsControlInputType = {
    title: '',
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

const SolverSettingsControl = () => {
    const { dispatch, currentSolver } = useComposerContext()

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
                title: currentSolver.title,
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
                title: input.title,
                timelockSeconds: parseInputToSeconds({
                    days: input.timelockDays,
                    hours: input.timelockHours,
                    minutes: input.timelockMinutes,
                }),
            },
        })

        setInitialInput({
            title: input.title,
            keeperAddress: input.keeperAddress,
            arbitratorAddress: input.arbitratorAddress,
            timelockDays: input.timelockDays,
            timelockHours: input.timelockHours,
            timelockMinutes: input.timelockMinutes,
        })
    }

    return (
        <Box gap="small">
            <HeaderTextSection
                title="Solver settings"
                subTitle="Lorem Ipsum"
                paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra."
            />
            <Form<SolverSettingsControlInputType>
                value={input}
                onSubmit={(event) => onSubmit(event)}
                onChange={(nextValue: SolverSettingsControlInputType) => {
                    setInput(nextValue)
                }}
            >
                <FormField
                    label={
                        <Box direction="row" gap="small">
                            <ClipboardText size="24" />
                            <Text>Title</Text>
                        </Box>
                    }
                >
                    <TextInput name="title" />
                </FormField>
                <FormField
                    name="keeperAddress"
                    label={
                        <Box direction="row" gap="small">
                            <Shield size="24" />
                            <Text>Keeper address</Text>
                        </Box>
                    }
                >
                    <TextInput name="keeperAddress" />
                </FormField>
                <FormField
                    label={
                        <Box direction="row" gap="small">
                            <Scales size="24" />
                            <Text>Arbitrator address</Text>
                        </Box>
                    }
                >
                    <TextInput name="arbitratorAddress" />
                </FormField>
                <FormField
                    label={
                        <Box direction="row" gap="small">
                            <Timer size="24" />
                            <Text>Time lock</Text>
                        </Box>
                    }
                >
                    <Box direction="row">
                        <FormField label="Days">
                            <TextInput type="number" name="timelockDays" />
                        </FormField>
                        <FormField label="Hours">
                            <TextInput type="number" name="timelockHours" />
                        </FormField>
                        <FormField label="Minutes">
                            <TextInput type="number" name="timelockMinutes" />
                        </FormField>
                    </Box>
                </FormField>
                <Box flex>
                    <Button
                        disabled={_.isEqual(initialInput, input)}
                        primary
                        type="submit"
                        label={'Save changes'}
                        icon={<FloppyDisk size="24" />}
                    />
                </Box>
            </Form>
        </Box>
    )
}

export default SolverSettingsControl
