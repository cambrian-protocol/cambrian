import {
    Archive,
    Check,
    Copy,
    DotsThree,
    HandPalm,
    Pen,
    XCircle,
} from 'phosphor-react'
import { Box, Button, DropButton, Spinner, Text } from 'grommet'
import { useEffect, useState } from 'react'

import CeramicTemplateAPI from '@cambrian/app/services/ceramic/CeramicTemplateAPI'
import DropButtonListItem from './DropButtonListItem'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../modals/ErrorPopupModal'
import Link from 'next/link'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import { ProposalInfoType } from './ProposalListItem'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalStatusBadge from '../badges/ProposalStatusBadge'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { cpTheme } from '@cambrian/app/theme/theme'
import { fetchProposalInfo } from '@cambrian/app/utils/helpers/proposalHelper'
import { useRouter } from 'next/router'

interface ReceivedProposalListItemProps {
    currentUser: UserType
    proposal: ProposalModel
    proposalStreamID: string
}

const ReceivedProposalListItem = ({
    currentUser,
    proposal,
    proposalStreamID,
}: ReceivedProposalListItemProps) => {
    const router = useRouter()
    const ceramicTemplateAPI = new CeramicTemplateAPI(currentUser)
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)
    const [isRemoving, setIsRemoving] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [proposalInfo, setProposalInfo] = useState<ProposalInfoType>()

    const isEditable =
        proposalInfo?.status === ProposalStatus.Draft ||
        proposalInfo?.status === ProposalStatus.ChangeRequested ||
        proposalInfo?.status === ProposalStatus.Modified

    const isRemoveable =
        isEditable || proposalInfo?.status === ProposalStatus.Canceled

    const isDeclinable =
        isEditable || proposalInfo?.status === ProposalStatus.OnReview

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
        try {
            setProposalInfo(
                await fetchProposalInfo(currentUser, proposalStreamID)
            )
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
    }

    const onRemove = async (
        proposalStreamID: string,
        type: 'DECLINE' | 'ARCHIVE'
    ) => {
        try {
            setIsRemoving(true)
            await ceramicTemplateAPI.removeReceivedProposal(
                proposalStreamID,
                type
            )
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
                            <Box flex focusIndicator={false}>
                                <Box
                                    direction="row"
                                    wrap="reverse"
                                    align="center"
                                >
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
                            </Box>
                        </Button>
                    </Link>
                </Box>
                <Box direction="row" width={{ min: 'auto' }} justify="end">
                    <DropButton
                        size="small"
                        dropContent={
                            <Box width={'small'}>
                                {proposalInfo &&
                                    proposalInfo.status !==
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
                                {proposalInfo &&
                                    isEditable &&
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
                                {proposalInfo && (
                                    <DropButtonListItem
                                        icon={
                                            isRemoving ? (
                                                <Spinner />
                                            ) : isRemoveable ? (
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
                                        onClick={
                                            isRemoving
                                                ? undefined
                                                : () =>
                                                      onRemove(
                                                          proposalStreamID,
                                                          isDeclinable
                                                              ? 'DECLINE'
                                                              : 'ARCHIVE'
                                                      )
                                        }
                                    />
                                )}
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
