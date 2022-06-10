import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import Stagehand, { StageNames, Stages } from '@cambrian/app/classes/Stagehand'
import { useEffect, useState } from 'react'

import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import InvalidQueryComponent from '@cambrian/app/components/errors/InvalidQueryComponent'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ProposalUI from '@cambrian/app/ui/proposals/ProposalUI'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
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
                    <PageLayout contextTitle={proposalTitle}>
                        <ProposalUI
                            currentUser={currentUser}
                            proposal={currentProposal}
                            proposalsHub={proposalsHub}
                            metaStages={metaStages}
                        />
                    </PageLayout>
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
