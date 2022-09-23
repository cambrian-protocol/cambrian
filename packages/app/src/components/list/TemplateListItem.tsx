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
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../modals/ErrorPopupModal'
import ListSkeleton from '../skeletons/ListSkeleton'
import LoaderButton from '../buttons/LoaderButton'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import { ProposalHashmap } from '@cambrian/app/ui/dashboard/ProposalsDashboardUI'
import ReceivedProposalListItem from './ReceivedProposalListItem'
import ResponsiveLinkButton from '../buttons/ResponsiveLinkButton'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { ceramicInstance } from '@cambrian/app/services/ceramic/CeramicUtils'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { cpTheme } from '@cambrian/app/theme/theme'

interface TemplateListItemProps {
    currentUser: UserType
    templateStreamID: string
    template: TemplateModel
    receivedProposalsArchive?: StringHashmap
}

const TemplateListItem = ({
    currentUser,
    template,
    templateStreamID,
    receivedProposalsArchive,
}: TemplateListItemProps) => {
    const ceramicTemplateAPI = new CeramicTemplateAPI(currentUser)
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)
    const [receivedProposals, setReceivedProposals] = useState<ProposalHashmap>(
        {}
    )
    const [isLoading, setIsLoading] = useState(false)
    const [isTogglingActive, setIsTogglingActive] = useState(false)
    const [isActive, setIsActive] = useState(template.isActive)
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

    useEffect(() => {
        fetchReceivedProposals()
    }, [receivedProposalsArchive])

    const fetchReceivedProposals = async () => {
        try {
            setIsLoading(true)
            let filteredReceivedProposals = Object.keys(
                template.receivedProposals
            )
            // Filter agains archive
            if (receivedProposalsArchive) {
                filteredReceivedProposals = filteredReceivedProposals.filter(
                    (rp) =>
                        Object.values(receivedProposalsArchive).indexOf(rp) ===
                        -1
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
            setErrorMessage(await cpLogger.push(e))
        }
        setIsLoading(false)
    }

    const toggleIsActive = async () => {
        try {
            setIsTogglingActive(true)
            await ceramicTemplateAPI.toggleActivate(templateStreamID)
            setIsActive(!isActive)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsTogglingActive(false)
    }

    const onArchiveTemplate = async (
        templateTag: string,
        templateStreamID: string
    ) => {
        try {
            setIsLoading(true)
            await ceramicTemplateAPI.archiveTemplate(
                templateTag,
                templateStreamID
            )
        } catch (e) {
            setIsLoading(false)
            setErrorMessage(await cpLogger.push(e))
        }
    }

    return (
        <>
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
                                                                    cpTheme
                                                                        .global
                                                                        .colors[
                                                                        'status-ok'
                                                                    ]
                                                                }
                                                            />
                                                        ) : (
                                                            <PauseCircle
                                                                color={
                                                                    cpTheme
                                                                        .global
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
                                                                    cpTheme
                                                                        .global
                                                                        .colors[
                                                                        'dark-4'
                                                                    ]
                                                                }
                                                            />
                                                        ) : (
                                                            <Copy
                                                                color={
                                                                    cpTheme
                                                                        .global
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
                                                        setIsSavedToClipboard(
                                                            true
                                                        )
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
                                                                    onArchiveTemplate(
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
                                        <Box gap="small">
                                            <PlainSectionDivider />
                                            <Box
                                                gap="small"
                                                pad={{ bottom: 'small' }}
                                            >
                                                <Text
                                                    size="small"
                                                    color="dark-4"
                                                >
                                                    Proposals
                                                </Text>
                                                {receivedProposals &&
                                                Object.keys(receivedProposals)
                                                    .length > 0 ? (
                                                    Object.keys(
                                                        receivedProposals
                                                    ).map(
                                                        (proposalStreamID) => {
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
                                                                        ]
                                                                            .content
                                                                    }
                                                                />
                                                            )
                                                        }
                                                    )
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
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default TemplateListItem
