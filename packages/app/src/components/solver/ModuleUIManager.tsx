import { Box } from 'grommet'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import ModuleRegistryAPI from '@cambrian/app/services/api/ModuleRegistry'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface ModuleUIManagerProps {
    solverData: SolverModel
    solverAddress: string
    currentCondition: SolverContractCondition
    chainId: number
}

const ModuleUIManager = ({
    solverData,
    chainId,
    solverAddress,
    currentCondition,
}: ModuleUIManagerProps) => {
    const moduleComponents: JSX.Element[] = []
    solverData.config.moduleLoaders.forEach((moduleLoader) => {
        try {
            const moduleKey = Object.keys(ModuleRegistryAPI.modules).find(
                (module) =>
                    ModuleRegistryAPI.module(module).deployments[chainId] ===
                    moduleLoader.module
            )

            if (!moduleKey) throw GENERAL_ERROR['MODULE_ERROR']

            const ModuleUI = ModuleRegistryAPI.module(moduleKey).component
            if (ModuleUI) {
                moduleComponents.push(
                    <ModuleUI
                        solverAddress={solverAddress}
                        currentCondition={currentCondition}
                    />
                )
            }
        } catch (e) {
            cpLogger.push(e)
        }
    })

    return (
        <Box gap="small" height={{ min: 'auto' }}>
            {moduleComponents.map((component, idx) => (
                <Box key={idx}>{component}</Box>
            ))}
            <Box pad="medium" />
        </Box>
    )
}

export default ModuleUIManager
