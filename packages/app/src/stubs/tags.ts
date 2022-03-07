import { SolidityDataTypes } from '../models/SolidityDataTypes'
import { SolverMetaDataModel } from '@cambrian/app/models/SolverMetaDataModel'

export const solversMetaData: SolverMetaDataModel = {
    title: 'Write Article',
    description: '',
    customUIULID: '',
    version: '1.0',
    tags: {
        keeper: {
            id: 'keeper',
            description:
                'The Keeper is responsible for selecting the Writer, executing & reporting the outcome of this solve.',
            dataTypes: [SolidityDataTypes.Address],
            label: 'Keeper',
            isFlex: false,
        },

        arbitrator: {
            id: 'arbitrator',
            description: 'This Solver has no arbitrator.',
            label: 'Arbitrator',
            dataTypes: [SolidityDataTypes.Address],
            isFlex: false,
        },

        data: {
            id: 'data',
            label: '',
            description:
                'The slot IDs containing the chosen Writer (1st) and Buyer (2nd)',
            dataTypes: [SolidityDataTypes.Bytes32],
            isFlex: false,
        },

        collateralToken: {
            id: 'collateralToken',
            description: 'ERC20 token being used as payment.',
            label: 'Collateral Token',
            dataTypes: [SolidityDataTypes.Address],
            isFlex: true,
        },

        timelockSeconds: {
            id: 'timelockSeconds',
            label: 'Timelock seconds',
            description:
                'The number of seconds which must pass between proposing and confirming outcome results without dispute.',
            dataTypes: [SolidityDataTypes.Uint256],
            isFlex: true,
        },

        '01FSP76J4J37AQM1WRZDY85CY3': {
            id: '01FSP76J4J37AQM1WRZDY85CY3',
            label: '',
            description: '0% (0 basis points). Used in allocations.',
            dataTypes: [SolidityDataTypes.Uint256],
            isFlex: false,
        },

        '01FSP76J4J9N3905P6M7JQFBD2': {
            id: '01FSP76J4J9N3905P6M7JQFBD2',
            label: '',
            description:
                '100% (10000 basis points). Used to specify all of the collateral in the Solver should be allocated.',
            dataTypes: [SolidityDataTypes.Uint256],
            isFlex: false,
        },

        '01FSP77T8YCZ3TK50BMB6NCC5W': {
            id: '01FSP77T8YCZ3TK50BMB6NCC5W',
            label: 'Keeper',
            description:
                'Contains the address of the Keeper for receiving payment.',
            dataTypes: [SolidityDataTypes.Address],
            isFlex: false,
        },

        '01FSP78E4KMM5HEQB09BD8T253': {
            id: '01FSP78E4KMM5HEQB09BD8T253',
            label: 'Writer (Bankless)',
            description:
                'To contain the address of the specified Writer. Must be added by the Keeper before solve can be executed.',
            dataTypes: [SolidityDataTypes.Address],
            isFlex: false,
        },

        '01FSP79JH6NFA733XX2DB5W5YT': {
            id: '01FSP79JH6NFA733XX2DB5W5YT',
            label: 'Treasury (Bankless)',
            description:
                'Contains the address of the BanklessDAO treasury for receiving payment.',
            dataTypes: [SolidityDataTypes.Address],
            isFlex: false,
        },

        '01FSP7A5ZZEXTNAMK5D8MHY93F': {
            id: '01FSP7A5ZZEXTNAMK5D8MHY93F',
            label: 'Cambrian Treasury',
            description:
                'Contains the address of the Cambrian treasury for receiving payment.',
            dataTypes: [SolidityDataTypes.Address],
            isFlex: false,
        },

        '01FSP7AJHMVFKHKTTCVX5MVCA7': {
            id: '01FSP7AJHMVFKHKTTCVX5MVCA7',
            label: 'Buyer',
            description:
                'Contains the address of the Buyer for receiving refunds.',
            dataTypes: [SolidityDataTypes.Address],
            isFlex: true,
        },

        '01FSP93R1E6ZV9QAB66PPDFDE3': {
            id: '01FSP93R1E6ZV9QAB66PPDFDE3',
            label: '',
            description: '90% (9000 basis points). Used in allocations.',
            dataTypes: [SolidityDataTypes.Uint256],
            isFlex: false,
        },

        '01FSP971A4PH6PSEC6SDHYB3R0': {
            id: '01FSP971A4PH6PSEC6SDHYB3R0',
            label: '',
            description: '4% (400 basis points). Used in allocations.',
            dataTypes: [SolidityDataTypes.Uint256],
            isFlex: false,
        },

        '01FSP97S7T6S6E98BZ7FQJJY20': {
            id: '01FSP97S7T6S6E98BZ7FQJJY20',
            label: '',
            description: '2% (200 basis points). Used in allocations.',
            dataTypes: [SolidityDataTypes.Uint256],
            isFlex: false,
        },
    },
}
