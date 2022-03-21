import {
    AsteriskSimple,
    Envelope,
    Handshake,
    RocketLaunch,
    Scales,
} from 'phosphor-react'

type ConditionStatusDetailsType = {
    [statusCode: number]: { name: string; label: string; icon: JSX.Element }
}

export const CONDITION_STATUS_DETAILS: ConditionStatusDetailsType = {
    0: {
        name: 'Initiated',
        label: 'Initiated',
        icon: <AsteriskSimple />,
    },
    1: {
        name: 'Executed',
        label: 'Executed',
        icon: <RocketLaunch />,
    },
    2: {
        name: 'OutcomeProposed',
        label: 'Outcome proposed',
        icon: <Envelope />,
    },
    3: {
        name: 'ArbitrationRequested',
        label: 'Arbitration requested',
        icon: <Scales />,
    },
    4: {
        name: 'ArbitrationPending',
        label: 'Arbitration pending',
        icon: <Scales />,
    },
    5: {
        name: 'ArbitrationDelivered',
        label: 'Arbitration delivered',
        icon: <Scales />,
    },
    6: {
        name: 'OutcomeReported',
        label: 'Outcome confirmed',
        icon: <Handshake />,
    },
}
