import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { BasicSolverMethodsType } from '@cambrian/app/components/solver/Solver'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { SetStateAction } from 'react'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'

export interface DefaultSolverUIProps {
    proposal: ProposalModel
    solverData: SolverModel
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
        <BaseLayout contextTitle="Default interaction">
            {JSON.stringify(solverData)}
        </BaseLayout>
    )
}

export default DefaultSolverUI
