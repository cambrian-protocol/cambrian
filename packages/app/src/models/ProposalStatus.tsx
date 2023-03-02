import {
    CheckCircle,
    Coins,
    Eye,
    FileDotted,
    FileX,
    PaperPlaneRight,
    PencilSimpleLine,
    Question,
    RocketLaunch,
} from 'phosphor-react'

export enum ProposalStatus {
    Unknown,
    Draft,
    Submitted,
    OnReview,
    ChangeRequested,
    Modified,
    Canceled,
    Approved,
    Funding,
    Executed,
}

type ProposalStatusDetailsType = {
    [statusCode: number]: {
        name: string
        description: string
        icon: JSX.Element
        color: string
    }
}

export const PROPOSAL_STATUS_INFO: ProposalStatusDetailsType = {}

PROPOSAL_STATUS_INFO[ProposalStatus.Unknown] = {
    name: 'Unknown',
    icon: <Question />,
    description: 'No status.',
    color: 'status-initiated',
}
PROPOSAL_STATUS_INFO[ProposalStatus.Draft] = {
    name: 'Draft',
    icon: <FileDotted />,
    description: 'Proposal has not been submitted to the Seller.',
    color: 'grey',
}
PROPOSAL_STATUS_INFO[ProposalStatus.OnReview] = {
    name: 'On Review',
    icon: <Eye />,
    description: 'Proposal is being reviewed',
    color: 'status-executed',
}
PROPOSAL_STATUS_INFO[ProposalStatus.Submitted] = {
    name: 'Submitted',
    icon: <PaperPlaneRight />,
    description: 'Proposal has been submitted to the Seller.',
    color: 'status-executed',
}
PROPOSAL_STATUS_INFO[ProposalStatus.Canceled] = {
    name: 'Canceled',
    icon: <FileX />,
    description:
        'Proposal has been declined by the templater or deleted by the proposer.',
    color: 'status-error',
}
PROPOSAL_STATUS_INFO[ProposalStatus.ChangeRequested] = {
    name: 'Change Requested',
    icon: <PencilSimpleLine />,
    description: 'The Seller requested some changes.',
    color: 'status-warning',
}
PROPOSAL_STATUS_INFO[ProposalStatus.Modified] = {
    name: 'Modified',
    icon: <PencilSimpleLine />,
    description:
        'You have modified this proposal. It has not been submitted to the Seller',
    color: 'accent-3',
}
PROPOSAL_STATUS_INFO[ProposalStatus.Approved] = {
    name: 'Approved',
    icon: <CheckCircle />,
    description: 'Proposal has been accepted by the Seller.',
    color: 'brand',
}
PROPOSAL_STATUS_INFO[ProposalStatus.Funding] = {
    name: 'Funding',
    icon: <Coins />,
    description: 'Proposal can receive funding.',
    color: 'status-arbitration',
}
PROPOSAL_STATUS_INFO[ProposalStatus.Executed] = {
    name: 'Executed',
    icon: <RocketLaunch />,
    description: 'Proposal is fully funded and currently ongoing.',
    color: 'status-reported',
}
