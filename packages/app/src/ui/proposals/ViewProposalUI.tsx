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

interface ViewProposalUIProps {
    currentUser: UserType
    proposalStreamID: string
    ceramicProposal?: CeramicProposalModel
    proposalContract?: ethers.Contract
    ceramicTemplate?: CeramicTemplateModel
    proposalsHub?: ProposalsHub
    proposalStatus: ProposalStatus
    updateProposal: () => Promise<void>
}

// TODO Rename to ProposalUI and delete legacy ProposalUI
const ViewProposalUI = ({
    currentUser,
    ceramicProposal,
    proposalContract,
    ceramicTemplate,
    proposalsHub,
    proposalStatus,
    proposalStreamID,
    updateProposal,
}: ViewProposalUIProps) => {
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

export default ViewProposalUI
