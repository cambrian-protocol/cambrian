import { Contract, ContractTransaction, ethers } from 'ethers'
import React, { PropsWithChildren, useEffect, useState } from 'react'

import { SolverConfigModel } from '../models/SolverConfigModel'
import { getBytes32FromMultihash } from '../utils/helpers/multihash'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { SolutionsHubAPI } from '../services/api/SolutionsHub.api'

const IPFS_SOLUTIONS_HUB_ABI =
    require('@artifacts/contracts/IPFSSolutionsHub.sol/IPFSSolutionsHub.json').abi

export type IPFSSolutionsHubContextType = {
    getIPFSSolutionsHubAddress: () => string
    createSolution: (
        solutionId: string,
        collateralToken: string,
        solverConfigs: SolverConfigModel[],
        solverConfigsCID: string
    ) => Promise<ContractTransaction | null>
    contract: Contract | undefined
}
export const IPFSSolutionsHubContext =
    React.createContext<IPFSSolutionsHubContextType>({
        getIPFSSolutionsHubAddress: () => '',
        createSolution: async () => null,
        contract: undefined,
    })

export const IPFSSolutionsHubContextProvider = ({
    children,
}: PropsWithChildren<{}>) => {
    const { currentUser } = useCurrentUser()
    const [IPFSSolutionsHub, setIPFSSolutionsHub] = useState<ethers.Contract>()

    useEffect(() => {
        if (currentUser && process.env.NEXT_PUBLIC_IPFS_SOLUTIONS_HUB_ADDRESS) {
            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_IPFS_SOLUTIONS_HUB_ADDRESS,
                new ethers.utils.Interface(IPFS_SOLUTIONS_HUB_ABI),
                currentUser.signer
            )
            setIPFSSolutionsHub(contract)
        }
    }, [currentUser])

    const onCreateSolution = async (
        solutionId: string,
        collateralToken: string,
        solverConfigs: SolverConfigModel[],
        solverConfigsCID: string
    ) => {
        if (!IPFSSolutionsHub || !currentUser)
            throw new Error('No User or IPFS Solutions Hub Contract defined')

        return IPFSSolutionsHub.connect(currentUser.signer).createSolution(
            solutionId,
            collateralToken,
            solverConfigs,
            getBytes32FromMultihash(solverConfigsCID)
        )
    }

    const getIPFSSolutionsHubAddress = () => {
        if (!IPFSSolutionsHub || !currentUser)
            throw new Error('No User or IPFS Solutions Hub Contract defined')

        return IPFSSolutionsHub.address
    }

    return (
        <IPFSSolutionsHubContext.Provider
            value={{
                contract: IPFSSolutionsHub,
                createSolution: onCreateSolution,
                getIPFSSolutionsHubAddress: getIPFSSolutionsHubAddress,
            }}
        >
            {children}
        </IPFSSolutionsHubContext.Provider>
    )
}
