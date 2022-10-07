import ARBITRUM_ArbitrationDispatch from '@cambrian/core/deployments/arbitrum/ArbitrationDispatch.json'
import ARBITRUM_ArbitratorFactory from '@cambrian/core/deployments/arbitrum/ArbitratorFactory.json'
import ARBITRUM_BasicArbitrator from '@cambrian/core/deployments/arbitrum/BasicArbitrator.json'
import ARBITRUM_BasicSolverV1 from '@cambrian/core/deployments/arbitrum/BasicSolverV1.json'
import ARBITRUM_ConditionalTokens from '@cambrian/core/deployments/arbitrum/ConditionalTokens.json'
import ARBITRUM_IPFSSolutionsHub from '@cambrian/core/deployments/arbitrum/IPFSSolutionsHub.json'
import ARBITRUM_ProposalsHub from '@cambrian/core/deployments/arbitrum/ProposalsHub.json'
import ARBITRUM_SolverFactory from '@cambrian/core/deployments/arbitrum/SolverFactory.json'
import ARBITRUM_SolverLib from '@cambrian/core/deployments/arbitrum/SolverLib.json'
import ARBITRUM_ToyToken from '@cambrian/core/deployments/arbitrum/ToyToken.json'
import GOERLI_ArbitrationDispatch from '@cambrian/core/deployments/goerli/ArbitrationDispatch.json'
import GOERLI_ArbitratorFactory from '@cambrian/core/deployments/goerli/ArbitratorFactory.json'
import GOERLI_BasicArbitrator from '@cambrian/core/deployments/goerli/BasicArbitrator.json'
import GOERLI_BasicSolverV1 from '@cambrian/core/deployments/goerli/BasicSolverV1.json'
import GOERLI_ConditionalTokens from '@cambrian/core/deployments/goerli/ConditionalTokens.json'
import GOERLI_IPFSSolutionsHub from '@cambrian/core/deployments/goerli/IPFSSolutionsHub.json'
import GOERLI_ProposalsHub from '@cambrian/core/deployments/goerli/ProposalsHub.json'
import GOERLI_SolverFactory from '@cambrian/core/deployments/goerli/SolverFactory.json'
import GOERLI_SolverLib from '@cambrian/core/deployments/goerli/SolverLib.json'
import GOERLI_ToyToken from '@cambrian/core/deployments/goerli/ToyToken.json'
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
import NOVA_ArbitrationDispatch from '@cambrian/core/deployments/nova/ArbitrationDispatch.json'
import NOVA_ArbitratorFactory from '@cambrian/core/deployments/nova/ArbitratorFactory.json'
import NOVA_BasicArbitrator from '@cambrian/core/deployments/nova/BasicArbitrator.json'
import NOVA_BasicSolverV1 from '@cambrian/core/deployments/nova/BasicSolverV1.json'
import NOVA_ConditionalTokens from '@cambrian/core/deployments/nova/ConditionalTokens.json'
import NOVA_IPFSSolutionsHub from '@cambrian/core/deployments/nova/IPFSSolutionsHub.json'
import NOVA_ProposalsHub from '@cambrian/core/deployments/nova/ProposalsHub.json'
import NOVA_SolverFactory from '@cambrian/core/deployments/nova/SolverFactory.json'
import NOVA_SolverLib from '@cambrian/core/deployments/nova/SolverLib.json'
import NOVA_ToyToken from '@cambrian/core/deployments/nova/ToyToken.json'
import ROPSTEN_ArbitrationDispatch from '@cambrian/core/deployments/ropsten/ArbitrationDispatch.json'
import ROPSTEN_ArbitratorFactory from '@cambrian/core/deployments/ropsten/ArbitratorFactory.json'
import ROPSTEN_BasicArbitrator from '@cambrian/core/deployments/ropsten/BasicArbitrator.json'
import ROPSTEN_BasicSolverV1 from '@cambrian/core/deployments/ropsten/BasicSolverV1.json'
import ROPSTEN_ConditionalTokens from '@cambrian/core/deployments/ropsten/ConditionalTokens.json'
import ROPSTEN_IPFSSolutionsHub from '@cambrian/core/deployments/ropsten/IPFSSolutionsHub.json'
import ROPSTEN_ProposalsHub from '@cambrian/core/deployments/ropsten/ProposalsHub.json'
import ROPSTEN_SolverFactory from '@cambrian/core/deployments/ropsten/SolverFactory.json'
import ROPSTEN_SolverLib from '@cambrian/core/deployments/ropsten/SolverLib.json'
import ROPSTEN_ToyToken from '@cambrian/core/deployments/ropsten/ToyToken.json'

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

export type ContractAddresses = {
    [key: string]: string
}

