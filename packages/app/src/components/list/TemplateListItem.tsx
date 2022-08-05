import { Box, Button, Text } from 'grommet'
import { Check, Copy, Eye, Pen, Trash } from 'phosphor-react'
import { useEffect, useState } from 'react'

import Link from 'next/link'

interface TemplateListItemProps {
    templateID: string
    templateStreamID: string
    onDelete?: (templateID: string) => Promise<void>
}

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
            wrap
        >
            <Text>{templateID}</Text>
            <Box
                direction="row"
                justify="end"
                flex
                width={{ min: 'auto' }}
                gap="small"
            >
                <Link
                    href={`${window.location.origin}/dashboard/templates/edit/${templateStreamID}`}
                    passHref
                >
                    <Button icon={<Pen />} />
                </Link>
                <Link
                    href={`${window.location.origin}/templates/${templateStreamID}`}
                    passHref
                >
                    <Button icon={<Eye />} />
                </Link>
                {onDelete && (
                    <Button
                        icon={<Trash />}
                        onClick={() => {
                            if (
                                window.confirm(
                                    'Warning! Are you sure you want to delete this Template? Please make sure this Template has no received Proposals.'
                                )
                            )
                                onDelete(templateID)
                        }}
                    />
                )}
                <Button
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
