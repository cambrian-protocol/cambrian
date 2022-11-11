import { SlotTagsHashMapType } from '../models/SlotTagModel'

export const DEFAULT_SLOT_TAGS: SlotTagsHashMapType = {
    keeper: {
        id: 'keeper',
        description: 'The Keeper reports outcomes and manages the Solver.',
        instruction:
            'Input the account or smart contract address which will manage this Solver.',
        isFlex: false,
        label: 'Keeper',
    },
    arbitrator: {
        id: 'arbitrator',
        description:
            'The Arbitrator may overrule a proposed outcome after a participant raises a dispute during the timelock window.',
        instruction:
            'Optionally input the account or smart contract address which will act as an arbitrator.',
        isFlex: false,
        label: 'Arbitrator',
    },
    collateralToken: {
        id: 'collateralToken',
        description:
            'The token to be used as payment. Beneficiaries may claim their funds after an outcome is reported.',
        instruction:
            'Input or select the token to be used as payment for this Solver.',
        isFlex: false,
        label: 'Collateral Token',
    },
    timelockSeconds: {
        id: 'timelockSeconds',
        description:
            'Length of time before a proposed outcome can be confirmed. Participants may request arbitration if they disagree with a proposed outcome and an Arbitrator has been designated.',
        instruction:
            'Input the duration of time, in seconds, that must pass without an arbitration requset before a proposed outcome can be confirmed.',
        isFlex: false,
        label: 'Timelock',
    },
}
