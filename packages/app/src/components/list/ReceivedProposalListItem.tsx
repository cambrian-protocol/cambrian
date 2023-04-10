import { Archive, Check, Copy, DotsThree } from 'phosphor-react'
import { Box, Button, DropButton, Text } from 'grommet'
import { useEffect, useState } from 'react'

import DropButtonListItem from './DropButtonListItem'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../modals/ErrorPopupModal'
import Link from 'next/link'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import ProposalStatusBadge from '../badges/ProposalStatusBadge'
import Template from '@cambrian/app/classes/stages/Template'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface ReceivedProposalListItemProps {
    template: Template
    proposal: Proposal
}

const ReceivedProposalListItem = ({
    template,
    proposal,
}: ReceivedProposalListItemProps) => {
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)
    const [isRemoving, setIsRemoving] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        let intervalId: NodeJS.Timeout
        if (isSavedToClipboard) {
            intervalId = setInterval(() => {
                setIsSavedToClipboard(false)
            }, 2000)
        }
        return () => clearInterval(intervalId)
    }, [isSavedToClipboard])

    const onArchive = async () => {
        try {
            setIsRemoving(true)
            await template.archiveReceivedProposal(proposal.doc.streamID)
        } catch (e) {
            setIsRemoving(false)
            setErrorMessage(await cpLogger.push(e))
        }
    }

    return (
        <>
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
                <Box flex>
                    <Link href={`/solver/${proposal.doc.streamID}`} passHref>
                        <Button>
                            <Box flex focusIndicator={false}>
                                <Box
                                    direction="row"
                                    wrap="reverse"
                                    align="center"
                                >
                                    <Box pad="xsmall">
                                        <Text>{proposal.content.title}</Text>
                                    </Box>
                                    <Box pad="xsmall">
                                        <ProposalStatusBadge
                                            status={proposal.status}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Button>
                    </Link>
                </Box>
                <Box direction="row" width={{ min: 'auto' }} justify="end">
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
                                            `${window.location.origin}/solver/${proposal.doc.streamID}`
                                        )
                                        setIsSavedToClipboard(true)
                                    }}
                                    label="Copy link"
                                />
                                <PlainSectionDivider />
                                <DropButtonListItem
                                    disabled={isRemoving}
                                    icon={<Archive />}
                                    label={'Archive'}
                                    onClick={onArchive}
                                />
                            </Box>
                        }
                        dropAlign={{ top: 'bottom', right: 'right' }}
                        icon={<DotsThree size="24" />}
                    />
                </Box>
            </Box>
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default ReceivedProposalListItem
