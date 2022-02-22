import {
    SolverContractCondition,
    SolverContractData,
} from '@cambrian/app/models/SolverModel'

import { BasicSolverMethodsType } from '@cambrian/app/components/solver/Solver'
import { Layout } from '@cambrian/app/components/layout/Layout'
import { ethers } from 'ethers'
import { SetStateAction } from 'react'
import { UserType } from '@cambrian/app/store/UserContext'

export interface DefaultSolverUIProps {
    solverData: SolverContractData
    solverContract: ethers.Contract
    solverMethods: BasicSolverMethodsType
    currentUser: UserType
    currentCondition: SolverContractCondition
    setCurrentCondition: React.Dispatch<
        SetStateAction<SolverContractCondition | undefined>
    >
}

const DefaultSolverUI = ({ solverData }: DefaultSolverUIProps) => {
    return (
        <Layout contextTitle="Default interaction">
            {JSON.stringify(solverData)}
        </Layout>
    )
}

export default DefaultSolverUI
