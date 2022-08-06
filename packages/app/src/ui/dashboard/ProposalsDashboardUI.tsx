import { ArrowsClockwise, CircleDashed } from 'phosphor-react'
import { Box, Heading, Spinner, Tab, Tabs, Text } from 'grommet'
import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import ProposalListItem, {
    ProposalListItemType,
} from '@cambrian/app/components/list/ProposalListItem'
import {
    getApprovedProposalCommitID,
    getLatestProposalSubmission,
    getOnChainProposal,
    getProposalStatus,
} from '@cambrian/app/utils/helpers/proposalHelper'
import { useEffect, useState } from 'react'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'

interface ProposalsDashboardUIProps {
    currentUser: UserType
}

const ProposalsDashboardUI = ({ currentUser }: ProposalsDashboardUIProps) => {
    const ceramicStagehand = new CeramicStagehand(currentUser.selfID)
    const [myProposals, setMyProposals] = useState<ProposalListItemType[]>([])
    const [receivedProposals, setReceivedProposals] = useState<
        ProposalListItemType[]
    >([])

    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isFetching, setIsFetching] = useState(false)

    useEffect(() => {
        fetchMyProposals()
        fetchReceivedProposals()
    }, [])

    const fetchReceivedProposals = async () => {
        const templateStreamIDs = (await ceramicStagehand.loadStagesMap(
            StageNames.template
        )) as StringHashmap

        const _receivedProposals: ProposalListItemType[] = []

        await Promise.all(
            Object.values(templateStreamIDs).map(async (streamID) => {
                const _templateStreamDoc =
                    (await ceramicStagehand.loadTileDocument(
                        streamID
                    )) as TileDocument<CeramicTemplateModel>
                if (
                    _templateStreamDoc &&
                    _templateStreamDoc.content.receivedProposals &&
                    Object.keys(_templateStreamDoc.content.receivedProposals)
                        .length > 0
                ) {
                    await Promise.all(
                        Object.keys(
                            _templateStreamDoc.content.receivedProposals
                        ).map(async (proposalStreamID) => {
                            let proposalDoc:
                                | TileDocument<CeramicProposalModel>
                                | undefined

                            let onChainProposal: ethers.Contract | undefined

                            const approvedProposalCommitID =
                                getApprovedProposalCommitID(
                                    _templateStreamDoc.content,
                                    proposalStreamID
                                )

                            if (approvedProposalCommitID) {
                                proposalDoc =
                                    (await ceramicStagehand.loadReadOnlyStream(
                                        approvedProposalCommitID
                                    )) as TileDocument<CeramicProposalModel>

                                onChainProposal = await getOnChainProposal(
                                    currentUser,
                                    approvedProposalCommitID,
                                    proposalDoc.content.template.commitID
                                )
                            } else {
                                proposalDoc =
                                    (await ceramicStagehand.loadReadOnlyStream(
                                        proposalStreamID
                                    )) as TileDocument<CeramicProposalModel>

                                if (!proposalDoc.content.isSubmitted) {
                                    const latestProposalSubmission =
                                        getLatestProposalSubmission(
                                            proposalStreamID,
                                            _templateStreamDoc.content
                                                .receivedProposals
                                        )
                                    if (latestProposalSubmission) {
                                        proposalDoc =
                                            (await ceramicStagehand.loadReadOnlyStream(
                                                latestProposalSubmission.proposalCommitID
                                            )) as TileDocument<CeramicProposalModel>
                                    }
                                }
                            }

                            if (proposalDoc) {
                                const templateCommit = (await (
                                    await ceramicStagehand.loadReadOnlyStream(
                                        proposalDoc.content.template.commitID
                                    )
                                ).content) as CeramicTemplateModel

                                _receivedProposals.push({
                                    status: getProposalStatus(
                                        proposalDoc,
                                        _templateStreamDoc.content
                                            .receivedProposals[
                                            proposalDoc.id.toString()
                                        ],
                                        onChainProposal
                                    ),
                                    streamID: proposalStreamID,
                                    title: proposalDoc.content.title,
                                    templateTitle: templateCommit.title,
                                    isAuthor:
                                        proposalDoc.content.author ===
                                        currentUser.selfID.did.id,
                                })
                            }
                        })
                    )
                }
            })
        )
        setReceivedProposals(_receivedProposals)
    }

    const fetchMyProposals = async () => {
        setIsFetching(true)
        try {
            const proposalStreamIDs = (await ceramicStagehand.loadStagesMap(
                StageNames.proposal
            )) as StringHashmap

            const proposalStreamMap =
                (await ceramicStagehand.loadReadOnlyStreams(
                    Object.values(proposalStreamIDs).map((s) => {
                        return { streamId: s }
                    })
                )) as { [streamId: string]: TileDocument<CeramicProposalModel> }

            const proposalListItems: ProposalListItemType[] = await Promise.all(
                Object.keys(proposalStreamMap).map(async (proposalStreamID) => {
                    let proposalDoc = proposalStreamMap[proposalStreamID]
                    let onChainProposal: ethers.Contract | undefined = undefined

                    const _templateStreamContent = (
                        await ceramicStagehand.loadReadOnlyStream(
                            proposalDoc.content.template.streamID
                        )
                    ).content as CeramicTemplateModel

                    const approvedProposalCommitID =
                        getApprovedProposalCommitID(
                            _templateStreamContent,
                            proposalStreamID
                        )

                    if (approvedProposalCommitID) {
                        proposalDoc =
                            (await ceramicStagehand.loadReadOnlyStream(
                                approvedProposalCommitID
                            )) as TileDocument<CeramicProposalModel>

                        onChainProposal = await getOnChainProposal(
                            currentUser,
                            approvedProposalCommitID,
                            proposalDoc.content.template.commitID
                        )
                    }

                    const templateCommit = (await (
                        await ceramicStagehand.loadReadOnlyStream(
                            proposalDoc.content.template.commitID
                        )
                    ).content) as CeramicTemplateModel

                    return {
                        status: getProposalStatus(
                            proposalDoc,
                            _templateStreamContent.receivedProposals[
                                proposalStreamID
                            ],
                            onChainProposal
                        ),
                        streamID: proposalStreamID,
                        title: proposalDoc.content.title,
                        templateTitle: templateCommit.title,
                        isAuthor:
                            proposalDoc.content.author ===
                            currentUser.selfID.did.id,
                    }
                })
            )

            setMyProposals(proposalListItems)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsFetching(false)
    }

    const onDeleteProposal = async (proposalTag: string) => {
        if (ceramicStagehand) {
            try {
                await ceramicStagehand.deleteStage(
                    proposalTag,
                    StageNames.proposal
                )
                const updatedProposals = myProposals.filter(
                    (proposal) => proposal.title !== proposalTag
                )
                setMyProposals(updatedProposals)
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
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
                                Edit, Review, and fund your proposals here
                            </Text>
                        </Box>
                        <Box
                            direction="row"
                            gap="small"
                            pad={{ vertical: 'small' }}
                        >
                            {/*  
                            TODO For dev purposes
                            <Button
                                secondary
                                size="small"
                                label="Delete all"
                                icon={<Trash />}
                                onClick={() => {
                                    ceramicStagehand.clearStages(
                                        StageNames.proposal
                                    )
                                }}
                            /> */}
                            <LoaderButton
                                secondary
                                isLoading={isFetching}
                                icon={<ArrowsClockwise />}
                                onClick={() => {
                                    fetchMyProposals()
                                    fetchReceivedProposals()
                                }}
                            />
                        </Box>
                    </Box>
                    <Box fill pad={'large'}>
                        <Tabs alignControls="start">
                            <Tab
                                title={`Your Proposals (${myProposals.length})`}
                            >
                                <Box pad={{ top: 'medium' }}>
                                    {myProposals.length > 0 ? (
                                        <Box gap="small">
                                            {myProposals.map((proposal) => (
                                                <ProposalListItem
                                                    key={proposal.title}
                                                    proposal={proposal}
                                                    onDelete={onDeleteProposal}
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
                                                <>
                                                    <CircleDashed size="32" />
                                                    <Text
                                                        size="small"
                                                        color="dark-4"
                                                    >
                                                        No Proposals created yet
                                                    </Text>
                                                </>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Tab>
                            <Tab
                                title={`Received Proposals (${receivedProposals.length})`}
                            >
                                <Box pad={{ top: 'medium' }}>
                                    {receivedProposals.length > 0 ? (
                                        <Box gap="small">
                                            {receivedProposals.map(
                                                (receivedProposal, idx) => (
                                                    <ProposalListItem
                                                        key={idx}
                                                        proposal={
                                                            receivedProposal
                                                        }
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
                                                <>
                                                    <CircleDashed size="32" />
                                                    <Text
                                                        size="small"
                                                        color="dark-4"
                                                    >
                                                        No Proposals created yet
                                                    </Text>
                                                </>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Tab>
                        </Tabs>
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
