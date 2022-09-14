import {
    AccordionPanel,
    Box,
    Button,
    ResponsiveContext,
    Spinner,
    Text,
} from 'grommet'
import {
    Archive,
    Check,
    CheckCircle,
    Copy,
    Eye,
    PauseCircle,
    Pen,
} from 'phosphor-react'
import { useEffect, useState } from 'react'

import CeramicTemplateAPI from '@cambrian/app/services/ceramic/CeramicTemplateAPI'
import ListSkeleton from '../skeletons/ListSkeleton'
import LoaderButton from '../buttons/LoaderButton'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import { ProposalListItemType } from './ProposalListItem'
import ReceivedProposalListItem from './ReceivedProposalListItem'
import ResponsiveLinkButton from '../buttons/ResponsiveLinkButton'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpTheme } from '@cambrian/app/theme/theme'
import { getProposalListItem } from '@cambrian/app/utils/helpers/proposalHelper'

interface TemplateListItemProps {
    currentUser: UserType
    templateStreamID: string
    template: TemplateModel
    onArchive: (templateID: string, templateStreamID: string) => Promise<void>
    receivedProposalsArchive?: StringHashmap
}

const TemplateListItem = ({
    currentUser,
    template,
    templateStreamID,
    onArchive,
    receivedProposalsArchive,
}: TemplateListItemProps) => {
    const ceramicTemplateAPI = new CeramicTemplateAPI(currentUser)
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)
    const [receivedProposals, setReceivedProposals] = useState<
        ProposalListItemType[]
    >([])
    const [isToggling, setIsToggling] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const [isActive, setIsActive] = useState(template.isActive)

    useEffect(() => {
        let intervalId: NodeJS.Timeout
        if (isSavedToClipboard) {
            intervalId = setInterval(() => {
                setIsSavedToClipboard(false)
            }, 2000)
        }
        return () => clearInterval(intervalId)
    }, [isSavedToClipboard])

    useEffect(() => {
        fetchReceivedProposals()
    }, [])

    const fetchReceivedProposals = async () => {
        setIsFetching(true)
        let filteredReceivedProposals = Object.keys(template.receivedProposals)
        // Filter agains archive
        if (receivedProposalsArchive) {
            filteredReceivedProposals = filteredReceivedProposals.filter(
                (rp) =>
                    Object.values(receivedProposalsArchive).indexOf(rp) === -1
            )
        }
        setReceivedProposals(
            await Promise.all(
                filteredReceivedProposals.map(
                    async (proposalStreamID) =>
                        await getProposalListItem(currentUser, proposalStreamID)
                )
            )
        )
        setIsFetching(false)
    }

    const onRemoveReceivedProposal = async (
        proposalStreamID: string,
        type: 'DECLINE' | 'ARCHIVE'
    ) => {
        await ceramicTemplateAPI.removeReceivedProposal(proposalStreamID, type)
        const updatedReceivedProposals = receivedProposals.filter(
            (rp) => rp.streamID !== proposalStreamID
        )
        setReceivedProposals(updatedReceivedProposals)
    }

    const toggleIsActive = async () => {
        setIsToggling(true)
        await ceramicTemplateAPI.toggleActivate(templateStreamID)
        setIsActive(!isActive)
        setIsToggling(false)
    }

    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => {
                return (
                    <Box
                        background="background-back"
                        border
                        pad={{
                            horizontal: 'medium',
                            vertical: 'small',
                        }}
                        direction="row"
                        justify="between"
                        gap="small"
                        round="xsmall"
                    >
                        <Box flex>
                            <AccordionPanel
                                label={
                                    <Box gap="xsmall">
                                        <Text>{template.title}</Text>
                                        <Box
                                            direction="row"
                                            gap="small"
                                            align="center"
                                        >
                                            <Text color="dark-4" size="small">
                                                Received proposals:
                                            </Text>
                                            {isFetching ? (
                                                <Spinner size="xsmall" />
                                            ) : (
                                                <Text
                                                    color="dark-4"
                                                    size="small"
                                                >
                                                    {receivedProposals.length}
                                                </Text>
                                            )}
                                        </Box>
                                    </Box>
                                }
                            >
                                <Box gap="small">
                                    <Box direction="row" justify="end" wrap>
                                        <Box pad="small">
                                            <LoaderButton
                                                isLoading={isToggling}
                                                color="dark-4"
                                                icon={
                                                    isActive ? (
                                                        <CheckCircle
                                                            color={
                                                                cpTheme.global
                                                                    .colors[
                                                                    'status-ok'
                                                                ]
                                                            }
                                                        />
                                                    ) : (
                                                        <PauseCircle
                                                            color={
                                                                cpTheme.global
                                                                    .colors[
                                                                    'status-error'
                                                                ]
                                                            }
                                                        />
                                                    )
                                                }
                                                label={
                                                    isActive
                                                        ? 'Open for proposals'
                                                        : 'Closed for propsals'
                                                }
                                                onClick={toggleIsActive}
                                            />
                                        </Box>
                                        <Box
                                            direction="row"
                                            justify="end"
                                            gap="small"
                                            pad={{ vertical: 'small' }}
                                        >
                                            <ResponsiveLinkButton
                                                href={`/templates/${templateStreamID}`}
                                                label="View"
                                                icon={
                                                    <Eye
                                                        color={
                                                            cpTheme.global
                                                                .colors[
                                                                'dark-4'
                                                            ]
                                                        }
                                                    />
                                                }
                                            />
                                            <Button
                                                color="dark-4"
                                                size="small"
                                                icon={
                                                    isSavedToClipboard ? (
                                                        <Check
                                                            color={
                                                                cpTheme.global
                                                                    .colors[
                                                                    'dark-4'
                                                                ]
                                                            }
                                                        />
                                                    ) : (
                                                        <Copy
                                                            color={
                                                                cpTheme.global
                                                                    .colors[
                                                                    'dark-4'
                                                                ]
                                                            }
                                                        />
                                                    )
                                                }
                                                onClick={() => {
                                                    navigator.clipboard.writeText(
                                                        `${window.location.origin}/templates/${templateStreamID}`
                                                    )
                                                    setIsSavedToClipboard(true)
                                                }}
                                                label={
                                                    screenSize !== 'small'
                                                        ? 'Copy link'
                                                        : undefined
                                                }
                                            />
                                            <ResponsiveLinkButton
                                                href={`/dashboard/templates/edit/${templateStreamID}`}
                                                label="Edit"
                                                icon={
                                                    <Pen
                                                        color={
                                                            cpTheme.global
                                                                .colors[
                                                                'dark-4'
                                                            ]
                                                        }
                                                    />
                                                }
                                            />
                                            <ResponsiveContext.Consumer>
                                                {(screenSize) => {
                                                    return (
                                                        <Button
                                                            color="dark-4"
                                                            onClick={() => {
                                                                onArchive(
                                                                    template.title,
                                                                    templateStreamID
                                                                )
                                                            }}
                                                            size="small"
                                                            label={
                                                                screenSize !==
                                                                'small'
                                                                    ? 'Archive'
                                                                    : undefined
                                                            }
                                                            icon={
                                                                <Archive
                                                                    color={
                                                                        cpTheme
                                                                            .global
                                                                            .colors[
                                                                            'dark-4'
                                                                        ]
                                                                    }
                                                                />
                                                            }
                                                        />
                                                    )
                                                }}
                                            </ResponsiveContext.Consumer>
                                        </Box>
                                    </Box>
                                    <PlainSectionDivider />
                                    <Box gap="small" pad={{ bottom: 'small' }}>
                                        <Text size="small" color="dark-4">
                                            Proposals
                                        </Text>
                                        {receivedProposals &&
                                        receivedProposals.length > 0 ? (
                                            receivedProposals.map(
                                                (proposalListItem) => {
                                                    return (
                                                        <ReceivedProposalListItem
                                                            key={
                                                                proposalListItem.streamID
                                                            }
                                                            proposal={
                                                                proposalListItem
                                                            }
                                                            onRemove={
                                                                onRemoveReceivedProposal
                                                            }
                                                        />
                                                    )
                                                }
                                            )
                                        ) : (
                                            <ListSkeleton
                                                isFetching={isFetching}
                                                subject="received proposals"
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </AccordionPanel>
                        </Box>
                    </Box>
                )
            }}
        </ResponsiveContext.Consumer>
    )
}

export default TemplateListItem
