import { SolutionModel } from '@cambrian/app/models/SolutionModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { ethers } from 'ethers'
import { solvers, tags } from '@cambrian/app/stubs/tags'

const ERC20_ABI =
    require('@cambrian/core/artifacts/contracts/ToyToken.sol/ToyToken.json').abi

const IPFSSOLUTIONSHUB_ABI =
    require('@cambrian/core/artifacts/contracts/IPFSSolutionsHub.sol/IPFSSolutionsHub.json').abi

export type SolutionResponseType = {
    solution: SolutionModel
}

export const CompositionAPI = {
    getCompositionFromCID: async (cid: string): Promise<any> => {
        // Dummy
        let response = solvers
        solvers[0].tags = tags

        return response
    },
}
