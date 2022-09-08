import {
    Article,
    Check,
    Copy,
    DotsThree,
    Pen,
    Rows,
    Trash,
} from 'phosphor-react'
import { Box, DropButton, Text } from 'grommet'
import { useEffect, useState } from 'react'

import DropButtonListItem from './DropButtonListItem'
import Link from 'next/link'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useRouter } from 'next/router'

interface TemplateListItemProps {
    templateStreamID: string
    template: TemplateModel
    onDelete: (templateID: string, templateStreamID: string) => Promise<void>
}

const TemplateListItem = ({
    template,
    templateStreamID,
    onDelete,
}: TemplateListItemProps) => {
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)
    const router = useRouter()

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
            pad={{
                horizontal: 'medium',
                vertical: 'small',
            }}
            direction="row"
            justify="between"
            align="center"
            round="xsmall"
        >
            <Box direction="row" flex align="center">
                <Link
                    href={`${window.location.origin}/templates/${templateStreamID}`}
                    passHref
                >
                    <Box flex gap="xsmall" focusIndicator={false}>
                        <Box direction="row" gap="small">
                            <Article size="24" />
                            <Text>{template.title}</Text>
                        </Box>
                        <Box direction="row" gap="small" align="center">
                            <Rows
                                size="18"
                                color={cpTheme.global.colors['dark-4']}
                            />
                            <Text size="small" color="dark-4">
                                Received proposals:{' '}
                                {Object.keys(template.receivedProposals).length}
                            </Text>
                        </Box>
                    </Box>
                </Link>
                <Box width={{ min: 'auto' }}>
                    <DropButton
                        size="small"
                        dropContent={
                            <Box width={'small'}>
                                <DropButtonListItem
                                    icon={
                                        isSavedToClipboard ? (
                                            <Check />
                                        ) : (
                                            <Copy />
                                        )
                                    }
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            `${window.location.origin}/templates/${templateStreamID}`
                                        )
                                        setIsSavedToClipboard(true)
                                    }}
                                    label="Copy link"
                                />
                                <DropButtonListItem
                                    icon={<Pen />}
                                    label="Edit"
                                    onClick={() =>
                                        router.push(
                                            `/dashboard/templates/edit/${templateStreamID}`
                                        )
                                    }
                                />
                                <PlainSectionDivider />
                                <DropButtonListItem
                                    icon={
                                        <Trash
                                            color={
                                                cpTheme.global.colors[
                                                    'status-error'
                                                ]
                                            }
                                        />
                                    }
                                    label="Delete"
                                    onClick={() =>
                                        onDelete(
                                            template.title,
                                            templateStreamID
                                        )
                                    }
                                />
                            </Box>
                        }
                        dropAlign={{ top: 'bottom', right: 'right' }}
                        icon={<DotsThree size="24" />}
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default TemplateListItem
