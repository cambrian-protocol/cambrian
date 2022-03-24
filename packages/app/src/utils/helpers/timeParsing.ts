import { TimelockFormInputType } from '@cambrian/app/ui/composer/controls/solver/general/forms/SolverSettingsForm'

export const parseInputToSeconds = ({
    days,
    hours,
    minutes,
}: TimelockFormInputType): number => {
    const daysSeconds = days * 60 * 60 * 24
    const hoursSeconds = hours * 60 * 60
    const minutesSeconds = minutes * 60
    return daysSeconds + hoursSeconds + minutesSeconds
}

export const parseSecondsToForm = (
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
