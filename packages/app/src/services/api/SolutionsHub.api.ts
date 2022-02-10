import { SolutionModel } from '@cambrian/app/models/SolutionModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { ethers } from 'ethers'

const ERC20_ABI =
    require('@cambrian/core/artifacts/contracts/ToyToken.sol/ToyToken.json').abi

const IPFSSOLUTIONSHUB_ABI =
    require('@cambrian/core/artifacts/contracts/IPFSSolutionsHub.sol/IPFSSolutionsHub.json').abi

export type SolutionResponseType = {
    solution: SolutionModel
}

export const SolutionsHubAPI = {
    getSolutionFromSolutionId: async (
        solutionId: string,
        provider: ethers.providers.Web3Provider
    ): Promise<SolutionResponseType> => {
        const solutionsHubContract = new ethers.Contract(
            '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
            new ethers.utils.Interface(IPFSSOLUTIONSHUB_ABI),
            provider
        )

        const solution = await solutionsHubContract.solutions(solutionId)

        const erc20Contract = new ethers.Contract(
            solution.collateralToken,
            new ethers.utils.Interface(ERC20_ABI),
            provider
        )

        const collateralToken = <TokenModel>{
            tokenName: '',
            tokenSymbol: '',
            address: solution.collateralToken,
        }

        try {
            collateralToken.tokenName = await erc20Contract.name()
        } catch (e) {
            console.log(e)
        }
        try {
            collateralToken.tokenSymbol = await erc20Contract.symbol()
        } catch (e) {
            console.log(e)
        }

        // Dummy
        const response = {
            data: {
                solution: {
                    id: solutionId,
                    isExecuted: false,
                    collateralToken: collateralToken,
                    keeper: '0x194ba7A048627fb546fCAFBA8a4e8cA3DB588239', // Account 1
                    proposalsHub: '0x918759185791918751',
                    proposalId: '',
                    solverConfigsHash: '0x918759185791918751',
                    solverConfigsCID: '0x918759185791918751',
                    solverAddresses: [''],
                    seller: {
                        name: '@banklessDAO',
                        pfp: 'https://pbs.twimg.com/profile_images/1389400052448247816/qsOU0pih_400x400.jpg',
                    },
                },
            },
        }

        return response.data
    },
}
