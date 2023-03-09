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

import API from '@cambrian/app/services/api/cambrian.api'
import BaseSkeletonBox from '../skeletons/BaseSkeletonBox'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../modals/ErrorPopupModal'
import ListSkeleton from '../skeletons/ListSkeleton'
import LoaderButton from '../buttons/LoaderButton'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalService from '@cambrian/app/services/stages/ProposalService'
import ReceivedProposalListItem from './ReceivedProposalListItem'
import ResponsiveButton from '../buttons/ResponsiveButton'
import Template from '@cambrian/app/classes/stages/Template'
import TemplateService from '@cambrian/app/services/stages/TemplateService'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { cpTheme } from '@cambrian/app/theme/theme'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface TemplateListItemProps {
    template: Template
    receivedProposalsArchive?: string[]
}

const TemplateListItem = ({
    template,
    receivedProposalsArchive,
}: TemplateListItemProps) => {
    const { currentUser } = useCurrentUserContext()
    const [isSavedToClipboard, setIsSavedToClipboard] = useState(false)
    const [receivedProposals, setReceivedProposals] = useState<Proposal[]>()
    const [isLoading, setIsLoading] = useState(false)
    const [isTogglingActive, setIsTogglingActive] = useState(false)
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
                template.content.receivedProposals
            )
            if (receivedProposalsArchive) {
                filteredReceivedProposals = filteredReceivedProposals.filter(
                    (rp) => receivedProposalsArchive.indexOf(rp) === -1
                )
            }
            const res = await API.doc.multiQuery<ProposalModel>(
                filteredReceivedProposals
            )

            if (res) {
                const proposalService = new ProposalService()
                const templateService = new TemplateService()
                const _proposals: Proposal[] = res.map(
                    (p) =>
                        new Proposal(
                            template.doc,
                            p,
                            proposalService,
                            templateService,
                            currentUser
                        )
                )
                setReceivedProposals(_proposals)
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsLoading(false)
    }

    const toggleIsActive = async () => {
        try {
            setIsTogglingActive(true)
            if (template.content.isActive) {
                await template.unpublish()
            } else {
                await template.publish()
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsTogglingActive(false)
    }

    const onArchiveTemplate = async () => {
        try {
            setIsLoading(true)
            await template.archive()
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
                                            <Text>
                                                {template.content.title}
                                            </Text>
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
                                                                receivedProposals?.length
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
                                                        template.content
                                                            .isActive ? (
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
                                                        template.content
                                                            .isActive
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
                                                    href={`/solver/${template.doc.streamID}`}
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
                                                            `${window.location.origin}/solver/${template.doc.streamID}`
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
                                                <ResponsiveButton
                                                    href={`/template/edit/${template.doc.streamID}`}
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
                                                                onClick={
                                                                    onArchiveTemplate
                                                                }
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
                                                {receivedProposals ? (
                                                    receivedProposals.map(
                                                        (receivedProposal) => (
                                                            <ReceivedProposalListItem
                                                                key={
                                                                    receivedProposal
                                                                        .doc
                                                                        .streamID
                                                                }
                                                                proposal={
                                                                    receivedProposal
                                                                }
                                                                template={
                                                                    template
                                                                }
                                                            />
                                                        )
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
