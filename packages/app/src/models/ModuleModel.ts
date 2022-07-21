import { ContractAddresses } from './../../config/SupportedChains'
import { SolidityDataTypes } from './SolidityDataTypes'
import { SolverContractCondition } from './ConditionModel'
import { UserType } from '../store/UserContext'

export type ModuleLoaderModel = {
    module: string // deployment address
    data: string
}

export type ModuleComponentProps = {
    solverAddress: string
    currentCondition: SolverContractCondition
    currentUser: UserType
}

export type ComposerModuleModel = {
    key: string
    name: string
    description: string
    dataInputs?: ComposerModuleDataInputType[]
    deployments: ContractAddresses
    component?: (props: ModuleComponentProps) => JSX.Element
}

export type ComposerModuleDataInputType = {
    type: SolidityDataTypes
    value: string
    label: string
    description: string
}
