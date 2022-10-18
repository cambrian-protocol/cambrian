import {
    AsteriskSimple,
    EnvelopeSimple,
    Handshake,
    Play,
    Scales,
} from 'phosphor-react'

export enum ConditionStatus {
    Initiated,
    Executed,
    OutcomeProposed,
    ArbitrationRequested,
    ArbitrationDelivered,
    OutcomeReported,
}

type ConditionStatusDetailsType = {
    [statusCode: number]: {
        name: string
        description: string
        icon: JSX.Element
        color: string
    }
}

export const CONDITION_STATUS_INFO: ConditionStatusDetailsType = {}

CONDITION_STATUS_INFO[ConditionStatus.Initiated] = {
    name: 'INITIATED',
    description:
        'This Solver has just been initiated, if the Keeper has input all required data it can be progressed and the work can begin.',
    icon: <AsteriskSimple />,
    color: 'status-initiated',
}
CONDITION_STATUS_INFO[ConditionStatus.Executed] = {
    name: 'SOLVING',
    description: 'Work in progress',
    icon: <Play />,
    color: 'status-executed',
}
CONDITION_STATUS_INFO[ConditionStatus.OutcomeProposed] = {
    name: 'Outcome Proposed',
    description: 'An outcome has been proposed.',
    icon: <EnvelopeSimple />,
    color: 'status-proposed',
}
CONDITION_STATUS_INFO[ConditionStatus.ArbitrationRequested] = {
    name: 'Arbitration Requested',
    description: 'Arbitration has been requested',
    icon: <Scales />,
    color: 'status-arbitration',
}
CONDITION_STATUS_INFO[ConditionStatus.ArbitrationDelivered] = {
    name: 'Arbitration Delivered',
    description: 'Arbitration has been deliviered',
    icon: <Scales />,
    color: 'status-reported',
}
CONDITION_STATUS_INFO[ConditionStatus.OutcomeReported] = {
    name: 'Outcome Reported',
    description: 'An Outcome has been reported',
    icon: <Handshake />,
    color: 'status-reported',
}
