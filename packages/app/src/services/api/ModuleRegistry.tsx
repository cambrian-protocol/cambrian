import IPFSTextSubmitterUI, {
    IPFS_TEXT_SUBMITTER_MODULE_KEY,
} from '@cambrian/app/ui/customUIs/IPFSTextSubmitter/IPFSTextSubmitterUI'
import UnanimityUI, {
    UNANIMITY_MODULE_KEY,
} from '@cambrian/app/ui/customUIs/Unanimity/UnanimityUI'

import { ComposerModuleModel } from '@cambrian/app/models/ModuleModel'
import LOCAL_IPFSTextSubmitter from '@cambrian/core/deployments/localhost/IPFSTextSubmitter.json'
import LOCAL_Unanimity from '@cambrian/core/deployments/localhost/Unanimity.json'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'

type ModuleRegistryType = {
    [key: string]: ComposerModuleModel
}

const moduleRegistry: ModuleRegistryType = {}

moduleRegistry[IPFS_TEXT_SUBMITTER_MODULE_KEY] = {
    key: IPFS_TEXT_SUBMITTER_MODULE_KEY,
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
    deployments: {
        31337: LOCAL_IPFSTextSubmitter.address,
        // 3: ROPSTEN_IPFSTextSubmitter.address
    },
    component: IPFSTextSubmitterUI,
}

moduleRegistry[UNANIMITY_MODULE_KEY] = {
    key: UNANIMITY_MODULE_KEY,
    name: 'Unanimity',
    description:
        'Immediately confirm an outcome report, regardless of remaining timelock, if all recipients agree.',
    deployments: {
        31337: LOCAL_Unanimity.address,
        // 3: ROPSTEN_Unanimity.address
    },
    component: UnanimityUI,
}

export const ModuleRegistryAPI = {
    modules: moduleRegistry,
    module: function (key: string) {
        return moduleRegistry[key]
    },
}

export default ModuleRegistryAPI
