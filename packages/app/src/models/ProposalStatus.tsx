import {
    Activity,
    CheckCircle,
    Coins,
    Eye,
    FileDotted,
    PencilSimpleLine,
    Question,
} from 'phosphor-react'

export enum ProposalStatus {
    Unknown,
    Draft,
    OnReview,
    ChangeRequested,
    Modified,
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
    name: 'DRAFT',
    icon: <FileDotted />,
    description: 'Proposal has not been submitted to the Seller.',
    color: 'grey',
}
PROPOSAL_STATUS_INFO[ProposalStatus.OnReview] = {
    name: 'ON REVIEW',
    icon: <Eye />,
    description:
        'Proposal has been submitted to the Seller and needs approval.',
    color: 'status-executed',
}
PROPOSAL_STATUS_INFO[ProposalStatus.ChangeRequested] = {
    name: 'CHANGE REQUESTED',
    icon: <PencilSimpleLine />,
    description: 'The Seller requested some changes.',
    color: 'status-warning',
}
PROPOSAL_STATUS_INFO[ProposalStatus.Modified] = {
    name: 'MODIFIED',
    icon: <PencilSimpleLine />,
    description:
        'You have modified this proposal. It has not been submitted to the Seller',
    color: 'accent-3',
}
PROPOSAL_STATUS_INFO[ProposalStatus.Approved] = {
    name: 'APPROVED',
    icon: <CheckCircle />,
    description: 'Proposal has been accepted by the Seller.',
    color: 'brand',
}
PROPOSAL_STATUS_INFO[ProposalStatus.Funding] = {
    name: 'FUNDING',
    icon: <Coins />,
    description: 'Proposal can receive funding.',
    color: 'status-arbitration',
}
PROPOSAL_STATUS_INFO[ProposalStatus.Executed] = {
    name: 'ACTIVE',
    icon: <Activity />,
    description: 'Proposal is fully funded and currently ongoing.',
    color: 'status-reported',
}
