import { Box, Heading, Spinner, Text } from 'grommet'
import CeramicProposalAPI, {
    CeramicProposalLibType,
} from '@cambrian/app/services/ceramic/CeramicProposalAPI'
import ProposalListItem, {
    ProposalListItemType,
} from '@cambrian/app/components/list/ProposalListItem'
import {
    ceramicInstance,
    loadStageLib,
} from '@cambrian/app/services/ceramic/CeramicUtils'
import { useEffect, useState } from 'react'

import { ArrowsClockwise } from 'phosphor-react'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import RecentProposalListItem from '@cambrian/app/components/list/RecentProposalListItem'
import { StageNames } from '@cambrian/app/models/StageModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { getProposalListItem } from '@cambrian/app/utils/helpers/proposalHelper'

interface ProposalsDashboardUIProps {
    currentUser: UserType
}

type ProposalHashmap = {
    [proposalStreamID: string]: TileDocument<CeramicProposalModel>
}

export type ProposalStackType = {
    proposalCommitID: string
    proposal: CeramicProposalModel
    template: CeramicTemplateModel
    composition: CompositionModel
}

export type CambrianProposalArchiveType = {
    [proposalStreamID: string]: ProposalStackType
}

const ProposalsDashboardUI = ({ currentUser }: ProposalsDashboardUIProps) => {
    const ceramicProposalAPI = new CeramicProposalAPI(currentUser)

    const [myProposals, setMyProposals] = useState<ProposalListItemType[]>([])
    const [recentProposals, setRecentProposals] = useState<ProposalHashmap>({})
    const [receivedProposals, setReceivedProposals] = useState<
        ProposalListItemType[]
    >([])

    const [isFetching, setIsFetching] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        setIsFetching(true)
        try {
            const proposalLib = await loadStageLib<CeramicProposalLibType>(
                currentUser,
                StageNames.proposal
            )
            if (
                proposalLib.content !== null &&
                typeof proposalLib.content === 'object'
            ) {
                // My Proposals
                if (proposalLib.content.lib) {
                    setMyProposals(
                        await Promise.all(
                            Object.keys(proposalLib.content.lib).map(
                                async (proposalTag) =>
                                    await getProposalListItem(
                                        currentUser,
                                        proposalLib.content.lib[proposalTag]
                                    )
                            )
                        )
                    )
                } else {
                    setMyProposals([])
                }

                // Received Proposals
                if (proposalLib.content.received) {
                    setReceivedProposals(
                        await Promise.all(
                            proposalLib.content.received.map(
                                async (proposalStreamID) =>
                                    await getProposalListItem(
                                        currentUser,
                                        proposalStreamID
                                    )
                            )
                        )
                    )
                } else {
                    setReceivedProposals([])
                }

                // Recent Proposals
                if (proposalLib.content.recents) {
                    setRecentProposals(
                        (await ceramicInstance(currentUser).multiQuery(
                            proposalLib.content.recents
                                .map((r) => {
                                    return { streamId: r }
                                })
                                .reverse()
                                .slice(0, 4)
                        )) as ProposalHashmap
                    )
                } else {
                    setRecentProposals({})
                }
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsFetching(false)
    }

    const onRemove = async (
        proposalTag: string,
        type: 'DELETE' | 'ARCHIVE'
    ) => {
        try {
            await ceramicProposalAPI.removeProposal(proposalTag, type)
            setMyProposals(
                myProposals.filter((proposal) => proposal.title !== proposalTag)
            )
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
    }

    const onRemoveReceived = async (
        proposalTag: string,
        type: 'DELETE' | 'ARCHIVE'
    ) => {
        try {
            const proposalListItem = receivedProposals.find(
                (r) => r.title === proposalTag
            )
            if (proposalListItem) {
                await ceramicProposalAPI.removeReceivedProposal(
                    proposalListItem.streamID,
                    type
                )
                setReceivedProposals(
                    receivedProposals.filter(
                        (r) => r.streamID !== proposalListItem.streamID
                    )
                )
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
    }

    // TODO Functions for archive
    const onUnarchive = async (proposalStreamID: string) => {
        try {
            await ceramicProposalAPI.unarchiveProposal(proposalStreamID)
            const updatedProposals = [...myProposals]
            updatedProposals.push(
                await getProposalListItem(currentUser, proposalStreamID)
            )
            setMyProposals(updatedProposals)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
    }

    const onUnarchiveReceived = async (proposalStreamID: string) => {
        try {
            await ceramicProposalAPI.unarchiveReceivedProposal(proposalStreamID)
            const updatedReceivedProposals = [...receivedProposals]
            updatedReceivedProposals.push(
                await getProposalListItem(currentUser, proposalStreamID)
            )
            setReceivedProposals(updatedReceivedProposals)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
    }

    return (
        <>
            <PageLayout contextTitle="Proposals" kind="narrow">
                <Box fill pad={{ top: 'large' }}>
                    <Box
                        height={{ min: 'auto' }}
                        direction="row"
                        justify="between"
                        align="center"
                        pad="large"
                        wrap
                    >
                        <Box>
                            <Heading level="2">Proposals Management</Heading>
                            <Text color="dark-4">
                                Edit, review, and fund your proposals here
                            </Text>
                        </Box>
                        <Box
                            direction="row"
                            gap="small"
                            pad={{ vertical: 'small' }}
                        >
                            <LoaderButton
                                secondary
                                isLoading={isFetching}
                                icon={<ArrowsClockwise />}
                                onClick={() => {
                                    init()
                                }}
                            />
                        </Box>
                    </Box>
                    <Box fill pad={{ horizontal: 'large' }} gap="medium">
                        <Box>
                            <Text color={'dark-4'}>
                                Your Proposals ({myProposals.length})
                            </Text>
                            <Box pad={{ top: 'medium' }}>
                                {myProposals.length > 0 ? (
                                    <Box gap="small">
                                        {myProposals.map((proposal) => (
                                            <ProposalListItem
                                                key={proposal.title}
                                                proposal={proposal}
                                                onRemove={onRemove}
                                            />
                                        ))}
                                    </Box>
                                ) : (
                                    <Box
                                        fill
                                        justify="center"
                                        align="center"
                                        gap="medium"
                                        pad="large"
                                        round="xsmall"
                                        border
                                    >
                                        {isFetching ? (
                                            <Spinner />
                                        ) : (
                                            <Box>
                                                <Text
                                                    size="small"
                                                    color="dark-4"
                                                >
                                                    No proposals
                                                </Text>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                        <PlainSectionDivider />
                        <Box>
                            <Text color={'dark-4'}>
                                Received Proposals ({receivedProposals.length})
                            </Text>
                            <Box pad={{ top: 'medium' }}>
                                {receivedProposals.length > 0 ? (
                                    <Box gap="small">
                                        {receivedProposals.map(
                                            (receivedProposal, idx) => (
                                                <ProposalListItem
                                                    key={idx}
                                                    proposal={receivedProposal}
                                                    onRemove={onRemoveReceived}
                                                />
                                            )
                                        )}
                                    </Box>
                                ) : (
                                    <Box
                                        fill
                                        justify="center"
                                        align="center"
                                        gap="medium"
                                        pad="large"
                                        round="xsmall"
                                        border
                                    >
                                        {isFetching ? (
                                            <Spinner />
                                        ) : (
                                            <Box>
                                                <Text
                                                    size="small"
                                                    color="dark-4"
                                                >
                                                    No proposals
                                                </Text>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                        <PlainSectionDivider />
                        <BaseFormGroupContainer
                            groupTitle="Recently viewed"
                            height={{ min: 'xsmall' }}
                        >
                            <Box gap="small">
                                {Object.keys(recentProposals).map(
                                    (proposal) => {
                                        return (
                                            <RecentProposalListItem
                                                key={proposal}
                                                proposal={
                                                    recentProposals[proposal]
                                                        .content
                                                }
                                                proposalStreamID={proposal}
                                            />
                                        )
                                    }
                                )}
                            </Box>
                        </BaseFormGroupContainer>
                    </Box>
                    <Box pad="large" />
                </Box>
            </PageLayout>
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default ProposalsDashboardUI
