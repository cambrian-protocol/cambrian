import { Heading, Text } from 'grommet'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import InteractionLayout from '@cambrian/app/components/layout/InteractionLayout'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import ProposalSidebar from './ProposalSidebar'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'

interface ProposalUIProps {
    currentUser: UserType
    proposalStreamID: string
    ceramicProposal?: CeramicProposalModel
    proposalContract?: ethers.Contract
    ceramicTemplate?: CeramicTemplateModel
    proposalsHub?: ProposalsHub
    proposalStatus: ProposalStatus
    updateProposal: () => Promise<void>
}

const ProposalUI = ({
    currentUser,
    ceramicProposal,
    proposalContract,
    ceramicTemplate,
    proposalsHub,
    proposalStatus,
    proposalStreamID,
    updateProposal,
}: ProposalUIProps) => {
    /* 
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
*/

    return (
        <>
            {proposalStatus !== undefined ? (
                <InteractionLayout
                    contextTitle={ceramicProposal?.title || 'Proposal'}
                    proposalHeader={
                        <ProposalHeader
                            proposalTitle={ceramicProposal?.title}
                            proposalStatus={proposalStatus}
                            ceramicTemplate={ceramicTemplate}
                        />
                    }
                    sidebar={
                        <ProposalSidebar
                            ceramicTemplate={ceramicTemplate}
                            ceramicProposal={ceramicProposal}
                            updateProposal={updateProposal}
                            proposalStreamID={proposalStreamID}
                            currentUser={currentUser}
                            proposalStatus={proposalStatus}
                            proposalContract={proposalContract}
                            proposalsHub={proposalsHub}
                        />
                    }
                >
                    <Heading>TODO Proposal Plain readonly view</Heading>
                    <Text>{ceramicProposal?.description}</Text>
                </InteractionLayout>
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
            )}
        </>
    )
}

export default ProposalUI
