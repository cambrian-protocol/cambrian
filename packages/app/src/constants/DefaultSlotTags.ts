import { SlotTagsHashMapType } from '../models/SlotTagModel'

export const DEFAULT_SLOT_TAGS: SlotTagsHashMapType = {
    keeper: {
        id: 'keeper',
        description:
            'This account will have the permission input required data during a solve and propose an outcome.',
        isFlex: false,
        label: 'Keeper',
    },
    arbitrator: {
        id: 'arbitrator',
        description:
            'This account will have the permission to overwrite a proposed outcome if any of the recipients raise a dispute and request the arbitration service.',
        isFlex: false,
        label: 'Arbitrator',
    },
    collateralToken: {
        id: 'collateralToken',
        description:
            'This ERC20 Token is used as the currency of this Solver. It receives them as funds and allocates them accordingly after an outcome is confirmed.',
        isFlex: false,
        label: 'Collateral Token',
    },
    timelockSeconds: {
        id: 'timelockSeconds',
        description:
            'This time has to pass before a proposed outcome can be confirmed. It gives every recipient the possibility to raise arbitration in case he disagrees with the proposed outcome.',
        isFlex: false,
        label: 'Timelock',
    },
}
