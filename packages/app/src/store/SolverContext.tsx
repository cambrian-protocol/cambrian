import React, { PropsWithChildren, SetStateAction, useState } from 'react'
import {
    SolverContractCondition,
    SolverContractData,
} from '@cambrian/app/models/SolverModel'

export type SolverContextType = {
    currentSolverData?: SolverContractData
    setCurrentSolverData: React.Dispatch<
        SetStateAction<SolverContractData | undefined>
    >
    currentCondition?: SolverContractCondition
    setCurrentCondition: React.Dispatch<
        SetStateAction<SolverContractCondition | undefined>
    >
}

export const SolverContext = React.createContext<SolverContextType>({
    currentSolverData: undefined,
    setCurrentSolverData: () => {},
    currentCondition: undefined,
    setCurrentCondition: () => {},
})

export const SolverContextProvider = ({ children }: PropsWithChildren<{}>) => {
    const [currentSolverData, setCurrentSolverData] =
        useState<SolverContractData>()
    const [currentCondition, setCurrentCondition] =
        useState<SolverContractCondition>()

    return (
        <SolverContext.Provider
            value={{
                currentCondition,
                setCurrentCondition,
                currentSolverData,
                setCurrentSolverData,
            }}
        >
            {children}
        </SolverContext.Provider>
    )
}
