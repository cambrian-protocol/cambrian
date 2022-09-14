import {
    Archive,
    Check,
    Copy,
    DotsThree,
    HandPalm,
    Pen,
    XCircle,
} from 'phosphor-react'
import { Box, DropButton, Text } from 'grommet'
import { useEffect, useState } from 'react'

import DropButtonListItem from './DropButtonListItem'
import Link from 'next/link'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import { ProposalListItemType } from './ProposalListItem'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalStatusBadge from '../badges/ProposalStatusBadge'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useRouter } from 'next/router'

interface ReceivedProposalListItemProps {
    proposal: ProposalListItemType
    onRemove: (
        proposalStreamID: string,
        type: 'DECLINE' | 'ARCHIVE'
    ) => Promise<void>
}

const ReceivedProposalListItem = ({
    proposal,
    onRemove,
}: ReceivedProposalListItemProps) => {
    const router = useRouter()
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)

    const isEditable =
        proposal.status === ProposalStatus.Draft ||
        proposal.status === ProposalStatus.ChangeRequested ||
        proposal.status === ProposalStatus.Modified

    const isRemoveable =
        isEditable || proposal.status === ProposalStatus.Canceled

    const isDeclinable =
        isEditable || proposal.status === ProposalStatus.OnReview

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
                                    isRemoveable ? (
                                        <XCircle
                                            color={
                                                cpTheme.global.colors[
                                                    'status-error'
                                                ]
                                            }
                                        />
                                    ) : isDeclinable ? (
                                        <HandPalm
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
                                label={
                                    isRemoveable
                                        ? 'Remove'
                                        : isDeclinable
                                        ? 'Decline'
                                        : 'Archive'
                                }
                                onClick={() =>
                                    onRemove(
                                        proposal.streamID,
                                        isDeclinable ? 'DECLINE' : 'ARCHIVE'
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

export default ReceivedProposalListItem
