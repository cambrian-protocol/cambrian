import { AccordionPanel, Box, Button, ResponsiveContext, Text } from 'grommet'
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

import BaseSkeletonBox from '../skeletons/BaseSkeletonBox'
import CeramicTemplateAPI from '@cambrian/app/services/ceramic/CeramicTemplateAPI'
import ListSkeleton from '../skeletons/ListSkeleton'
import LoaderButton from '../buttons/LoaderButton'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import { ProposalHashmap } from '@cambrian/app/ui/dashboard/ProposalsDashboardUI'
import ReceivedProposalListItem from './ReceivedProposalListItem'
import ResponsiveButton from '../buttons/ResponsiveButton'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { ceramicInstance } from '@cambrian/app/services/ceramic/CeramicUtils'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'

interface TemplateListItemProps {
    currentUser: UserType
    templateStreamID: string
    template: TemplateModel
    receivedProposalsArchive?: string[]
}

const TemplateListItem = ({
    currentUser,
    template,
    templateStreamID,
    receivedProposalsArchive,
}: TemplateListItemProps) => {
    const { showAndLogError } = useErrorContext()

    const ceramicTemplateAPI = new CeramicTemplateAPI(currentUser)
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)
    const [receivedProposals, setReceivedProposals] = useState<ProposalHashmap>(
        {}
    )
    const [isLoading, setIsLoading] = useState(false)
    const [isTogglingActive, setIsTogglingActive] = useState(false)
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
    }, [receivedProposalsArchive])

    const fetchReceivedProposals = async () => {
        try {
            setIsLoading(true)
            let filteredReceivedProposals = Object.keys(
                template.receivedProposals
            )
            if (receivedProposalsArchive) {
                filteredReceivedProposals = filteredReceivedProposals.filter(
                    (rp) => receivedProposalsArchive.indexOf(rp) === -1
                )
            }
            setReceivedProposals(
                (await ceramicInstance(currentUser).multiQuery(
                    filteredReceivedProposals.map((p) => {
                        return { streamId: p }
                    })
                )) as ProposalHashmap
            )
        } catch (e) {
            showAndLogError(e)
        }
        setIsLoading(false)
    }

    const toggleIsActive = async () => {
        try {
            setIsTogglingActive(true)
            await ceramicTemplateAPI.toggleActivate(templateStreamID)
            setIsActive(!isActive)
        } catch (e) {
            showAndLogError(e)
        }
        setIsTogglingActive(false)
    }

    const onArchiveTemplate = async (templateStreamID: string) => {
        try {
            setIsLoading(true)
            await ceramicTemplateAPI.archiveTemplate(templateStreamID)
        } catch (e) {
            setIsLoading(false)
            showAndLogError(e)
        }
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
                                            {isLoading ? (
                                                <BaseSkeletonBox
                                                    height={'2em'}
                                                    width={'small'}
                                                />
                                            ) : (
                                                <Box
                                                    height="2em"
                                                    direction="row"
                                                    gap="xsmall"
                                                >
                                                    <Text
                                                        color="dark-4"
                                                        size="small"
                                                    >
                                                        Received proposals:
                                                    </Text>
                                                    <Text
                                                        color="dark-4"
                                                        size="small"
                                                    >
                                                        {
                                                            Object.keys(
                                                                receivedProposals
                                                            ).length
                                                        }
                                                    </Text>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                }
                            >
                                <Box>
                                    <Box direction="row" justify="end" wrap>
                                        <Box pad="small">
                                            <LoaderButton
                                                isLoading={isTogglingActive}
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
                                            <ResponsiveButton
                                                href={`/solver/${templateStreamID}`}
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
                                                        `${window.location.origin}/solver/${templateStreamID}`
                                                    )
                                                    setIsSavedToClipboard(true)
                                                }}
                                                label={
                                                    screenSize !== 'small'
                                                        ? 'Copy link'
                                                        : undefined
                                                }
                                            />
                                            <ResponsiveButton
                                                href={`/template/edit/${templateStreamID}`}
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
                                                                onArchiveTemplate(
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
                                    <Box gap="small">
                                        <PlainSectionDivider />
                                        <Box
                                            gap="small"
                                            pad={{ bottom: 'small' }}
                                        >
                                            <Text size="small" color="dark-4">
                                                Proposals
                                            </Text>
                                            {receivedProposals &&
                                            Object.keys(receivedProposals)
                                                .length > 0 ? (
                                                Object.keys(
                                                    receivedProposals
                                                ).map((proposalStreamID) => {
                                                    return (
                                                        <ReceivedProposalListItem
                                                            key={
                                                                proposalStreamID
                                                            }
                                                            currentUser={
                                                                currentUser
                                                            }
                                                            proposalStreamID={
                                                                proposalStreamID
                                                            }
                                                            proposal={
                                                                receivedProposals[
                                                                    proposalStreamID
                                                                ].content
                                                            }
                                                        />
                                                    )
                                                })
                                            ) : (
                                                <ListSkeleton
                                                    isFetching={isLoading}
                                                    subject="received proposals"
                                                />
                                            )}
                                        </Box>
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
