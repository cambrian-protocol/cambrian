import { Button, ButtonExtendedProps } from 'grommet'
import { Check, Copy } from 'phosphor-react'
import { useEffect, useState } from 'react'

import { cpTheme } from '@cambrian/app/theme/theme'

export type ClipboardButtonProps = ButtonExtendedProps & {
    value: string
}

const ClipboardButton = ({ value, ...rest }: ClipboardButtonProps) => {
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)

    useEffect(() => {
        let intervalId: NodeJS.Timeout
        if (isSavedToClipboard) {
            intervalId = setInterval(() => {
                setIsSavedToClipboard(false)
            }, 2000)
        }
        return () => clearInterval(intervalId)
    }, [isSavedToClipboard])

    return (
        <Button
            {...rest}
            icon={
                isSavedToClipboard ? (
                    <Check color={cpTheme.global.colors['dark-4']} />
                ) : (
                    <Copy color={cpTheme.global.colors['dark-4']} />
                )
            }
            onClick={() => {
                navigator.clipboard.writeText(value)
                setIsSavedToClipboard(true)
            }}
        />
    )
}

export default ClipboardButton
