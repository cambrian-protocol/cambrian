import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import Stagehand, { Stages } from '@cambrian/app/classes/Stagehand'
import { useEffect, useState } from 'react'

import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import InteractionLayout from '@cambrian/app/components/layout/InteractionLayout'
import InvalidQueryComponent from '@cambrian/app/components/errors/InvalidQueryComponent'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalSidebar from './ProposalSidebar'
import ProposalTemplateInfoComponent from './ProposalTemplateInfoComponent'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { StageNames } from '@cambrian/app/classes/CeramicStagehand'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'

interface ProposalUIProps {
    currentUser: UserType
}

const ProposalUI = ({ currentUser }: ProposalUIProps) => {
    const router = useRouter()
    const { proposalID } = router.query

    const [metaStages, setMetaStages] = useState<Stages>()
    const [proposalTitle, setProposalTitle] = useState<string>()
    const [proposalsHub, setProposalsHub] = useState<ProposalsHub>()
    const [currentProposal, setCurrentProposal] = useState<ethers.Contract>()
    const [showInvalidQueryComponent, setShowInvalidQueryComponent] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isProposalExecuted, setIsProposalExecuted] = useState(false)

    useEffect(() => {
        if (router.isReady) fetchProposal()
    }, [router])

    const fetchProposal = async () => {
        // Fetch proposal from proposalsHub via proposalId and try to init metaStages
        if (proposalID !== undefined && typeof proposalID === 'string') {
            try {
                const proposalsHub = new ProposalsHub(
                    currentUser.signer,
                    currentUser.chainId
                )
                setProposalsHub(proposalsHub)
                const proposal = await proposalsHub.getProposal(
                    proposalID as string
                )
                initMetaStages(proposal)
                setIsProposalExecuted(await proposal.isExecuted)
                return setCurrentProposal(proposal)
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        }
        setShowInvalidQueryComponent(true)
    }

    const initMetaStages = async (proposal: ethers.Contract) => {
        if (proposal.metadataCID) {
            try {
                if (!proposal.metadataCID)
                    throw GENERAL_ERROR['INVALID_METADATA']

                // TODO Ceramic integration
                const stagehand = new Stagehand()
                const stages = await stagehand.loadStages(
                    proposal.metadataCID,
                    StageNames.proposal
                )

                if (!stages) throw GENERAL_ERROR['IPFS_FETCH_ERROR']

                const proposalMetadata = stages.proposal as ProposalModel

                if (!proposalMetadata) throw GENERAL_ERROR['INVALID_METADATA']

                setProposalTitle(proposalMetadata.title)
                setMetaStages(stages)
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        }
    }

    return (
        <>
            {proposalsHub && currentProposal ? (
                <InteractionLayout
                    contextTitle={proposalTitle || 'Proposal'}
                    proposalHeader={
                        <ProposalHeader
                            isProposalExecuted={isProposalExecuted}
                            proposalTitle={proposalTitle}
                        />
                    }
                    sidebar={
                        <ProposalSidebar
                            isProposalExecuted={isProposalExecuted}
                            setIsProposalExecuted={setIsProposalExecuted}
                            currentUser={currentUser}
                            proposal={currentProposal}
                            proposalsHub={proposalsHub}
                        />
                    }
                >
                    <ProposalTemplateInfoComponent
                        proposalMetadata={metaStages?.proposal as ProposalModel}
                        templateMetadata={metaStages?.template as TemplateModel}
                    />
                </InteractionLayout>
            ) : showInvalidQueryComponent ? (
                <PageLayout contextTitle="Invalid Identifier">
                    <InvalidQueryComponent context={StageNames.proposal} />
                </PageLayout>
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
            )}
            {errorMessage && (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            )}
        </>
    )
}

export default ProposalUI
