import { ModuleModel } from '@cambrian/app/models/ModuleModel'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'

type ModuleRegistryType = {
    [key: string]: ModuleModel
}

const moduleRegistry: ModuleRegistryType = {
    ipfsTextSubmitter: {
        key: 'ipfsTextSubmitter',
        name: 'IPFS Text Submitter',
        description:
            'Enables a UI for an approved user to submit text through IPFS and record the submission in an on-chain event.',
        dataInputs: [
            {
                type: SolidityDataTypes.Bytes32,
                value: '',
                label: 'Submitter',
                description: 'Slot containing the approved submitter address',
            },
        ],
        supportedChains: [31337],
    },
    unanimity: {
        key: 'unanimity',
        name: 'Unanimity',
        description:
            'Immediately confirm an outcome report, regardless of remaining timelock, if all recipients agree.',
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
