import { Contract, ethers } from 'ethers'
import React, { PropsWithChildren, useEffect, useState } from 'react'

import { SolverConfigModel } from '../models/SolverConfigModel'
import { useCurrentUser } from '../hooks/useCurrentUser'

const IPFS_SOLUTIONS_HUB_ABI =
    require('@artifacts/contracts/IPFSSolutionsHub.sol/IPFSSolutionsHub.json').abi

export type IPFSSolutionsHubContextType = {
    getIPFSSolutionsHubAddress: () => string
    IPFSSolutionsHubContract: Contract | undefined
    getSolvers: (solutionId: string) => Promise<string[] | undefined | null>
}
export const IPFSSolutionsHubContext =
    React.createContext<IPFSSolutionsHubContextType>({
        getIPFSSolutionsHubAddress: () => '',
        IPFSSolutionsHubContract: undefined,
        getSolvers: async () => null,
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

    const getIPFSSolutionsHubAddress = () => {
        if (!IPFSSolutionsHub)
            throw new Error('No User or IPFS Solutions Hub Contract defined')

        return IPFSSolutionsHub.address
    }

    const getSolvers = async (
        solutionId: string
    ): Promise<string[] | undefined> => {
        if (IPFSSolutionsHub) {
            try {
                const solverAddresses = await IPFSSolutionsHub.getSolvers(
                    solutionId
                )
                return solverAddresses
            } catch (e) {
                console.log(e)
            }
        }
    }

    return (
        <IPFSSolutionsHubContext.Provider
            value={{
                IPFSSolutionsHubContract: IPFSSolutionsHub,
                getIPFSSolutionsHubAddress: getIPFSSolutionsHubAddress,
                getSolvers: getSolvers,
            }}
        >
            {children}
        </IPFSSolutionsHubContext.Provider>
    )
}
