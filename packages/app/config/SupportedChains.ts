interface ChainInfo {
    name: string
    shortName: string
    chain: string
    network: string
    chainId: number
    networkId: number
    rpcUrl: string
    nativeCurrency: NativeCurrencyType
}

interface NativeCurrencyType {
    symbol: string
    name: string
    decimals: string
    contractAddress: string
    balance?: string
}

type ContractAddresses = {
    arbitrationDispatch: string
    basicSolverV1: string
    conditionalTokens: string
    ipfsSolutionsHub: string
    proposalsHub: string
    solverFactory: string
    solverLib: string
    toyToken: string
    writerSolverV1: string
    defaultDenominationToken: string
}

export type ChainDataHashMapType = {
    [chainId: number]: {
        chainData: ChainInfo
        contracts: ContractAddresses
    }
}

export const SUPPORTED_CHAINS: ChainDataHashMapType = {
    31337: {
        chainData: {
            name: 'Hardhat',
            shortName: 'eth',
            chain: 'ETH',
            network: 'mainnet',
            chainId: 1,
            networkId: 1,
            rpcUrl: 'localhost:8545',
            nativeCurrency: {
                symbol: 'ETH',
                name: 'Ethereum',
                decimals: '18',
                contractAddress: '',
                balance: '',
            },
        },
        contracts: {
            arbitrationDispatch: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
            basicSolverV1: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
            conditionalTokens: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            ipfsSolutionsHub: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
            proposalsHub: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
            solverFactory: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            solverLib: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
            toyToken: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
            writerSolverV1: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
            defaultDenominationToken:
                '0xc778417e063141139fce010982780140aa0cd5ab',
        },
    },
    3: {
        chainData: {
            name: 'Ropsten Test Network',
            shortName: 'rop',
            chain: 'ETH',
            network: 'ropsten',
            chainId: 3,
            networkId: 3,
            rpcUrl: 'https://ropsten.infura.io/v3/5e5e73b367364266b008aed15e5b3189',
            nativeCurrency: {
                symbol: 'ETH',
                name: 'Ethereum',
                decimals: '18',
                contractAddress: '',
                balance: '',
            },
        },
        contracts: {
            arbitrationDispatch: '0xc2F13443363872D99c547F625c3aDa538365dCe7',
            basicSolverV1: '0x65ac197455032b0A94E428b018562Ea279F171ea',
            conditionalTokens: '0x73B7504BD7cBfed499dA21804a4Dc13935f3be4F',
            ipfsSolutionsHub: '0xD919c530225588b59BE7379B1a95dC314d47b9B2',
            proposalsHub: '0x9E8764A8131f6b361f6039082a18aa920EdF20a2',
            solverFactory: '0x7886965945c7ECcd9C57EdF6b5119EFB7c272A79',
            solverLib: '0x8E9c2816D50079732669ad32E15be20fE3D9b1Dc',
            toyToken: '0x4c7C2e0e069497D559fc74E0f53E88b5b889Ee79',
            writerSolverV1: '0xfdF811AD6ab1cF19314Da81CE3D21d7D1DFf7089',
            defaultDenominationToken:
                '0xc778417e063141139fce010982780140aa0cd5ab',
        },
    },
}
