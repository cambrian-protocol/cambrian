import { Check, Copy } from 'phosphor-react'
import { useEffect, useState } from 'react'

import { Button } from 'grommet'

interface ClipboardButtonProps {
    value: string
}

const ClipboardButton = ({ value }: ClipboardButtonProps) => {
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
            icon={isSavedToClipboard ? <Check /> : <Copy />}
            onClick={() => {
                navigator.clipboard.writeText(value)
                setIsSavedToClipboard(true)
            }}
        />
    )
}

export default ClipboardButton