export type ChainDataHashMapType = {
    [chainId: number]: {
        chainData: ChainInfo
        contracts: ContractAddresses
        compositions: { [title: string]: string }
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
            defaultDenominationToken:
                '0xc778417e063141139fce010982780140aa0cd5ab',
        },
        compositions: {},
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
            arbitratorFactory: ROPSTEN_ArbitratorFactory.address,
            arbitrationDispatch: ROPSTEN_ArbitrationDispatch.address,
            basicArbitrator: ROPSTEN_BasicArbitrator.address,
            basicSolverV1: ROPSTEN_BasicSolverV1.address,
            conditionalTokens: ROPSTEN_ConditionalTokens.address,
            ipfsSolutionsHub: ROPSTEN_IPFSSolutionsHub.address,
            proposalsHub: ROPSTEN_ProposalsHub.address,
            solverFactory: ROPSTEN_SolverFactory.address,
            solverLib: ROPSTEN_SolverLib.address,
            toyToken: ROPSTEN_ToyToken.address,
            defaultDenominationToken:
                '0xc778417e063141139fce010982780140aa0cd5ab',
        },
        compositions: {},
    },
    42170: {
        chainData: {
            name: 'Arbitrum Nova',
            shortName: 'arb-nova',
            chain: 'ETH',
            network: 'arbitrum-nova',
            chainId: 42170,
            networkId: 42170,
            rpcUrl: 'https://nova.arbitrum.io/rpc',
            nativeCurrency: {
                symbol: 'ETH',
                name: 'Ethereum',
                decimals: '18',
                contractAddress: '',
                balance: '',
            },
        },
        contracts: {
            arbitratorFactory: NOVA_ArbitratorFactory.address,
            arbitrationDispatch: NOVA_ArbitrationDispatch.address,
            basicArbitrator: NOVA_BasicArbitrator.address,
            basicSolverV1: NOVA_BasicSolverV1.address,
            conditionalTokens: NOVA_ConditionalTokens.address,
            ipfsSolutionsHub: NOVA_IPFSSolutionsHub.address,
            proposalsHub: NOVA_ProposalsHub.address,
            solverFactory: NOVA_SolverFactory.address,
            solverLib: NOVA_SolverLib.address,
            toyToken: NOVA_ToyToken.address,
            defaultDenominationToken:
                '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
        },
        compositions: {},
    },
    5: {
        chainData: {
            name: 'Goerli Test Network',
            shortName: 'gor',
            chain: 'ETH',
            network: 'goerli',
            chainId: 5,
            networkId: 5,
            rpcUrl: 'https://goerli.infura.io/v3/5e5e73b367364266b008aed15e5b3189',
            nativeCurrency: {
                symbol: 'ETH',
                name: 'Ethereum',
                decimals: '18',
                contractAddress: '',
                balance: '',
            },
        },
        contracts: {
            arbitratorFactory: GOERLI_ArbitratorFactory.address,
            arbitrationDispatch: GOERLI_ArbitrationDispatch.address,
            basicArbitrator: GOERLI_BasicArbitrator.address,
            basicSolverV1: GOERLI_BasicSolverV1.address,
            conditionalTokens: GOERLI_ConditionalTokens.address,
            ipfsSolutionsHub: GOERLI_IPFSSolutionsHub.address,
            proposalsHub: GOERLI_ProposalsHub.address,
            solverFactory: GOERLI_SolverFactory.address,
            solverLib: GOERLI_SolverLib.address,
            toyToken: GOERLI_ToyToken.address,
            defaultDenominationToken: GOERLI_ToyToken.address,
        },
        compositions: {
            'Basic Content Marketing Solver':
                'k2t6wyfsu4pfydj61yn24bnw5rfgv8hlkgjyusw2i96c12w9ttu8994ru5cty4',
            'Advanced Content Marketing Solver':
                'k2t6wyfsu4pfwt5vtpi8e1yje5cxosyhe380rmq16eaeajkvmjqkhu5yiq8qq1',
        },
    },
    42161: {
        chainData: {
            name: 'Arbitrum One',
            shortName: 'arb-one',
            chain: 'ETH',
            network: 'arbitrum-one',
            chainId: 421761,
            networkId: 42161,
            rpcUrl: 'https://arbitrum-mainnet.infura.io/v3/5e58480c71ad4bf3bb584550df349e01',
            nativeCurrency: {
                symbol: 'ETH',
                name: 'Ethereum',
                decimals: '18',
                contractAddress: '',
                balance: '',
            },
        },
        contracts: {
            arbitratorFactory: ARBITRUM_ArbitratorFactory.address,
            arbitrationDispatch: ARBITRUM_ArbitrationDispatch.address,
            basicArbitrator: ARBITRUM_BasicArbitrator.address,
            basicSolverV1: ARBITRUM_BasicSolverV1.address,
            conditionalTokens: ARBITRUM_ConditionalTokens.address,
            ipfsSolutionsHub: ARBITRUM_IPFSSolutionsHub.address,
            proposalsHub: ARBITRUM_ProposalsHub.address,
            solverFactory: ARBITRUM_SolverFactory.address,
            solverLib: ARBITRUM_SolverLib.address,
            toyToken: ARBITRUM_ToyToken.address,
            defaultDenominationToken:
                '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
        },
        compositions: {},
    },
}
