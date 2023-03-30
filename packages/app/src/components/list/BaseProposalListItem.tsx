import { useEffect, useState } from 'react'

import BaseSolverCard from '../cards/BaseSolverCard'
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../modals/ErrorPopupModal'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalService from '@cambrian/app/services/stages/ProposalService'
import ProposalStatusBadge from '../badges/ProposalStatusBadge'
import TemplateService from '@cambrian/app/services/stages/TemplateService'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface ProposalCardProps {
    proposalDoc: DocumentModel<ProposalModel>
    currentUser: UserType
}

const ProposalCard = ({ proposalDoc, currentUser }: ProposalCardProps) => {
    const [proposal, setProposal] = useState<Proposal>()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        fetchInfo()
    }, [])

    const fetchInfo = async () => {
        try {
            const proposalService = new ProposalService()
            const proposalConfig = await proposalService.fetchProposalConfig(
                proposalDoc,
                currentUser
            )
            if (!proposalConfig)
                throw new Error('Failed to load Proposal Config')

            const _proposal = new Proposal(
                proposalConfig,
                new ProposalService(),
                new TemplateService(),
                () => {},
                currentUser
            )

            setProposal(_proposal)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
    }

    return (
        <>
            {proposal && (
                <BaseSolverCard
                    type={'Proposal'}
                    title={proposal.content.title}
                    description={proposal.content.description}
                    streamID={proposal.doc.streamID}
                    statusBadge={
                        <ProposalStatusBadge
                            status={proposal.status}
                            onChainProposalId={proposal.onChainProposal?.id}
                        />
                    }
                />
            )}
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default ProposalCard
