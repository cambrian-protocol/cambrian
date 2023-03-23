import { Box, FormField, Text } from 'grommet'
import React, { useEffect, useState } from 'react'

import { FlexInputFormType } from '@cambrian/app/ui/templates/forms/TemplateFlexInputsForm'
import NumberInput from './NumberInput'
import { parseInputToSeconds } from '@cambrian/app/utils/helpers/timeParsing'

interface ITimeLockInput {
    flexInput: FlexInputFormType
    updateTimeLock: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const TimeLockInput = ({ flexInput, updateTimeLock }: ITimeLockInput) => {
    const [days, setDays] = useState<number | ''>('')
    const [hours, setHours] = useState<number | ''>('')
    const [minutes, setMinutes] = useState<number | ''>('')

    useEffect(() => {
        const totalSeconds = parseInt(flexInput.value)
        const d = Math.floor(totalSeconds / 86400)
        const h = Math.floor((totalSeconds % 86400) / 3600)
        const m = Math.floor((totalSeconds % 3600) / 60)
        setDays(d)
        setHours(h)
        setMinutes(m)
    }, [])

    const handleTimeChange =
        (timeUnit: 'days' | 'hours' | 'minutes') =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const parsedValue = parseInt(e.target.value)
            const updatedValue = isNaN(parsedValue) ? '' : parsedValue

            switch (timeUnit) {
                case 'days':
                    setDays(updatedValue)
                    break
                case 'hours':
                    setHours(updatedValue)
                    break
                case 'minutes':
                    setMinutes(updatedValue)
                    break
            }

            const updatedTime = parseInputToSeconds({
                days,
                hours,
                minutes,
                [timeUnit]: updatedValue,
            })

            return updatedTime.toString()
        }

    const handleInputChange =
        (timeUnit: 'days' | 'hours' | 'minutes') =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const updatedTime = handleTimeChange(timeUnit)(e)
            updateTimeLock({
                ...e,
                target: { ...e.target, value: updatedTime },
            })
        }

    return (
        <Box gap="small">
            <Box direction="row" gap="small" align="center" justify="between">
                <FormField label="Timelock Days">
                    <NumberInput
                        name="timelockDays"
                        value={days}
                        onChange={handleInputChange('days')}
                    />
                </FormField>
                <FormField label="Hours">
                    <NumberInput
                        name="timelockHours"
                        value={hours}
                        onChange={handleInputChange('hours')}
                    />
                </FormField>
                <FormField label="Minutes">
                    <NumberInput
                        name="timelockMinutes"
                        value={minutes}
                        onChange={handleInputChange('minutes')}
                    />
                </FormField>
            </Box>
            {flexInput.description && (
                <Text size="small" color="dark-4">
                    {flexInput.description}
                </Text>
            )}
            {flexInput.instruction && (
                <Text size="small" color="dark-4">
                    {flexInput.instruction}
                </Text>
            )}
        </Box>
    )
}

export default TimeLockInput
