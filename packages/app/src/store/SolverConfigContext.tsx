import {
    ParsedSolverModel,
    SolverConfig,
} from '@cambrian/app/models/SolverModel'
import React, { PropsWithChildren, useState } from 'react'

import { DEFAULT_ABI } from '@cambrian/app/constants'
import { ethers } from 'ethers'
import { useCurrentUserOrSigner } from '@cambrian/app/hooks/useCurrentUserOrSigner'

export type SolverContextType = {
    currentSolverConfig: ParsedSolverModel | null
    currentSolverContract: ethers.Contract | null
    loadSolverConfig: (solverAddress?: string) => void
}

export const SolverContext = React.createContext<SolverContextType>({
    currentSolverConfig: null,
    currentSolverContract: null,
    loadSolverConfig: () => {},
})

export const SolverContextProvider = ({ children }: PropsWithChildren<{}>) => {
    const [currentSolverConfig, setCurrentSolverConfig] =
        useState<ParsedSolverModel | null>(null)

    const [currentSolverContract, setCurrentSolverContract] =
        useState<ethers.Contract | null>(null)

    const loadSolverConfig = (solverAddress?: string) => {
        const { currentSigner } = useCurrentUserOrSigner()
        if (solverAddress !== undefined && currentSigner) {
            const solverContract = new ethers.Contract(
                solverAddress,
                DEFAULT_ABI,
                currentSigner
            )
            const solverConfigRes = solverContract
                .connect(currentSigner)
                .getConfig()
            setCurrentSolverContract(solverContract)
            setCurrentSolverConfig(solverConfigRes)
        } else {
            setCurrentSolverConfig(null)
        }
    }

    return (
        <SolverContext.Provider
            value={{
                currentSolverConfig,
                currentSolverContract,
                loadSolverConfig,
            }}
        >
            {children}
        </SolverContext.Provider>
    )
}
