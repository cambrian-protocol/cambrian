import { Box, Text } from 'grommet'
import { useEffect, useState } from 'react'

import { BaseStagesLibType } from '@cambrian/app/models/StageModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import ListSkeleton from '@cambrian/app/components/skeletons/ListSkeleton'
import ProposalListItem from '@cambrian/app/components/list/ProposalListItem'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { ceramicInstance } from '@cambrian/app/services/ceramic/CeramicUtils'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface ProposalsDashboardUIProps {
    currentUser: UserType
    proposalsLib?: BaseStagesLibType
}

export type ProposalHashmap = {
    [proposalStreamID: string]: TileDocument<ProposalModel>
}

export type StageStackType = {
    proposalStreamID: string
    proposalCommitID: string
    proposal: ProposalModel
    template: TemplateModel
    composition: CompositionModel
}

export type CambrianProposalArchiveType = {
    [proposalStreamID: string]: StageStackType
}

const ProposalsDashboardUI = ({
    currentUser,
    proposalsLib,
}: ProposalsDashboardUIProps) => {
    const [proposals, setProposals] = useState<ProposalHashmap>({})
    const [isFetching, setIsFetching] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        fetchProposals()
    }, [proposalsLib])

    const fetchProposals = async () => {
        try {
            setIsFetching(true)
            if (proposalsLib) {
                setProposals(
                    (await ceramicInstance(currentUser).multiQuery(
                        Object.values(proposalsLib.lib).map((p) => {
                            return { streamId: p }
                        })
                    )) as ProposalHashmap
                )
            } else {
                setProposals({})
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsFetching(false)
    }

    return (
        <>
            <Box fill gap="medium" pad={{ top: 'medium' }}>
                <DashboardHeader
                    title="Proposals Management"
                    description="Edit, review, and fund your proposals here"
                />
                <Box fill>
                    <Text color={'dark-4'}>
                        Your Proposals (
                        {proposals && Object.keys(proposals).length})
                    </Text>
                    <Box pad={{ top: 'medium' }}>
                        {proposals && Object.keys(proposals).length > 0 ? (
                            <Box gap="small">
                                {Object.keys(proposals).map(
                                    (proposalStreamID) => (
                                        <ProposalListItem
                                            key={proposalStreamID}
                                            currentUser={currentUser}
                                            proposalStreamID={proposalStreamID}
                                            proposal={
                                                proposals[proposalStreamID]
                                                    .content
                                            }
                                        />
                                    )
                                )}
                            </Box>
                        ) : (
                            <ListSkeleton
                                isFetching={isFetching}
                                subject="Solver Proposals"
                            />
                        )}
                    </Box>
                </Box>
                <Box pad="large" />
            </Box>
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
