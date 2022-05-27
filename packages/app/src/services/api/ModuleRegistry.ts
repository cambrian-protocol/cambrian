import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'

export type RegisteredModule = {
    key: string
    name: string
    description: string
    dataInputs?: {
        type: SolidityDataTypes
        default: string
        label: string
    }[]
    supportedChains: number[]
}

type Registry = {
    [key: string]: RegisteredModule
}

// TODO
const moduleRegistry: Registry = {
    ipfsTextSubmitter: {
        key: 'ipfsTextSubmitter',
        name: 'IPFS Text Submitter',
        description:
            'Enables a UI for an approved user to submit text through IPFS and record the submission in an on-chain event.',
        dataInputs: [
            {
                type: SolidityDataTypes.Bytes32,
                default: '',
                label: 'Slot containing the approved submitter address',
            },
        ],
        supportedChains: [31337],
    },
    unanimity: {
        key: 'unanimity',
        name: 'Unanimity',
        description:
            'Immediately confirm an outcome report, regardless of remaining timelock, if all recipients agree.',
        dataInputs: [],
        supportedChains: [31337],
    },
}

export const ModuleRegistryAPI = {
    modules: moduleRegistry,
    module: function (key: string) {
        return moduleRegistry[key]
    },
}

export default ModuleRegistryAPI
