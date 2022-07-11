import { ArrowsClockwise, CircleDashed } from 'phosphor-react'
import { Box, Heading, Tab, Tabs, Text } from 'grommet'
import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import DashboardLayout from '@cambrian/app/components/layout/DashboardLayout'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ProposalListItem from '@cambrian/app/components/list/ProposalListItem'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface ProposalsDashboardUIProps {}

const ProposalsDashboardUI = ({}: ProposalsDashboardUIProps) => {
    const { currentUser } = useCurrentUser()
    const [proposals, setProposals] = useState<StringHashmap>()
    const [ceramicStagehand, setCeramicStagehand] = useState<CeramicStagehand>()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isFetching, setIsFetching] = useState(false)

    const [receivedProposals, setReceivedProposals] = useState<
        { template: CeramicTemplateModel; proposal: CeramicProposalModel }[]
    >([])

    useEffect(() => {
        if (currentUser) {
            const ceramicStagehandInstance = new CeramicStagehand(
                currentUser.selfID
            )
            setCeramicStagehand(ceramicStagehandInstance)
            fetchProposals(ceramicStagehandInstance)
            fetchReceivedProposals(ceramicStagehandInstance)
        }
    }, [currentUser])

    // TODO Clean up / Styling
    const fetchReceivedProposals = async (cs: CeramicStagehand) => {
        const templateStreams = (await cs.loadStages(
            StageNames.template
        )) as StringHashmap

        const rProposals: {
            template: CeramicTemplateModel
            proposal: CeramicProposalModel
        }[] = []

        await Promise.all(
            Object.values(templateStreams).map(async (streamID) => {
                const template = (await (
                    await cs.loadStream(streamID)
                ).content) as CeramicTemplateModel
                if (
                    template &&
                    template.receivedProposals &&
                    Object.keys(template.receivedProposals).length > 0
                ) {
                    await Promise.all(
                        Object.keys(template.receivedProposals).map(
                            async (proposalStreamID) => {
                                const proposal = (
                                    await cs.loadStream(proposalStreamID)
                                ).content as CeramicProposalModel
                                if (proposal) {
                                    rProposals.push({
                                        template: template,
                                        proposal: proposal,
                                    })
                                }
                            }
                        )
                    )
                }
            })
        )
        setReceivedProposals(rProposals)
    }

    const fetchProposals = async (cs: CeramicStagehand) => {
        setIsFetching(true)
        try {
            const proposalStreams = (await cs.loadStages(
                StageNames.proposal
            )) as StringHashmap

            setProposals(proposalStreams)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsFetching(false)
    }

    const onDeleteProposal = async (proposalStreamKey: string) => {
        if (ceramicStagehand) {
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
        }
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
                                        fetchProposals(ceramicStagehand)
                                }}
                            />
                        </Box>
                    </Box>
                    <Box pad="small" fill>
                        <Tabs alignControls="start">
                            <Tab
                                title={`Your Proposals (${
                                    proposals && Object.keys(proposals).length
                                })`}
                            >
                                {proposals &&
                                Object.keys(proposals).length > 0 ? (
                                    <Box gap="small" pad="small">
                                        {Object.keys(proposals).map(
                                            (proposalStreamKey) => {
                                                return (
                                                    <ProposalListItem
                                                        key={proposalStreamKey}
                                                        proposalStreamID={
                                                            proposals[
                                                                proposalStreamKey
                                                            ]
                                                        }
                                                        proposalID={
                                                            proposalStreamKey
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
                                                    // TODO Proposal stream as Key
                                                    <ProposalListItem
                                                        key={idx}
                                                        proposalStreamID={''}
                                                        proposalID={
                                                            receivedProposal
                                                                .proposal.title
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
