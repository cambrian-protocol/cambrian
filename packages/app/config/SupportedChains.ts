import LOCAL_ArbitrationDispatch from '@cambrian/core/deployments/localhost/ArbitrationDispatch.json'
import LOCAL_ArbitratorFactory from '@cambrian/core/deployments/localhost/ArbitratorFactory.json'
import LOCAL_BasicArbitrator from '@cambrian/core/deployments/localhost/BasicArbitrator.json'
import LOCAL_BasicSolverV1 from '@cambrian/core/deployments/localhost/BasicSolverV1.json'
import LOCAL_ConditionalTokens from '@cambrian/core/deployments/localhost/ConditionalTokens.json'
import LOCAL_IPFSSolutionsHub from '@cambrian/core/deployments/localhost/IPFSSolutionsHub.json'
import LOCAL_ProposalsHub from '@cambrian/core/deployments/localhost/ProposalsHub.json'
import LOCAL_SolverFactory from '@cambrian/core/deployments/localhost/SolverFactory.json'
import LOCAL_SolverLib from '@cambrian/core/deployments/localhost/SolverLib.json'
import LOCAL_ToyToken from '@cambrian/core/deployments/localhost/ToyToken.json'
import LOCAL_WriterSolverV1 from '@cambrian/core/deployments/localhost/WriterSolverV1.json'

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
    arbitratorFactory?: string // Only hardhat
    arbitrationDispatch: string
    basicArbitrator?: string // Only hardhat
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
            chainId: 31337,
            networkId: 31337,
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
            arbitratorFactory: LOCAL_ArbitratorFactory.address,
            arbitrationDispatch: LOCAL_ArbitrationDispatch.address,
            basicArbitrator: LOCAL_BasicArbitrator.address,
            basicSolverV1: LOCAL_BasicSolverV1.address,
            conditionalTokens: LOCAL_ConditionalTokens.address,
            ipfsSolutionsHub: LOCAL_IPFSSolutionsHub.address,
            proposalsHub: LOCAL_ProposalsHub.address,
            solverFactory: LOCAL_SolverFactory.address,
            solverLib: LOCAL_SolverLib.address,
            toyToken: LOCAL_ToyToken.address,
            writerSolverV1: LOCAL_WriterSolverV1.address,
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
