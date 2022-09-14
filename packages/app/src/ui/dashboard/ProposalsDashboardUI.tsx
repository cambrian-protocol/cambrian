import { Box, Text } from 'grommet'
import ProposalListItem, {
    ProposalListItemType,
} from '@cambrian/app/components/list/ProposalListItem'
import { useEffect, useState } from 'react'

import { ArrowsClockwise } from 'phosphor-react'
import CeramicProposalAPI from '@cambrian/app/services/ceramic/CeramicProposalAPI'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import ListSkeleton from '@cambrian/app/components/skeletons/ListSkeleton'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { StageNames } from '@cambrian/app/models/StageModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { getProposalListItem } from '@cambrian/app/utils/helpers/proposalHelper'
import { loadStagesLib } from '@cambrian/app/services/ceramic/CeramicUtils'

interface ProposalsDashboardUIProps {
    currentUser: UserType
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

const ProposalsDashboardUI = ({ currentUser }: ProposalsDashboardUIProps) => {
    const ceramicProposalAPI = new CeramicProposalAPI(currentUser)

    const [myProposals, setMyProposals] = useState<ProposalListItemType[]>([])
    const [isFetching, setIsFetching] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        setIsFetching(true)
        try {
            const stagesLib = await loadStagesLib(currentUser)
            if (
                stagesLib.content !== null &&
                typeof stagesLib.content === 'object'
            ) {
                // My Proposals
                if (stagesLib.content.proposals) {
                    setMyProposals(
                        await Promise.all(
                            Object.keys(stagesLib.content.proposals.lib).map(
                                async (proposalTag) =>
                                    await getProposalListItem(
                                        currentUser,
                                        stagesLib.content.proposals.lib[
                                            proposalTag
                                        ]
                                    )
                            )
                        )
                    )
                } else {
                    setMyProposals([])
                }
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsFetching(false)
    }

    const onRemove = async (
        proposalTag: string,
        proposalStreamID: string,
        type: 'CANCEL' | 'ARCHIVE'
    ) => {
        try {
            await ceramicProposalAPI.removeProposal(
                proposalTag,
                proposalStreamID,
                type
            )
            setMyProposals(
                myProposals.filter((proposal) => proposal.title !== proposalTag)
            )
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

    return (
        <>
            <Box fill gap="medium" pad={{ top: 'medium' }}>
                <DashboardHeader
                    title="Proposals Management"
                    description="Edit, review, and fund your proposals here"
                    controls={[
                        <LoaderButton
                            secondary
                            isLoading={isFetching}
                            icon={<ArrowsClockwise />}
                            onClick={() => {
                                init()
                            }}
                        />,
                    ]}
                />
                <Box fill>
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
                                        showTemplateTitle
                                    />
                                ))}
                            </Box>
                        ) : (
                            <ListSkeleton
                                isFetching={isFetching}
                                subject="proposals"
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
