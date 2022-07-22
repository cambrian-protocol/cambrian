import { Anchor, Box, Button, Text } from 'grommet'
import { Check, Copy, Eye, Pen, Trash } from 'phosphor-react'
import { useEffect, useState } from 'react'

interface TemplateListItemProps {
    templateID: string
    templateStreamID: string
    onDelete: (templateID: string) => Promise<void>
}

// TODO Styling
const TemplateListItem = ({
    templateID,
    templateStreamID,
    onDelete,
}: TemplateListItemProps) => {
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
        <Box
            border
            flex
            height={{ min: 'auto' }}
            pad={{
                horizontal: 'medium',
                vertical: 'small',
            }}
            direction="row"
            justify="between"
            align="center"
            round="xsmall"
        >
            <Text>{templateID}</Text>
            <Box direction="row">
                <Anchor
                    href={`${window.location.origin}/dashboard/templates/edit/${templateStreamID}`}
                >
                    <Button icon={<Pen />} />
                </Anchor>
                <Anchor
                    href={`${window.location.origin}/templates/${templateStreamID}`}
                >
                    <Button icon={<Eye />} />
                </Anchor>
                <Button icon={<Trash />} onClick={() => onDelete(templateID)} />
                <Button
                    tip={{
                        content: 'Copy link to clipboard',
                        dropProps: { align: { left: 'right' } },
                    }}
                    icon={isSavedToClipboard ? <Check /> : <Copy />}
                    onClick={() => {
                        navigator.clipboard.writeText(
                            `${window.location.origin}/templates/${templateStreamID}`
                        )
                        setIsSavedToClipboard(true)
                    }}
                />
            </Box>
        </Box>
    )
}

export default TemplateListItem
