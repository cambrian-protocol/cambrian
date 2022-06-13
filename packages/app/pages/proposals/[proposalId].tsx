import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import Stagehand, { StageNames, Stages } from '@cambrian/app/classes/Stagehand'
import { useEffect, useState } from 'react'

import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import InteractionLayout from '@cambrian/app/components/layout/InteractionLayout'
import InvalidQueryComponent from '@cambrian/app/components/errors/InvalidQueryComponent'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalTemplateInfoComponent from '@cambrian/app/ui/proposals/ProposalTemplateInfoComponent'
import ProposalUI from '@cambrian/app/ui/proposals/ProposalUI'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import { getMultihashFromBytes32 } from '@cambrian/app/utils/helpers/multihash'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/dist/client/router'

export default function ProposalPage() {
    const router = useRouter()
    const { proposalId } = router.query
    const { currentUser } = useCurrentUser()

    const [metaStages, setMetaStages] = useState<Stages>()
    const [proposalTitle, setProposalTitle] = useState('Proposal')
    const [proposalsHub, setProposalsHub] = useState<ProposalsHub>()
    const [currentProposal, setCurrentProposal] = useState<ethers.Contract>()
    const [showInvalidQueryComponent, setShowInvalidQueryComponent] =
        useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isProposalExecuted, setIsProposalExecuted] = useState(false)

    useEffect(() => {
        if (router.isReady && currentUser.signer !== undefined) fetchProposal()
    }, [router, currentUser])

    const fetchProposal = async () => {
        // Fetch proposal from proposalsHub via proposalId and try to init metaStages
        if (
            proposalId !== undefined &&
            typeof proposalId === 'string' &&
            currentUser.signer &&
            currentUser.chainId
        ) {
            try {
                const proposalsHub = new ProposalsHub(
                    currentUser.signer,
                    currentUser.chainId
                )
                setProposalsHub(proposalsHub)
                const proposal = await proposalsHub.getProposal(
                    proposalId as string
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
                const metadataCIDString = getMultihashFromBytes32(
                    proposal.metadataCID
                )

                if (!metadataCIDString) throw GENERAL_ERROR['INVALID_METADATA']

                const stagehand = new Stagehand()
                const stages = await stagehand.loadStages(
                    metadataCIDString,
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
            {currentUser.signer ? (
                showInvalidQueryComponent ? (
                    <PageLayout contextTitle="Invalid Query">
                        <InvalidQueryComponent context={StageNames.proposal} />
                    </PageLayout>
                ) : proposalsHub && currentProposal ? (
                    <InteractionLayout
                        contextTitle={proposalTitle}
                        header={
                            <ProposalHeader
                                isProposalExecuted={isProposalExecuted}
                                proposalTitle={proposalTitle}
                            />
                        }
                        sidebar={
                            <ProposalUI
                                isProposalExecuted={isProposalExecuted}
                                setIsProposalExecuted={setIsProposalExecuted}
                                currentUser={currentUser}
                                proposal={currentProposal}
                                proposalsHub={proposalsHub}
                            />
                        }
                    >
                        <ProposalTemplateInfoComponent
                            proposalMetadata={
                                metaStages?.proposal as ProposalModel
                            }
                            templateMetadata={
                                metaStages?.template as TemplateModel
                            }
                        />
                    </InteractionLayout>
                ) : (
                    <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
                )
            ) : (
                <PageLayout contextTitle="Connect Wallet">
                    <ConnectWalletSection />
                </PageLayout>
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
