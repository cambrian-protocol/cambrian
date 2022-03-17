import { SlotTagsHashMapType } from './../models/SlotTagModel'
import { SolverTagModel } from '@cambrian/app/models/SolverTagModel'

export const solverTag: SolverTagModel = {
    title: 'Write Article',
    description: '',
    customUIULID: '',
    version: '1.0',
}

export const slotTags: SlotTagsHashMapType = {
    keeper: {
        id: 'keeper',
        description:
            'The Keeper is responsible for selecting the Writer, executing & reporting the outcome of this solve.',
        label: 'Keeper',
        isFlex: false,
    },

    arbitrator: {
        id: 'arbitrator',
        description: 'This Solver has no arbitrator.',
        label: 'Arbitrator',
        isFlex: false,
    },

    data: {
        id: 'data',
        label: '',
        description:
            'The slot IDs containing the chosen Writer (1st) and Buyer (2nd)',
        isFlex: false,
    },

    collateralToken: {
        id: 'collateralToken',
        description: 'ERC20 token being used as payment.',
        label: 'Collateral Token',
        isFlex: true,
    },

    timelockSeconds: {
        id: 'timelockSeconds',
        label: 'Timelock seconds',
        description:
            'The number of seconds which must pass between proposing and confirming outcome results without dispute.',
        isFlex: true,
    },

    '01FSP76J4J37AQM1WRZDY85CY3': {
        id: '01FSP76J4J37AQM1WRZDY85CY3',
        label: '',
        description: '0% (0 basis points). Used in allocations.',
        isFlex: false,
    },

    '01FSP76J4J9N3905P6M7JQFBD2': {
        id: '01FSP76J4J9N3905P6M7JQFBD2',
        label: '',
        description:
            '100% (10000 basis points). Used to specify all of the collateral in the Solver should be allocated.',
        isFlex: false,
    },

    '01FSP77T8YCZ3TK50BMB6NCC5W': {
        id: '01FSP77T8YCZ3TK50BMB6NCC5W',
        label: 'Keeper',
        description:
            'Contains the address of the Keeper for receiving payment.',
        isFlex: false,
    },

    '01FSP78E4KMM5HEQB09BD8T253': {
        id: '01FSP78E4KMM5HEQB09BD8T253',
        label: 'Writer (Bankless)',
        description:
            'To contain the address of the specified Writer. Must be added by the Keeper before solve can be executed.',
        isFlex: false,
    },

    '01FSP79JH6NFA733XX2DB5W5YT': {
        id: '01FSP79JH6NFA733XX2DB5W5YT',
        label: 'Treasury (Bankless)',
        description:
            'Contains the address of the BanklessDAO treasury for receiving payment.',
        isFlex: false,
    },

    '01FSP7A5ZZEXTNAMK5D8MHY93F': {
        id: '01FSP7A5ZZEXTNAMK5D8MHY93F',
        label: 'Cambrian Treasury',
        description:
            'Contains the address of the Cambrian treasury for receiving payment.',
        isFlex: false,
    },

    '01FSP7AJHMVFKHKTTCVX5MVCA7': {
        id: '01FSP7AJHMVFKHKTTCVX5MVCA7',
        label: 'Buyer',
        description: 'Contains the address of the Buyer for receiving refunds.',
        isFlex: true,
    },

    '01FSP93R1E6ZV9QAB66PPDFDE3': {
        id: '01FSP93R1E6ZV9QAB66PPDFDE3',
        label: '',
        description: '90% (9000 basis points). Used in allocations.',
        isFlex: false,
    },

    '01FSP971A4PH6PSEC6SDHYB3R0': {
        id: '01FSP971A4PH6PSEC6SDHYB3R0',
        label: '',
        description: '4% (400 basis points). Used in allocations.',
        isFlex: false,
    },

    '01FSP97S7T6S6E98BZ7FQJJY20': {
        id: '01FSP97S7T6S6E98BZ7FQJJY20',
        label: '',
        description: '2% (200 basis points). Used in allocations.',
        isFlex: false,
    },
}

