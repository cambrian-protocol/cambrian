import { SolutionModel } from '@cambrian/app/models/SolutionModel'
import { fetchTokenModelFromAddress } from './etherscan/ERC20TokenTransferEvents'

export type SolutionResponseType = {
    solution: SolutionModel
}

export const SolutionsHubAPI = {
    getSolutionFromSolutionId: async (
        solutionId: string
    ): Promise<SolutionResponseType> => {
        // TODO fetch solution

        // Fetch collateralToken name and symbol
        const collateralToken = await fetchTokenModelFromAddress(
            '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'
        )

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
