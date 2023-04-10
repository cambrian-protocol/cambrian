import { Archive, Check, Copy, DotsThree, File, Pen } from 'phosphor-react'
import { Box, Button, DropButton, Spinner, Text } from 'grommet'
import { useEffect, useState } from 'react'

import BaseSkeletonBox from '../skeletons/BaseSkeletonBox'
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import DropButtonListItem from './DropButtonListItem'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../modals/ErrorPopupModal'
import Link from 'next/link'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalService from '@cambrian/app/services/stages/ProposalService'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalStatusBadge from '../badges/ProposalStatusBadge'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplateService from '@cambrian/app/services/stages/TemplateService'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useRouter } from 'next/router'

interface ProposalListItemProps {
    proposalDoc: DocumentModel<ProposalModel>
    currentUser: UserType
}

export type ProposalListItemType = {
    streamID: string
    status: ProposalStatus
    title: string
    isAuthor: boolean
    templateTitle: string
}

export type ProposalInfoType = {
    title: string
    status: ProposalStatus
    template: TemplateModel
    onChainProposalId?: string
}

const ProposalListItem = ({
    proposalDoc,
    currentUser,
}: ProposalListItemProps) => {
    const router = useRouter()
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)
    const [isRemoving, setIsRemoving] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [proposal, setProposal] = useState<Proposal>()
    const [isEditable, setIsEditable] = useState<boolean>()

    useEffect(() => {
        fetchInfo()
    }, [])

    useEffect(() => {
        let intervalId: NodeJS.Timeout
        if (isSavedToClipboard) {
            intervalId = setInterval(() => {
                setIsSavedToClipboard(false)
            }, 2000)
        }
        return () => clearInterval(intervalId)
    }, [isSavedToClipboard])

    const fetchInfo = async () => {
        const proposalService = new ProposalService()
        const proposalConfig = await proposalService.fetchProposalConfig(
            proposalDoc,
            currentUser
        )
        if (!proposalConfig) throw new Error('Failed to load Proposal Config')

        const _proposal = new Proposal(
            proposalConfig,
            new ProposalService(),
            new TemplateService(),
            () => {},
            currentUser
        )
        setIsEditable(
            _proposal.status === ProposalStatus.Draft ||
                _proposal.status === ProposalStatus.ChangeRequested ||
                _proposal.status === ProposalStatus.Modified
        )
        setProposal(_proposal)
    }

    const onArchiveProposal = async () => {
        if (proposal) {
            try {
                setIsRemoving(true)
                await proposal?.archive()
            } catch (e) {
                setIsRemoving(false)
                setErrorMessage(await cpLogger.push(e))
            }
        }
    }

    return (
        <>
            {proposal ? (
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
                        <Link
                            href={
                                isEditable && proposal.isProposalAuthor
                                    ? `/proposal/edit/${proposal.doc.streamID}`
                                    : `/solver/${proposal.doc.streamID}`
                            }
                            passHref
                        >
                            <Button>
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
                                            onChainProposalId={
                                                proposal.onChainProposal?.id
                                            }
                                        />
                                    </Box>
                                </Box>
                                <Box
                                    direction="row"
                                    align="center"
                                    gap="xsmall"
                                >
                                    <Box
                                        height="2em"
                                        direction="row"
                                        gap="xsmall"
                                        align="center"
                                    >
                                        <File
                                            color={
                                                cpTheme.global.colors['dark-4']
                                            }
                                        />
                                        <Text size="small" color="dark-4">
                                            {proposal.template.content.title}
                                        </Text>
                                    </Box>
                                </Box>
                            </Button>
                        </Link>
                    </Box>
                    <Box width={{ min: 'auto' }} justify="end">
                        <DropButton
                            size="small"
                            dropContent={
                                <Box width={'small'}>
                                    {proposal.status !==
                                        ProposalStatus.Draft && (
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
                                    )}
                                    {isEditable &&
                                        proposal.isProposalAuthor && (
                                            <DropButtonListItem
                                                icon={<Pen />}
                                                label="Edit"
                                                onClick={() =>
                                                    router.push(
                                                        `/proposal/edit/${proposal.doc.streamID}`
                                                    )
                                                }
                                            />
                                        )}
                                    <PlainSectionDivider />
                                    <DropButtonListItem
                                        icon={
                                            isRemoving ? (
                                                <Spinner />
                                            ) : (
                                                <Archive />
                                            )
                                        }
                                        label={'Archive'}
                                        onClick={
                                            isRemoving
                                                ? undefined
                                                : () => onArchiveProposal()
                                        }
                                    />
                                </Box>
                            }
                            dropAlign={{ top: 'bottom', right: 'right' }}
                            icon={<DotsThree size="24" />}
                        />
                    </Box>
                </Box>
            ) : (
                <BaseSkeletonBox width={'100%'} height="xsmall" />
            )}
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default ProposalListItem
