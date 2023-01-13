import {
    Archive,
    Check,
    Copy,
    DotsThree,
    File,
    Pen,
    XCircle,
} from 'phosphor-react'
import { Box, Button, DropButton, Spinner, Text } from 'grommet'
import { useEffect, useState } from 'react'

import BaseSkeletonBox from '../skeletons/BaseSkeletonBox'
import CeramicProposalAPI from '@cambrian/app/services/ceramic/CeramicProposalAPI'
import DropButtonListItem from './DropButtonListItem'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../modals/ErrorPopupModal'
import Link from 'next/link'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalStatusBadge from '../badges/ProposalStatusBadge'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { cpTheme } from '@cambrian/app/theme/theme'
import { fetchProposalInfo } from '@cambrian/app/utils/helpers/proposalHelper'
import { useRouter } from 'next/router'

interface ProposalListItemProps {
    proposal: ProposalModel
    proposalStreamID: string
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
    proposal,
    proposalStreamID,
    currentUser,
}: ProposalListItemProps) => {
    const router = useRouter()
    const ceramicProposalAPI = new CeramicProposalAPI(currentUser)
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)
    const [isRemoving, setIsRemoving] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [proposalInfo, setProposalInfo] = useState<ProposalInfoType>()

    const isEditable =
        proposalInfo?.status === ProposalStatus.Draft ||
        proposalInfo?.status === ProposalStatus.ChangeRequested ||
        proposalInfo?.status === ProposalStatus.Modified

    const isDeletable =
        isEditable ||
        proposalInfo?.status === ProposalStatus.OnReview ||
        proposalInfo?.status === ProposalStatus.Canceled

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
        setProposalInfo(await fetchProposalInfo(currentUser, proposalStreamID))
    }

    const onRemove = async (
        proposalStreamID: string,
        type: 'CANCEL' | 'ARCHIVE'
    ) => {
        try {
            setIsRemoving(true)
            await ceramicProposalAPI.removeProposal(proposalStreamID, type)
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
                    <Link
                        href={
                            proposalInfo
                                ? isEditable &&
                                  proposal.author === currentUser.did
                                    ? `/proposal/edit/${proposalStreamID}`
                                    : `/solver/${proposalStreamID}`
                                : ''
                        }
                        passHref
                    >
                        <Button>
                            <Box direction="row" wrap="reverse" align="center">
                                <Box pad="xsmall">
                                    <Text>{proposal.title}</Text>
                                </Box>
                                <Box pad="xsmall">
                                    <ProposalStatusBadge
                                        status={proposalInfo?.status}
                                        onChainProposalId={
                                            proposalInfo?.onChainProposalId
                                        }
                                    />
                                </Box>
                            </Box>
                            <Box direction="row" align="center" gap="xsmall">
                                {proposalInfo ? (
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
                                            {proposalInfo.template.title}
                                        </Text>
                                    </Box>
                                ) : (
                                    <BaseSkeletonBox
                                        height={'2em'}
                                        width={'small'}
                                    />
                                )}
                            </Box>
                        </Button>
                    </Link>
                </Box>
                <Box width={{ min: 'auto' }} justify="end">
                    <DropButton
                        size="small"
                        dropContent={
                            <Box width={'small'}>
                                {proposalInfo?.status !==
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
                                                `${window.location.origin}/solver/${proposalStreamID}`
                                            )
                                            setIsSavedToClipboard(true)
                                        }}
                                        label="Copy link"
                                    />
                                )}
                                {isEditable &&
                                    proposal.author === currentUser.did && (
                                        <DropButtonListItem
                                            icon={<Pen />}
                                            label="Edit"
                                            onClick={() =>
                                                router.push(
                                                    `/proposal/edit/${proposalStreamID}`
                                                )
                                            }
                                        />
                                    )}
                                <PlainSectionDivider />
                                <DropButtonListItem
                                    icon={
                                        isRemoving ? (
                                            <Spinner />
                                        ) : isDeletable ? (
                                            <XCircle
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
                                    label={isDeletable ? 'Cancel' : 'Archive'}
                                    onClick={
                                        isRemoving
                                            ? undefined
                                            : () =>
                                                  onRemove(
                                                      proposalStreamID,
                                                      isDeletable
                                                          ? 'CANCEL'
                                                          : 'ARCHIVE'
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
