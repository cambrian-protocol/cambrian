import WriterSolverUI from '@cambrian/app/src/ui/solvers/writerSolverV1/WriterSolverUI'
import { SolidityDataTypes } from '../models/SolidityDataTypes'

export default {
    ui: WriterSolverUI,
    name: 'Writer Solver',
    networks: {
        localhost: {
            address: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
            // compositionNode: <CID>
        },
    },
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
    solverTags: {}, // TODO
}
