import {
    AsteriskSimple,
    EnvelopeSimple,
    Handshake,
    RocketLaunch,
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
        desciption: string
        icon: JSX.Element
    }
}

export const CONDITION_STATUS_INFO: ConditionStatusDetailsType = {}

CONDITION_STATUS_INFO[ConditionStatus.Initiated] = {
    name: 'Initiated',
    desciption:
        'This Solver has just been initiated, if the Keeper has input all required data it can be progressed and the work can begin.',
    icon: <AsteriskSimple />,
}
CONDITION_STATUS_INFO[ConditionStatus.Executed] = {
    name: 'Executed',
    desciption: 'Work in progress',
    icon: <RocketLaunch />,
}
CONDITION_STATUS_INFO[ConditionStatus.OutcomeProposed] = {
    name: 'Outcome Proposed',
    desciption: 'An outcome has been proposed.',
    icon: <EnvelopeSimple />,
}
CONDITION_STATUS_INFO[ConditionStatus.ArbitrationRequested] = {
    name: 'Arbitration Requested',
    desciption: 'Arbitration has been requested',
    icon: <Scales />,
}
CONDITION_STATUS_INFO[ConditionStatus.ArbitrationDelivered] = {
    name: 'Arbitration Delivered',
    desciption: 'Arbitration has been deliviered',
    icon: <Scales />,
}
CONDITION_STATUS_INFO[ConditionStatus.OutcomeReported] = {
    name: 'Outcome Reported',
    desciption: 'An Outcome has been reported',
    icon: <Handshake />,
}
