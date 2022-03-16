import { ContractReceipt, ContractTransaction, ethers } from 'ethers'
import React, { PropsWithChildren, useEffect, useState } from 'react'

import { DEFAULT_ABI } from '../constants'
import { SolverModel } from '../models/SolverModel'
import { useCurrentUser } from '../hooks/useCurrentUser'

const FACTORY_ABI =
    require('@artifacts/contracts/SolverFactory.sol/SolverFactory.json').abi

export type SolverFactoryContextType = {
    deploySolvers: (solvers: SolverModel[]) => Promise<string[]>
}
export const SolverFactoryContext =
    React.createContext<SolverFactoryContextType>({
        deploySolvers: async () => [],
    })

export const SolverFactoryContextProvider = ({
    children,
}: PropsWithChildren<{}>) => {
    const { currentUser, currentProvider } = useCurrentUser()
    const [solverFactory, setSolverFactory] = useState<ethers.Contract>()

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_SOLVER_FACTORY_ADDRESS) {
            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_SOLVER_FACTORY_ADDRESS,
                new ethers.utils.Interface(FACTORY_ABI),
                ethers.getDefaultProvider()
            )
            setSolverFactory(contract)
        }
    }, [])

    const onDeploySolvers = async (
        solvers: SolverModel[]
    ): Promise<string[]> => {
        if (!solverFactory || !currentUser || !currentProvider)
            throw new Error('No User or Solver Factory Contract defined')

        const deployedSolverAddresses: string[] = []
        const deployedSolvers: ethers.Contract[] = []
        const promises: Promise<{}>[] = []

        const tx: ContractTransaction = await solverFactory
            .connect(currentUser.signer)
            .createSolver(ethers.constants.AddressZero, 0, solvers[0].config)

        const receipt: ContractReceipt = await tx.wait()
        if (receipt && receipt.events) {
            deployedSolvers.push(
                new ethers.Contract(
                    ethers.utils.defaultAbiCoder.decode(
                        ['address'],
                        receipt.events[0].data
                    )[0],
                    DEFAULT_ABI,
                    currentProvider
                )
            )

            // Deploy solver chain
            if (solvers.length > 0) {
                solvers.forEach((solver, index) => {
                    if (index > 0) {
                        let p = deployedSolvers[index - 1]
                            .connect(currentUser.signer)
                            .deployChild(solver.config)
                            .then((tx: ContractTransaction) => tx.wait())
                            .then((receipt: ContractReceipt) => {
                                if (receipt && receipt.events) {
                                    deployedSolvers.push(
                                        new ethers.Contract(
                                            ethers.utils.defaultAbiCoder.decode(
                                                ['address'],
                                                receipt.events[0].data
                                            )[0],
                                            DEFAULT_ABI,
                                            currentProvider
                                        )
                                    )
                                }
                            })
                        promises.push(p)
                    }
                })
            }
        }

        await Promise.all(promises)

        deployedSolvers.forEach((solver) =>
            deployedSolverAddresses.push(solver.address)
        )

        return deployedSolverAddresses
    }

    return (
        <SolverFactoryContext.Provider
            value={{ deploySolvers: onDeploySolvers }}
        >
            {children}
        </SolverFactoryContext.Provider>
    )
}
