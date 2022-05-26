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
import ROPSTEN_ArbitrationDispatch from '@cambrian/core/deployments/ropsten/ArbitrationDispatch.json'
import ROPSTEN_BasicSolverV1 from '@cambrian/core/deployments/ropsten/BasicSolverV1.json'
import ROPSTEN_ConditionalTokens from '@cambrian/core/deployments/ropsten/ConditionalTokens.json'
import ROPSTEN_IPFSSolutionsHub from '@cambrian/core/deployments/ropsten/IPFSSolutionsHub.json'
import ROPSTEN_ProposalsHub from '@cambrian/core/deployments/ropsten/ProposalsHub.json'
import ROPSTEN_SolverFactory from '@cambrian/core/deployments/ropsten/SolverFactory.json'
import ROPSTEN_SolverLib from '@cambrian/core/deployments/ropsten/SolverLib.json'
import ROPSTEN_ToyToken from '@cambrian/core/deployments/ropsten/ToyToken.json'
import ROPSTEN_WriterSolverV1 from '@cambrian/core/deployments/ropsten/WriterSolverV1.json'

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
            arbitrationDispatch: ROPSTEN_ArbitrationDispatch.address,
            basicSolverV1: ROPSTEN_BasicSolverV1.address,
            conditionalTokens: ROPSTEN_ConditionalTokens.address,
            ipfsSolutionsHub: ROPSTEN_IPFSSolutionsHub.address,
            proposalsHub: ROPSTEN_ProposalsHub.address,
            solverFactory: ROPSTEN_SolverFactory.address,
            solverLib: ROPSTEN_SolverLib.address,
            toyToken: ROPSTEN_ToyToken.address,
            writerSolverV1: ROPSTEN_WriterSolverV1.address,
            defaultDenominationToken:
                '0xc778417e063141139fce010982780140aa0cd5ab',
        },
    },
}
