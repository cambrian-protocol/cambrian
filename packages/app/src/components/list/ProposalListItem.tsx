import { Box, Button, Text } from 'grommet'
import { Check, Copy, Eye, Pen, Trash } from 'phosphor-react'
import { useEffect, useState } from 'react'

import Link from 'next/link'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalStatusBadge from '../badges/ProposalStatusBadge'

interface ProposalListItemProps {
    proposal: ProposalListItemType
    onDelete?: (proposalID: string) => Promise<void>
}

export type ProposalListItemType = {
    streamID: string
    status: ProposalStatus
    title: string
    isAuthor: boolean
}

const ProposalListItem = ({ proposal, onDelete }: ProposalListItemProps) => {
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

    const isEditable =
        proposal.status === ProposalStatus.Draft ||
        proposal.status === ProposalStatus.ChangeRequested ||
        proposal.status === ProposalStatus.Modified

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
            wrap
        >
            <Box direction="row" wrap="reverse" align="center">
                <Box pad="xsmall">
                    <Text>{proposal.title}</Text>
                </Box>
                <Box pad="xsmall">
                    <ProposalStatusBadge status={proposal.status} />
                </Box>
            </Box>
            <Box direction="row" flex width={{ min: 'auto' }} justify="end">
                {isEditable && proposal.isAuthor && (
                    <Link
                        href={`/dashboard/proposals/edit/${proposal.streamID}`}
                        passHref
                    >
                        <Button icon={<Pen />} />
                    </Link>
                )}
                {proposal.status !== ProposalStatus.Draft && (
                    <Link href={`/proposals/${proposal.streamID}`} passHref>
                        <Button icon={<Eye />} />
                    </Link>
                )}
                {onDelete && proposal.status === ProposalStatus.Draft && (
                    <Button
                        icon={<Trash />}
                        onClick={() => onDelete(proposal.title)}
                    />
                )}
                <Button
                    tip={{
                        content: 'Copy link to clipboard',
                        dropProps: { align: { left: 'right' } },
                    }}
                    icon={isSavedToClipboard ? <Check /> : <Copy />}
                    onClick={() => {
                        navigator.clipboard.writeText(
                            `${window.location.origin}/proposals/${proposal.streamID}`
                        )
                        setIsSavedToClipboard(true)
                    }}
                />
            </Box>
        </Box>
    )
}

export default ProposalListItem
