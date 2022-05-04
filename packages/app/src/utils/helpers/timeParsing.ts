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

export const parseSecondsToDisplay = (seconds: number): string => {
    const parsedSeconds = parseSecondsToForm(seconds)

    let timelockDisplay = ''

    if (parsedSeconds.days > 0)
        timelockDisplay += `${parsedSeconds.days} Day${
            parsedSeconds.days > 1 ? 's' : ''
        } `
    if (parsedSeconds.hours > 0)
        timelockDisplay += `${parsedSeconds.hours} Hour${
            parsedSeconds.hours > 1 ? 's' : ''
        } `
    if (parsedSeconds.minutes > 0)
        timelockDisplay += `${parsedSeconds.minutes} Minute${
            parsedSeconds.minutes > 1 ? 's' : ''
        } `

    if (timelockDisplay === '') {
        return 'No timelock set'
    } else {
        return timelockDisplay
    }
}
