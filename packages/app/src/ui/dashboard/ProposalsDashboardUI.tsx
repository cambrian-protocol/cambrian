import { ArrowsClockwise, CircleDashed, Trash } from 'phosphor-react'
import { Box, Button, Heading, Tab, Tabs, Text } from 'grommet'
import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import ProposalListItem, {
    ProposalListItemType,
} from '@cambrian/app/components/list/ProposalListItem'
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
import { getProposalStatus } from '@cambrian/app/utils/helpers/proposalHelper'

interface ProposalsDashboardUIProps {
    currentUser: UserType
}

const ProposalsDashboardUI = ({ currentUser }: ProposalsDashboardUIProps) => {
    const [myProposals, setMyProposals] = useState<ProposalListItemType[]>([])
    const [receivedProposals, setReceivedProposals] = useState<
        ProposalListItemType[]
    >([])

    const [ceramicStagehand, setCeramicStagehand] = useState<CeramicStagehand>()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isFetching, setIsFetching] = useState(false)

    useEffect(() => {
        const ceramicStagehandInstance = new CeramicStagehand(
            currentUser.selfID
        )
        setCeramicStagehand(ceramicStagehandInstance)
        fetchMyProposals(ceramicStagehandInstance)
        fetchReceivedProposals(ceramicStagehandInstance)
    }, [])

    const fetchReceivedProposals = async (cs: CeramicStagehand) => {
        const templateStreamIDs = (await cs.loadStages(
            StageNames.template
        )) as StringHashmap

        const _receivedProposals: ProposalListItemType[] = []

        await Promise.all(
            Object.values(templateStreamIDs).map(async (streamID) => {
                const _templateStreamDoc = (await cs.loadTileDocument(
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
                            const _proposalDoc = (await cs.loadTileDocument(
                                proposalStreamID
                            )) as TileDocument<CeramicProposalModel>

                            const _proposalContent =
                                _proposalDoc.content as CeramicProposalModel

                            if (_proposalContent) {
                                _receivedProposals.push({
                                    status: await getProposalStatus(
                                        _proposalDoc,
                                        _templateStreamDoc,
                                        currentUser,
                                        cs
                                    ),
                                    streamID: proposalStreamID,
                                    title: _proposalContent.title,
                                    isAuthor:
                                        _proposalContent.author ===
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

    const fetchMyProposals = async (cs: CeramicStagehand) => {
        setIsFetching(true)
        try {
            const proposalStreamIDs = (await cs.loadStages(
                StageNames.proposal
            )) as StringHashmap

            const proposalStreamMap = (await cs.multiQuery(
                Object.values(proposalStreamIDs).map((s) => {
                    return { streamId: s }
                })
            )) as { [streamId: string]: TileDocument<CeramicProposalModel> }

            const proposalListItems: ProposalListItemType[] = await Promise.all(
                Object.keys(proposalStreamMap).map(async (p) => {
                    const _proposalDoc = proposalStreamMap[p]
                    const _template = (await cs.loadTileDocument(
                        _proposalDoc.content.template.streamID
                    )) as TileDocument<CeramicTemplateModel>
                    return {
                        status: await getProposalStatus(
                            _proposalDoc,
                            _template,
                            currentUser,
                            cs
                        ),
                        streamID: p,
                        title: _proposalDoc.content.title,
                        isAuthor:
                            _proposalDoc.content.author ===
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
                        pad="medium"
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
                            <Button
                                secondary
                                size="small"
                                label="Delete all"
                                icon={<Trash />}
                                onClick={() => {
                                    if (ceramicStagehand) {
                                        ceramicStagehand.clearStages(
                                            StageNames.proposal
                                        )
                                    }
                                }}
                            />
                            <LoaderButton
                                secondary
                                isLoading={isFetching}
                                icon={<ArrowsClockwise />}
                                onClick={() => {
                                    if (ceramicStagehand) {
                                        fetchMyProposals(ceramicStagehand)
                                        fetchReceivedProposals(ceramicStagehand)
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                    <Box fill pad={'medium'}>
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
                                            <CircleDashed size="32" />
                                            <Text size="small" color="dark-4">
                                                No Proposals created yet
                                            </Text>
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
                                                (receivedProposal, idx) => {
                                                    return (
                                                        <ProposalListItem
                                                            key={idx}
                                                            proposal={
                                                                receivedProposal
                                                            }
                                                        />
                                                    )
                                                }
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
                                            <CircleDashed size="32" />
                                            <Text size="small" color="dark-4">
                                                No proposals received yet
                                            </Text>
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
