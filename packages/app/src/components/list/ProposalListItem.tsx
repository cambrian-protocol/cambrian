import {
    Archive,
    Check,
    Copy,
    DotsThree,
    File,
    Pen,
    Trash,
} from 'phosphor-react'
import { Box, DropButton, Text } from 'grommet'
import { useEffect, useState } from 'react'

import DropButtonListItem from './DropButtonListItem'
import Link from 'next/link'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalStatusBadge from '../badges/ProposalStatusBadge'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useRouter } from 'next/router'

interface ProposalListItemProps {
    proposal: ProposalListItemType
    onRemove: (proposalTag: string, type: 'DELETE' | 'ARCHIVE') => Promise<void>
}

export type ProposalListItemType = {
    streamID: string
    status: ProposalStatus
    title: string
    isAuthor: boolean
    templateTitle: string
}

const ProposalListItem = ({ proposal, onRemove }: ProposalListItemProps) => {
    const router = useRouter()
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)

    const isEditable =
        proposal.status === ProposalStatus.Draft ||
        proposal.status === ProposalStatus.ChangeRequested ||
        proposal.status === ProposalStatus.Modified

    const isDeletable =
        isEditable ||
        proposal.status === ProposalStatus.OnReview ||
        proposal.status === ProposalStatus.Canceled

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
                horizontal: 'small',
                vertical: 'small',
            }}
            direction="row"
            justify="between"
            align="center"
            round="xsmall"
        >
            <Link
                href={
                    isEditable && proposal.isAuthor
                        ? `/dashboard/proposals/edit/${proposal.streamID}`
                        : `/proposals/${proposal.streamID}`
                }
                passHref
            >
                <Box flex focusIndicator={false}>
                    <Box direction="row" wrap="reverse" align="center">
                        <Box pad="xsmall">
                            <Text>{proposal.title}</Text>
                        </Box>
                        <Box pad="xsmall">
                            <ProposalStatusBadge status={proposal.status} />
                        </Box>
                    </Box>
                    <Box direction="row" gap="small" pad="xsmall" wrap>
                        <Box direction="row" align="center" gap="xsmall">
                            <File color={cpTheme.global.colors['dark-4']} />
                            <Text size="small" color="dark-4">
                                {proposal.templateTitle}
                            </Text>
                        </Box>
                    </Box>
                </Box>
            </Link>
            <Box direction="row" width={{ min: 'auto' }} justify="end">
                <DropButton
                    size="small"
                    dropContent={
                        <Box width={'small'}>
                            {proposal.status !== ProposalStatus.Draft && (
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
                                            `${window.location.origin}/proposals/${proposal.streamID}`
                                        )
                                        setIsSavedToClipboard(true)
                                    }}
                                    label="Copy link"
                                />
                            )}
                            {isEditable && proposal.isAuthor && (
                                <DropButtonListItem
                                    icon={<Pen />}
                                    label="Edit"
                                    onClick={() =>
                                        router.push(
                                            `/dashboard/proposals/edit/${proposal.streamID}`
                                        )
                                    }
                                />
                            )}
                            <PlainSectionDivider />
                            <DropButtonListItem
                                icon={
                                    isDeletable ? (
                                        <Trash
                                            color={
                                                cpTheme.global.colors[
                                                    'status-error'
                                                ]
                                            }
                                        />
                                    ) : (
                                        <Archive />
                                    )
                                }
                                label={isDeletable ? 'Delete' : 'Archive'}
                                onClick={() =>
                                    onRemove(
                                        proposal.title,
                                        isDeletable ? 'DELETE' : 'ARCHIVE'
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
    )
}

export default ProposalListItem