const composition = {
    composition: {
        flowElements: [
            {
                id: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                type: 'solver',
                position: {
                    x: 300,
                    y: 180,
                },
                data: {
                    label: 'MVP Writer Solver',
                },
                style: {
                    border: 'white 2px solid',
                    borderRadius: '15px',
                },
            },
            {
                id: '01FSP76J4HE1ZK4M0C8W4RDH5A/01FSP76J4J0A82D7AZ272MCME8',
                type: 'oc',
                position: {
                    x: 180,
                    y: 420,
                },
                data: {
                    label: 'Outcome Collection #1',
                },
                style: {
                    border: 'none',
                    borderRadius: '15px',
                },
            },
            {
                id: 'e01FSP76J4HE1ZK4M0C8W4RDH5A-01FSP76J4HE1ZK4M0C8W4RDH5A/01FSP76J4J0A82D7AZ272MCME8',
                source: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                type: 'step',
                target: '01FSP76J4HE1ZK4M0C8W4RDH5A/01FSP76J4J0A82D7AZ272MCME8',
                style: {
                    border: 'none',
                },
            },
            {
                id: '01FSP76J4HE1ZK4M0C8W4RDH5A/01FSP7H7CAR321SYQN3VD0JMF3',
                type: 'oc',
                position: {
                    x: 460,
                    y: 420,
                },
                data: {
                    label: 'Outcome Collection',
                },
                style: {
                    border: 'none',
                    borderRadius: '15px',
                },
            },
            {
                id: 'e01FSP76J4HE1ZK4M0C8W4RDH5A-01FSP76J4HE1ZK4M0C8W4RDH5A/01FSP7H7CAR321SYQN3VD0JMF3',
                source: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                target: '01FSP76J4HE1ZK4M0C8W4RDH5A/01FSP7H7CAR321SYQN3VD0JMF3',
                type: 'step',
                style: {
                    border: 'none',
                },
            },
        ],
        solvers: [
            {
                id: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                iface: {},
                config: {
                    keeperAddress: {
                        address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
                        linkedSlots: ['01FSP77T8YCZ3TK50BMB6NCC5W'],
                    },
                    arbitratorAddress: {
                        address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
                        linkedSlots: [],
                    },
                    timelockSeconds: 0,
                    data: '',
                    slots: {
                        '01FSP76J4J37AQM1WRZDY85CY3': {
                            id: '01FSP76J4J37AQM1WRZDY85CY3',
                            slotType: 1,
                            dataTypes: ['uint256'],
                            data: [0],
                        },
                        '01FSP76J4J9N3905P6M7JQFBD2': {
                            id: '01FSP76J4J9N3905P6M7JQFBD2',
                            slotType: 1,
                            dataTypes: ['uint256'],
                            data: [10000],
                        },
                        '01FSP77T8YCZ3TK50BMB6NCC5W': {
                            id: '01FSP77T8YCZ3TK50BMB6NCC5W',
                            data: [
                                '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
                            ],
                            slotType: 1,
                            dataTypes: ['address'],
                            solverConfigAddress: {
                                type: 'Keeper',
                                solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                            },
                        },
                        '01FSP78E4KMM5HEQB09BD8T253': {
                            id: '01FSP78E4KMM5HEQB09BD8T253',
                            data: [''],
                            slotType: 3,
                            dataTypes: ['address'],
                            description: 'Writer (Bankless)',
                        },
                        '01FSP79JH6NFA733XX2DB5W5YT': {
                            id: '01FSP79JH6NFA733XX2DB5W5YT',
                            data: [
                                '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
                            ],
                            slotType: 1,
                            dataTypes: ['address'],
                            description: 'Treasury (Bankless)',
                        },
                        '01FSP7A5ZZEXTNAMK5D8MHY93F': {
                            id: '01FSP7A5ZZEXTNAMK5D8MHY93F',
                            data: [
                                '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
                            ],
                            slotType: 1,
                            dataTypes: ['address'],
                            description: 'Cambrians',
                        },
                        '01FSP7AJHMVFKHKTTCVX5MVCA7': {
                            id: '01FSP7AJHMVFKHKTTCVX5MVCA7',
                            data: [
                                '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                            ],
                            slotType: 1,
                            dataTypes: ['address'],
                            description: 'Buyer',
                        },
                        '01FSP93R1E6ZV9QAB66PPDFDE3': {
                            id: '01FSP93R1E6ZV9QAB66PPDFDE3',
                            data: [9000],
                            slotType: 1,
                            dataTypes: ['uint256'],
                        },
                        '01FSP971A4PH6PSEC6SDHYB3R0': {
                            id: '01FSP971A4PH6PSEC6SDHYB3R0',
                            data: [400],
                            slotType: 1,
                            dataTypes: ['uint256'],
                        },
                        '01FSP97S7T6S6E98BZ7FQJJY20': {
                            id: '01FSP97S7T6S6E98BZ7FQJJY20',
                            data: [200],
                            slotType: 1,
                            dataTypes: ['uint256'],
                        },
                    },
                    condition: {
                        outcomes: [
                            {
                                id: '01FSP7H2S0NA1M25ZZB3D04WTS',
                                title: 'Success',
                                uri: 'QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ',
                                description: 'Generic success outcome',
                            },
                            {
                                id: '01FSP7HMH2ZVKH2JARGMJ6PBZ4',
                                title: 'Failure',
                                uri: 'QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP',
                                description: 'Generic failure outcome',
                            },
                        ],
                        partition: [
                            {
                                id: '01FSP76J4J0A82D7AZ272MCME8',
                                outcomes: [
                                    {
                                        id: '01FSP7H2S0NA1M25ZZB3D04WTS',
                                        title: 'Success',
                                        uri: 'QmYZB6LDtGqqfJyhJDEp7rgFgEVSm7H7yyXZjhvCqVkYvZ',
                                        description: 'Generic success outcome',
                                    },
                                ],
                            },
                            {
                                id: '01FSP7H7CAR321SYQN3VD0JMF3',
                                outcomes: [
                                    {
                                        id: '01FSP7HMH2ZVKH2JARGMJ6PBZ4',
                                        title: 'Failure',
                                        uri: 'QmPrcQH4akfr7eSn4tQHmmudLdJpKhHskVJ5iqYxCks1FP',
                                        description: 'Generic failure outcome',
                                    },
                                ],
                            },
                        ],
                        recipients: [
                            {
                                solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                slotId: '01FSP77T8YCZ3TK50BMB6NCC5W',
                            },
                            {
                                solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                slotId: '01FSP78E4KMM5HEQB09BD8T253',
                            },
                            {
                                solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                slotId: '01FSP79JH6NFA733XX2DB5W5YT',
                            },
                            {
                                solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                slotId: '01FSP7A5ZZEXTNAMK5D8MHY93F',
                            },
                            {
                                solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                slotId: '01FSP7AJHMVFKHKTTCVX5MVCA7',
                            },
                        ],
                        recipientAmountSlots: {
                            '01FSP76J4J0A82D7AZ272MCME8': [
                                {
                                    recipient: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP77T8YCZ3TK50BMB6NCC5W',
                                    },
                                    amount: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP971A4PH6PSEC6SDHYB3R0',
                                    },
                                },
                                {
                                    recipient: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP78E4KMM5HEQB09BD8T253',
                                    },
                                    amount: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP93R1E6ZV9QAB66PPDFDE3',
                                    },
                                },
                                {
                                    recipient: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP79JH6NFA733XX2DB5W5YT',
                                    },
                                    amount: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP971A4PH6PSEC6SDHYB3R0',
                                    },
                                },
                                {
                                    recipient: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP7A5ZZEXTNAMK5D8MHY93F',
                                    },
                                    amount: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP97S7T6S6E98BZ7FQJJY20',
                                    },
                                },
                                {
                                    recipient: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP7AJHMVFKHKTTCVX5MVCA7',
                                    },
                                    amount: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP76J4J37AQM1WRZDY85CY3',
                                    },
                                },
                            ],
                            '01FSP7H7CAR321SYQN3VD0JMF3': [
                                {
                                    recipient: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP77T8YCZ3TK50BMB6NCC5W',
                                    },
                                    amount: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP971A4PH6PSEC6SDHYB3R0',
                                    },
                                },
                                {
                                    recipient: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP78E4KMM5HEQB09BD8T253',
                                    },
                                    amount: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP76J4J37AQM1WRZDY85CY3',
                                    },
                                },
                                {
                                    recipient: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP79JH6NFA733XX2DB5W5YT',
                                    },
                                    amount: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP971A4PH6PSEC6SDHYB3R0',
                                    },
                                },
                                {
                                    recipient: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP7A5ZZEXTNAMK5D8MHY93F',
                                    },
                                    amount: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP97S7T6S6E98BZ7FQJJY20',
                                    },
                                },
                                {
                                    recipient: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP7AJHMVFKHKTTCVX5MVCA7',
                                    },
                                    amount: {
                                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                                        slotId: '01FSP93R1E6ZV9QAB66PPDFDE3',
                                    },
                                },
                            ],
                        },
                        amountSlot: '01FSP76J4J9N3905P6M7JQFBD2',
                    },
                    collateralToken:
                        '0x0165878A594ca255338adfa4d48449f69242Eb8F',
                    implementation:
                        '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
                },
                slotTags: {
                    '01FSP78E4KMM5HEQB09BD8T253': {
                        id: '01FSP78E4KMM5HEQB09BD8T253',
                        label: 'Writer (Bankless)',
                        description: '',
                        isFlex: false,
                    },
                    '01FSP79JH6NFA733XX2DB5W5YT': {
                        id: '01FSP79JH6NFA733XX2DB5W5YT',
                        label: 'Bankless Treasury ',
                        description: '',
                        isFlex: false,
                    },
                    '01FSP7A5ZZEXTNAMK5D8MHY93F': {
                        id: '01FSP7A5ZZEXTNAMK5D8MHY93F',
                        label: 'Treasury Cambrian',
                        description: '',
                        isFlex: false,
                    },
                    '01FSP7AJHMVFKHKTTCVX5MVCA7': {
                        id: '01FSP7AJHMVFKHKTTCVX5MVCA7',
                        label: 'Buyer',
                        description: '',
                        isFlex: false,
                    },
                },
                solverTag: {
                    title: 'MVP Writer Solver',
                    description: 'This is the solver descriptioin',
                    version: '1.0',
                    avatar: '',
                    banner: '',
                },
            },
        ],
        currentElement: {
            id: '01FSP76J4HE1ZK4M0C8W4RDH5A',
            type: 'solver',
            position: {
                x: 300,
                y: 180,
            },
            data: {
                label: 'MVP Writer Solver',
            },
        },
        currentIdPath: {
            solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
        },
    },
}
