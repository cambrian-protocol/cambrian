import { ArrowsClockwise, CircleDashed } from 'phosphor-react'
import { Box, Heading, Tab, Tabs, Text } from 'grommet'
import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import ProposalListItem, {
    ProposalListItemType,
} from '@cambrian/app/components/list/ProposalListItem'
import { useEffect, useState } from 'react'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import DashboardLayout from '@cambrian/app/components/layout/DashboardLayout'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { initProposalStatus } from '@cambrian/app/utils/helpers/proposalStatusHelper'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface ProposalsDashboardUIProps {}

const ProposalsDashboardUI = ({}: ProposalsDashboardUIProps) => {
    const { currentUser } = useCurrentUser()

    const [myProposals, setMyProposals] = useState<ProposalListItemType[]>([])
    const [receivedProposals, setReceivedProposals] = useState<
        ProposalListItemType[]
    >([])

    const [ceramicStagehand, setCeramicStagehand] = useState<CeramicStagehand>()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isFetching, setIsFetching] = useState(false)

    useEffect(() => {
        if (currentUser) {
            const ceramicStagehandInstance = new CeramicStagehand(
                currentUser.selfID
            )
            setCeramicStagehand(ceramicStagehandInstance)
            fetchMyProposals(ceramicStagehandInstance)
            fetchReceivedProposals(ceramicStagehandInstance)
        }
    }, [currentUser])

    const fetchReceivedProposals = async (cs: CeramicStagehand) => {
        const templateStreams = (await cs.loadStages(
            StageNames.template
        )) as StringHashmap

        const _receivedProposals: ProposalListItemType[] = []

        await Promise.all(
            Object.values(templateStreams).map(async (streamID) => {
                const _templateStreamContent = (await (
                    await cs.loadStream(streamID)
                ).content) as CeramicTemplateModel
                if (
                    _templateStreamContent &&
                    _templateStreamContent.receivedProposals &&
                    Object.keys(_templateStreamContent.receivedProposals)
                        .length > 0
                ) {
                    await Promise.all(
                        Object.keys(
                            _templateStreamContent.receivedProposals
                        ).map(async (proposalStreamID) => {
                            const _proposalDoc = await cs.loadStream(
                                proposalStreamID
                            )

                            const _proposalContent =
                                _proposalDoc.content as CeramicProposalModel

                            if (_proposalContent) {
                                _receivedProposals.push({
                                    status: initProposalStatus(
                                        _templateStreamContent
                                            .receivedProposals[
                                            proposalStreamID
                                        ],
                                        _proposalDoc.commitId.toString(),
                                        _proposalContent.submitted
                                    ),
                                    streamID: streamID,
                                    title: _proposalContent.title,
                                    isAuthor:
                                        _proposalContent.author ===
                                        currentUser?.selfID.did.id,
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
            const proposalStreams = (await cs.loadStages(
                StageNames.proposal
            )) as StringHashmap

            const _proposals: ProposalListItemType[] = []

            await Promise.all(
                Object.values(proposalStreams).map(async (streamID) => {
                    const _proposalDoc = await cs.loadStream(streamID)

                    const _proposal =
                        _proposalDoc.content as CeramicProposalModel

                    if (_proposal) {
                        const _templateStreamContent = (
                            await cs.loadStream(_proposal.template.streamID)
                        ).content as CeramicTemplateModel
                        if (_templateStreamContent) {
                            _proposals.push({
                                status: initProposalStatus(
                                    _templateStreamContent.receivedProposals[
                                        streamID
                                    ],
                                    _proposalDoc.commitId.toString(),
                                    _proposal.submitted
                                ),
                                streamID: streamID,
                                title: _proposal.title,
                                isAuthor:
                                    _proposal.author ===
                                    currentUser?.selfID.did.id,
                            })
                        }
                    }
                })
            )
            setMyProposals(_proposals)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsFetching(false)
    }

    const onDeleteProposal = async (proposalStreamKey: string) => {
        /*  if (ceramicStagehand) {
            try {
                await ceramicStagehand.deleteStage(
                    proposalStreamKey,
                    StageNames.proposal
                )
                const updatedProposals = { ...proposals }
                delete updatedProposals[proposalStreamKey]
                setProposals(updatedProposals)
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        } */
    }

    const onDeleteReceivedProposal = async () => {
        // TODO Remove proposal entry from template
    }

    return (
        <>
            <DashboardLayout contextTitle="Dashboard">
                <Box fill pad={{ top: 'medium' }}>
                    <Box
                        height={{ min: 'auto' }}
                        direction="row"
                        justify="between"
                        pad={{ right: 'large' }}
                        align="center"
                    >
                        <Box pad="medium">
                            <Heading level="2">Proposals Management</Heading>
                        </Box>
                        <Box>
                            <LoaderButton
                                isLoading={isFetching}
                                icon={<ArrowsClockwise />}
                                onClick={() => {
                                    ceramicStagehand &&
                                        fetchMyProposals(ceramicStagehand)
                                }}
                            />
                        </Box>
                    </Box>
                    <Box pad="small" fill>
                        <Tabs alignControls="start">
                            <Tab
                                title={`Your Proposals (${myProposals.length})`}
                            >
                                {myProposals.length > 0 ? (
                                    <Box gap="small" pad="small">
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
                                    >
                                        <CircleDashed size="32" />
                                        <Text size="small" color="dark-4">
                                            Proposals created yet
                                        </Text>
                                    </Box>
                                )}
                            </Tab>
                            <Tab
                                title={`Received Proposals (${receivedProposals.length})`}
                            >
                                {receivedProposals.length > 0 ? (
                                    <Box gap="small" pad="small">
                                        {receivedProposals.map(
                                            (receivedProposal, idx) => {
                                                return (
                                                    <ProposalListItem
                                                        key={idx}
                                                        proposal={
                                                            receivedProposal
                                                        }
                                                        onDelete={
                                                            onDeleteProposal
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
                                    >
                                        <CircleDashed size="32" />
                                        <Text size="small" color="dark-4">
                                            No proposals received yet
                                        </Text>
                                    </Box>
                                )}
                            </Tab>
                            <Tab title="Funding">
                                <Text>
                                    Note: On chain proposals which are currently
                                    in the funding process
                                </Text>
                            </Tab>
                        </Tabs>
                    </Box>
                    <Box pad="large" />
                </Box>
            </DashboardLayout>
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
