import { DEFAULT_ABI } from './../constants/index'
import { SolverModel } from './../models/SolverModel'
import { Tags } from '../models/TagModel'
import { ethers } from 'ethers'
import { getBytes32FromMultihash } from '../utils/helpers/multihash'
import { SolidityDataTypes } from '../models/SolidityDataTypes'

export const configs = {
    implementation: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
    keeper: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    arbitrator: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    timelockSeconds: 10,
    data: ethers.utils.defaultAbiCoder.encode(
        ['bytes32', 'bytes32'],
        [
            ethers.utils.formatBytes32String('01FSP78E4KMM5HEQB09BD8T253'),
            ethers.utils.formatBytes32String('01FSP7AJHMVFKHKTTCVX5MVCA7'),
        ]
    ),
    ingests: [
        {
            executions: 0,
            ingestType: 1,
            slot: '0x303146535037364a344a333741514d3157525a44593835435933000000000000',
            solverIndex: 0,
            data: '0x0000000000000000000000000000000000000000000000000000000000000000',
        },
        {
            executions: 0,
            ingestType: 1,
            slot: '0x303146535037364a344a394e3339303550364d374a5146424432000000000000',
            solverIndex: 0,
            data: '0x0000000000000000000000000000000000000000000000000000000000002710',
        },
        {
            executions: 0,
            ingestType: 1,
            slot: '0x30314653503737543859435a33544b3530424d42364e43433557000000000000',
            solverIndex: 0,
            data: '0x0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc',
        },
        {
            executions: 0,
            ingestType: 3,
            slot: '0x3031465350373845344b4d4d3548455142303942443854323533000000000000',
            solverIndex: 0,
            data: '0x0000000000000000000000000000000000000000000000000000000000000000',
        },
        {
            executions: 0,
            ingestType: 1,
            slot: '0x303146535037394a48364e464137333358583244423557355954000000000000',
            solverIndex: 0,
            data: '0x0000000000000000000000009965507d1a55bcc2695c58ba16fb37d819b0a4dc',
        },
        {
            executions: 0,
            ingestType: 1,
            slot: '0x30314653503741355a5a4558544e414d4b3544384d4859393346000000000000',
            solverIndex: 0,
            data: '0x00000000000000000000000015d34aaf54267db7d7c367839aaf71a00a2c6a65',
        },
        {
            executions: 0,
            ingestType: 1,
            slot: '0x303146535037414a484d56464b484b5454435658354d56434137000000000000',
            solverIndex: 0,
            data: '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        },
        {
            executions: 0,
            ingestType: 1,
            slot: '0x30314653503933523145365a5639514142363650504446444533000000000000',
            solverIndex: 0,
            data: '0x0000000000000000000000000000000000000000000000000000000000002328',
        },
        {
            executions: 0,
            ingestType: 1,
            slot: '0x3031465350393731413450483650534543365344485942335230000000000000',
            solverIndex: 0,
            data: '0x0000000000000000000000000000000000000000000000000000000000000190',
        },
        {
            executions: 0,
            ingestType: 1,
            slot: '0x30314653503937533754365336453938425a3746514a4a593230000000000000',
            solverIndex: 0,
            data: '0x00000000000000000000000000000000000000000000000000000000000000c8',
        },
    ],
    conditionBase: {
        collateralToken: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
        outcomeSlots: 2,
        parentCollectionIndexSet: 0,
        partition: [1, 2],
        amountSlot:
            '0x303146535037364a344a394e3339303550364d374a5146424432000000000000',
        allocations: [
            {
                recipientAddressSlot:
                    '0x30314653503737543859435a33544b3530424d42364e43433557000000000000',
                recipientAmountSlots: [
                    '0x3031465350393731413450483650534543365344485942335230000000000000',
                    '0x3031465350393731413450483650534543365344485942335230000000000000',
                ],
            },
            {
                recipientAddressSlot:
                    '0x3031465350373845344b4d4d3548455142303942443854323533000000000000',
                recipientAmountSlots: [
                    '0x30314653503933523145365a5639514142363650504446444533000000000000',
                    '0x303146535037364a344a333741514d3157525a44593835435933000000000000',
                ],
            },
            {
                recipientAddressSlot:
                    '0x303146535037394a48364e464137333358583244423557355954000000000000',
                recipientAmountSlots: [
                    '0x3031465350393731413450483650534543365344485942335230000000000000',
                    '0x3031465350393731413450483650534543365344485942335230000000000000',
                ],
            },
            {
                recipientAddressSlot:
                    '0x30314653503741355a5a4558544e414d4b3544384d4859393346000000000000',
                recipientAmountSlots: [
                    '0x30314653503937533754365336453938425a3746514a4a593230000000000000',
                    '0x30314653503937533754365336453938425a3746514a4a593230000000000000',
                ],
            },
            {
                recipientAddressSlot:
                    '0x303146535037414a484d56464b484b5454435658354d56434137000000000000',
                recipientAmountSlots: [
                    '0x303146535037364a344a333741514d3157525a44593835435933000000000000',
                    '0x30314653503933523145365a5639514142363650504446444533000000000000',
                ],
            },
        ],
        outcomeURIs: [
            getBytes32FromMultihash(
                'QmdgzwhGvmfDspsUnznnijbQLP9rEBZKCUU1yykUXpv4CZ'
            ),
            getBytes32FromMultihash(
                'QmaNcVRBZfFypLi4tKLyt7jqmzV3DU96QFPhzjs84tJAZa'
            ),
        ],
    },
}

export const tags = <Tags>{
    keeper: {
        id: 'keeper',
        text: 'The Keeper is responsible for selecting the Writer, executing & reporting the outcome of this solve.',
        isFlex: false,
    },

    arbitrator: {
        id: 'arbitrator',
        text: 'This Solver has no arbitrator.',
        isFlex: false,
    },

    data: {
        id: 'data',
        text: 'The slot IDs containing the chosen Writer (1st) and Buyer (2nd)',
        isFlex: false,
    },

    collateralToken: {
        id: 'collateralToken',
        text: 'ERC20 token being used as payment.',
        isFlex: true,
    },

    timelockSeconds: {
        id: 'timelockSeconds',
        text: 'The number of seconds which must pass between proposing and confirming outcome results without dispute.',
        isFlex: true,
    },

    '01FSP76J4J37AQM1WRZDY85CY3': {
        id: '01FSP76J4J37AQM1WRZDY85CY3',
        text: '0% (0 basis points). Used in allocations.',
        isFlex: false,
    },

    '01FSP76J4J9N3905P6M7JQFBD2': {
        id: '01FSP76J4J9N3905P6M7JQFBD2',
        text: '100% (10000 basis points). Used to specify all of the collateral in the Solver should be allocated.',
        isFlex: false,
    },

    '01FSP77T8YCZ3TK50BMB6NCC5W': {
        id: '01FSP77T8YCZ3TK50BMB6NCC5W',
        text: 'Contains the address of the Keeper for receiving payment.',
        isFlex: false,
    },

    '01FSP78E4KMM5HEQB09BD8T253': {
        id: '01FSP78E4KMM5HEQB09BD8T253',
        text: 'To contain the address of the specified Writer. Must be added by the Keeper before solve can be executed.',
        isFlex: false,
    },

    '01FSP79JH6NFA733XX2DB5W5YT': {
        id: '01FSP79JH6NFA733XX2DB5W5YT',
        text: 'Contains the address of the BanklessDAO treasury for receiving payment.',
        isFlex: false,
    },

    '01FSP7A5ZZEXTNAMK5D8MHY93F': {
        id: '01FSP7A5ZZEXTNAMK5D8MHY93F',
        text: 'Contains the address of the Cambrian treasury for receiving payment.',
        isFlex: false,
    },

    '01FSP7AJHMVFKHKTTCVX5MVCA7': {
        id: '01FSP7AJHMVFKHKTTCVX5MVCA7',
        text: 'Contains the address of the Buyer for receiving refunds.',
        isFlex: true,
    },

    '01FSP93R1E6ZV9QAB66PPDFDE3': {
        id: '01FSP93R1E6ZV9QAB66PPDFDE3',
        text: '90% (9000 basis points). Used in allocations.',
        isFlex: false,
    },

    '01FSP971A4PH6PSEC6SDHYB3R0': {
        id: '01FSP971A4PH6PSEC6SDHYB3R0',
        text: '4% (400 basis points). Used in allocations.',
        isFlex: false,
    },

    '01FSP97S7T6S6E98BZ7FQJJY20': {
        id: '01FSP97S7T6S6E98BZ7FQJJY20',
        text: '2% (200 basis points). Used in allocations.',
        isFlex: false,
    },
}

export const solversMetaData: SolverModel[] = [
    {
        id: '01FSP76J4HE1ZK4M0C8W4RDH5A',
        title: 'Write Article',
        iface: new ethers.utils.Interface(DEFAULT_ABI),
        tags: tags,
        config: {
            // implementation: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
            keeperAddress: {
                address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
                linkedSlots: ['01FSP77T8YCZ3TK50BMB6NCC5W'],
            },
            arbitratorAddress: {
                address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
                linkedSlots: [],
            },
            timelockSeconds: 0,
            data: ethers.utils.defaultAbiCoder.encode(
                ['bytes32', 'bytes32'],
                [
                    ethers.utils.formatBytes32String(
                        '01FSP78E4KMM5HEQB09BD8T253'
                    ),
                    ethers.utils.formatBytes32String(
                        '01FSP7AJHMVFKHKTTCVX5MVCA7'
                    ),
                ]
            ),
            slots: {
                '01FSP76J4J37AQM1WRZDY85CY3': {
                    id: '01FSP76J4J37AQM1WRZDY85CY3',
                    slotType: 1,
                    dataTypes: [SolidityDataTypes.Uint256],
                    data: [0],
                },
                '01FSP76J4J9N3905P6M7JQFBD2': {
                    id: '01FSP76J4J9N3905P6M7JQFBD2',
                    slotType: 1,
                    dataTypes: [SolidityDataTypes.Uint256],
                    data: [10000],
                },
                '01FSP77T8YCZ3TK50BMB6NCC5W': {
                    id: '01FSP77T8YCZ3TK50BMB6NCC5W',
                    data: ['0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'],
                    slotType: 1,
                    dataTypes: [SolidityDataTypes.Address],
                    description: 'Keeper',
                    solverConfigAddress: {
                        type: 'Keeper',
                        solverId: '01FSP76J4HE1ZK4M0C8W4RDH5A',
                    },
                },
                '01FSP78E4KMM5HEQB09BD8T253': {
                    id: '01FSP78E4KMM5HEQB09BD8T253',
                    data: [''],
                    slotType: 3,
                    dataTypes: [SolidityDataTypes.Address],
                    description: 'Writer (Bankless)',
                },
                '01FSP79JH6NFA733XX2DB5W5YT': {
                    id: '01FSP79JH6NFA733XX2DB5W5YT',
                    data: ['0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc'],
                    slotType: 1,
                    dataTypes: [SolidityDataTypes.Address],
                    description: 'Treasury (Bankless)',
                },
                '01FSP7A5ZZEXTNAMK5D8MHY93F': {
                    id: '01FSP7A5ZZEXTNAMK5D8MHY93F',
                    data: ['0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'],
                    slotType: 1,
                    dataTypes: [SolidityDataTypes.Address],
                    description: 'Cambrians',
                },
                '01FSP7AJHMVFKHKTTCVX5MVCA7': {
                    id: '01FSP7AJHMVFKHKTTCVX5MVCA7',
                    data: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
                    slotType: 1,
                    dataTypes: [SolidityDataTypes.Address],
                    description: 'Buyer',
                },
                '01FSP93R1E6ZV9QAB66PPDFDE3': {
                    id: '01FSP93R1E6ZV9QAB66PPDFDE3',
                    data: [9000],
                    slotType: 1,
                    dataTypes: [SolidityDataTypes.Uint256],
                },
                '01FSP971A4PH6PSEC6SDHYB3R0': {
                    id: '01FSP971A4PH6PSEC6SDHYB3R0',
                    data: [400],
                    slotType: 1,
                    dataTypes: [SolidityDataTypes.Uint256],
                },
                '01FSP97S7T6S6E98BZ7FQJJY20': {
                    id: '01FSP97S7T6S6E98BZ7FQJJY20',
                    data: [200],
                    slotType: 1,
                    dataTypes: [SolidityDataTypes.Uint256],
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
            collateralToken: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
        },
    },
]
