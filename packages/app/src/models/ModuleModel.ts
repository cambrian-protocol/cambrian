import { SolidityDataTypes } from './SolidityDataTypes'

export type ModuleLoaderModel = {
    module: string // address
    data: string
}

export type ModuleModel = {
    key: string
    name: string
    description: string
    dataInputs?: ModuleDataInputType[]
    supportedChains: number[]
}

export type ModuleDataInputType = {
    type: SolidityDataTypes
    value: string
    label: string
    description: string
}
