import { ArrowsClockwise, CircleDashed, File, Plus } from 'phosphor-react'
import { Box, Heading, Text } from 'grommet'
import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import DashboardLayout from '@cambrian/app/components/layout/DashboardLayout'
import DashboardUtilityButton from '@cambrian/app/components/buttons/DashboardUtilityButton'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import ProposalListItem from '@cambrian/app/components/list/ProposalListItem'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import TemplateListItem from '@cambrian/app/components/list/TemplateListItem'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface ProposalsDashboardUIProps {}

const ProposalsDashboardUI = ({}: ProposalsDashboardUIProps) => {
    const { currentUser } = useCurrentUser()
    const [proposals, setProposals] = useState<StringHashmap>()
    const [ceramicStagehand, setCeramicStagehand] = useState<CeramicStagehand>()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isFetching, setIsFetching] = useState(false)

    useEffect(() => {
        if (currentUser) {
            const ceramicStagehandInstance = new CeramicStagehand(
                currentUser.selfID
            )
            setCeramicStagehand(ceramicStagehandInstance)
            fetchProposals(ceramicStagehandInstance)
        }
    }, [currentUser])

    const fetchProposals = async (cs: CeramicStagehand) => {
        setIsFetching(true)
        try {
            const proposalStreams = (await cs.loadStages(
                StageNames.proposal
            )) as StringHashmap
            console.log(proposalStreams)
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

    return (
        <>
            <DashboardLayout contextTitle="Dashboard">
                <Box fill pad={{ top: 'medium' }}>
                    <Box height={{ min: 'auto' }}>
                        <Box pad="medium">
                            <Heading level="2">Proposals Management</Heading>
                        </Box>
                        <Box
                            pad={{
                                left: 'medium',
                                right: 'large',
                                vertical: 'medium',
                            }}
                            gap="small"
                        >
                            <Box
                                direction="row"
                                align="center"
                                justify="between"
                            >
                                <Heading level="4">Your Proposals</Heading>
                                <LoaderButton
                                    isLoading={isFetching}
                                    icon={<ArrowsClockwise />}
                                    onClick={() => {
                                        ceramicStagehand &&
                                            fetchProposals(ceramicStagehand)
                                    }}
                                />
                            </Box>
                            <PlainSectionDivider />
                        </Box>
                    </Box>
                    {proposals && Object.keys(proposals).length > 0 ? (
                        <Box
                            gap="small"
                            pad={{ left: 'medium', right: 'large' }}
                        >
                            {Object.keys(proposals).map((proposalStreamKey) => {
                                return (
                                    <ProposalListItem
                                        key={proposalStreamKey}
                                        proposalStreamID={
                                            proposals[proposalStreamKey]
                                        }
                                        proposalID={proposalStreamKey}
                                        onDelete={onDeleteProposal}
                                    />
                                )
                            })}
                        </Box>
                    ) : (
                        <Box fill justify="center" align="center" gap="medium">
                            <CircleDashed size="32" />
                            <Text size="small" color="dark-4">
                                You don't have any proposals yet
                            </Text>
                        </Box>
                    )}
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
