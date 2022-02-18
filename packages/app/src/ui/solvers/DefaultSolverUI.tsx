import { BasicSolverMethodsType } from '@cambrian/app/components/solver/Solver'
import { Layout } from '@cambrian/app/components/layout/Layout'
import { SolverContractData } from '@cambrian/app/models/SolverModel'
import { ethers } from 'ethers'

export interface DefaultSolverUIProps {
    solverData: SolverContractData
    solverContract: ethers.Contract
    solverMethods: BasicSolverMethodsType
    signer: ethers.providers.JsonRpcSigner
}

const DefaultSolverUI = ({ solverData }: DefaultSolverUIProps) => {
    return (
        <Layout contextTitle="Default interaction">
            {JSON.stringify(solverData)}
        </Layout>
    )
}

export default DefaultSolverUI
