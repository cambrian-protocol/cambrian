import API, { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { Box, Text } from 'grommet'
import { useEffect, useState } from 'react'

import { BaseStageLibType } from '@cambrian/app/classes/stageLibs/BaseStageLib'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import ListSkeleton from '@cambrian/app/components/skeletons/ListSkeleton'
import ProposalListItem from '@cambrian/app/components/list/ProposalListItem'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface ProposalsDashboardUIProps {
    currentUser: UserType
    proposalsLib?: BaseStageLibType
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
    const [proposals, setProposals] = useState<DocumentModel<ProposalModel>[]>(
        []
    )
    const [isFetching, setIsFetching] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        fetchProposals()
    }, [proposalsLib])

    const fetchProposals = async () => {
        try {
            setIsFetching(true)
            if (proposalsLib) {
                const _proposalDocs = await API.doc.multiQuery<ProposalModel>(
                    Object.keys(proposalsLib.lib)
                )

                if (!_proposalDocs)
                    throw new Error('Error while loading Proposals')
                setProposals(_proposalDocs)
            } else {
                setProposals([])
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
                        Your Proposals ({proposals.length})
                    </Text>
                    <Box pad={{ top: 'medium' }}>
                        {proposals && Object.keys(proposals).length > 0 ? (
                            <Box gap="small">
                                {proposals.map((proposalDoc) => (
                                    <ProposalListItem
                                        key={proposalDoc.streamID}
                                        currentUser={currentUser}
                                        proposalDoc={proposalDoc}
                                    />
                                ))}
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
