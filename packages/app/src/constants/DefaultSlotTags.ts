import { SlotTagsHashMapType } from '../models/SlotTagModel'

export const DEFAULT_SLOT_TAGS: SlotTagsHashMapType = {
    keeper: {
        slotId: 'keeper',
        description: 'The Keeper reports outcomes and manages the Solver.',
        instruction:
            'Input the account or smart contract address which will manage this Solver.',
        isFlex: 'None',
        label: 'Keeper',
    },
    arbitrator: {
        slotId: 'arbitrator',
        description:
            'The Arbitrator may overrule a proposed outcome after a participant raises a dispute during the timelock.',
        instruction:
            'Input the account or smart contract address which will act as an arbitrator.',
        isFlex: 'None',
        label: 'Arbitrator',
    },
    collateralToken: {
        slotId: 'collateralToken',
        description:
            'The token to be used as payment. Beneficiaries may claim their funds after an outcome is reported.',
        instruction:
            'Input or select the token to be used as payment for this Solver.',
        isFlex: 'None',
        label: 'Collateral Token',
    },
    timelockSeconds: {
        slotId: 'timelockSeconds',
        description:
            'Length of time before a proposed outcome can be confirmed. Participants may request arbitration if they disagree with a proposed outcome and an Arbitrator has been designated.',
        instruction:
            'Input the duration of time, in seconds, that must pass without an arbitration requset before a proposed outcome can be confirmed.',
        isFlex: 'None',
        label: 'Timelock',
    },
}
