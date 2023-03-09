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

// import NOVA_ArbitrationDispatch from '@cambrian/core/deployments/nova/ArbitrationDispatch.json'
// import NOVA_ArbitratorFactory from '@cambrian/core/deployments/nova/ArbitratorFactory.json'
// import NOVA_BasicArbitrator from '@cambrian/core/deployments/nova/BasicArbitrator.json'
// import NOVA_BasicSolverV1 from '@cambrian/core/deployments/nova/BasicSolverV1.json'
// import NOVA_ConditionalTokens from '@cambrian/core/deployments/nova/ConditionalTokens.json'
// import NOVA_IPFSSolutionsHub from '@cambrian/core/deployments/nova/IPFSSolutionsHub.json'
// import NOVA_ProposalsHub from '@cambrian/core/deployments/nova/ProposalsHub.json'
// import NOVA_SolverFactory from '@cambrian/core/deployments/nova/SolverFactory.json'
// import NOVA_SolverLib from '@cambrian/core/deployments/nova/SolverLib.json'
// import NOVA_ToyToken from '@cambrian/core/deployments/nova/ToyToken.json'

export type ChainInfo = {
    name: string
    shortName: string
    chain: string
    network: string
    chainId: number
    networkId: number
    rpcUrl: string
    nativeCurrency: NativeCurrencyType
    logoURI?: string
    tokenListURI?: string
    bridgeURI?: string
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
            logoURI: '/images/logo/hardhat_logo.png',
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
        compositions: {
            Copywriter:
                'kjzl6cwe1jw145fuuak9g2ca5cpomea02x29fx43mjhowii1l7mlbdq84dim1ao',
        },
    },
    // 42170: {
    //     chainData: {
    //         name: 'Arbitrum Nova',
    //         shortName: 'arb-nova',
    //         chain: 'ETH',
    //         network: 'arbitrum-nova',
    //         chainId: 42170,
    //         networkId: 42170,
    //         rpcUrl: 'https://nova.arbitrum.io/rpc',
    //         nativeCurrency: {
    //             symbol: 'ETH',
    //             name: 'Ethereum',
    //             decimals: '18',
    //             contractAddress: '',
    //             balance: '',
    //         },
    //         logoURI: '/images/logo/arbitrum_nova_logo.svg',
    //     },
    //     contracts: {
    //         arbitratorFactory: NOVA_ArbitratorFactory.address,
    //         arbitrationDispatch: NOVA_ArbitrationDispatch.address,
    //         basicArbitrator: NOVA_BasicArbitrator.address,
    //         basicSolverV1: NOVA_BasicSolverV1.address,
    //         conditionalTokens: NOVA_ConditionalTokens.address,
    //         ipfsSolutionsHub: NOVA_IPFSSolutionsHub.address,
    //         proposalsHub: NOVA_ProposalsHub.address,
    //         solverFactory: NOVA_SolverFactory.address,
    //         solverLib: NOVA_SolverLib.address,
    //         toyToken: NOVA_ToyToken.address,
    //         defaultDenominationToken:
    //             '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
    //     },
    //     compositions: {},
    // },
    5: {
        chainData: {
            name: 'Görli',
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
            logoURI: '/images/logo/ethereum_logo.svg',
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
            Copywriter:
                'kjzl6cwe1jw145fuuak9g2ca5cpomea02x29fx43mjhowii1l7mlbdq84dim1ao',
        },
    },
    42161: {
        chainData: {
            name: 'Arbitrum One',
            shortName: 'arb-one',
            chain: 'ETH',
            network: 'arbitrum-one',
            chainId: 42161,
            networkId: 42161,
            rpcUrl: 'https://arbitrum-mainnet.infura.io/v3/5e58480c71ad4bf3bb584550df349e01',
            nativeCurrency: {
                symbol: 'ETH',
                name: 'Ethereum',
                decimals: '18',
                contractAddress: '',
                balance: '',
            },
            logoURI: '/images/logo/arbitrum_one_logo.svg',
            bridgeURI: 'https://bridge.arbitrum.io/',
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
        compositions: {
            'Basic Freelance/Bounty':
                'kjzl6cwe1jw145m83mnankqlsgypt2dawkuu0reuo31dm7sr9qi09t0pkw9ym7r', // owned by zkTRUTH
            'Foundation Grants':
                'k2t6wyfsu4pg2uu816phdx67e643et1sxpa8y3mfby27czk2fucbtlua0fn3iv', // owned by zkTRUTH
        },
    },
}
