import { RegisteredCoreDataInput } from '@cambrian/app/ui/composer/controls/solver/general/ComposerSolverCoreDataInputControl'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'

type RegisteredSolver = {
    name: string
    dataLabel?: string
    coreDataInputs?: RegisteredCoreDataInput[]
}

type Registry = {
    [address: string]: RegisteredSolver
}

// TODO
const stubRegistry: Registry = {
    '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6': {
        name: 'Writer Solver',
        dataLabel:
            'Whitelisted submitters and chatters are controlled here. If the Writer and Buyer are moved to a different slot, these inputs must be updated.',
        coreDataInputs: [
            {
                type: SolidityDataTypes.Bytes32,
                default: '01FSP78E4KMM5HEQB09BD8T253',
                label: 'Slot containing the Writer address.',
            },
            {
                type: SolidityDataTypes.Bytes32,
                default: '01FSP7AJHMVFKHKTTCVX5MVCA7',
                label: 'Slot containing the Buyer address',
            },
        ],
    },
    '0xfdF811AD6ab1cF19314Da81CE3D21d7D1DFf7089': {
        name: 'Writer Solver',
        dataLabel:
            'Whitelisted submitters and chatters are controlled here. If the Writer and Buyer are moved to a different slot, these inputs must be updated.',
        coreDataInputs: [
            {
                type: SolidityDataTypes.Bytes32,
                default: '01FSP78E4KMM5HEQB09BD8T253',
                label: 'Slot containing the Writer address.',
            },
            {
                type: SolidityDataTypes.Bytes32,
                default: '01FSP7AJHMVFKHKTTCVX5MVCA7',
                label: 'Slot containing the Buyer address',
            },
        ],
    },
}

export const SolverRegisteryAPI = {
    dataInputsFromImplementation: async function (implementation: string) {
        if (stubRegistry[implementation] !== undefined) {
            return stubRegistry[implementation].coreDataInputs
        }
    },
    dataLabelFromImplementation: async function (implementation: string) {
        if (stubRegistry[implementation] !== undefined) {
            return stubRegistry[implementation].dataLabel
        }
    },
}

export default SolverRegisteryAPI
