import { Box } from 'grommet'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import ModuleRegistryAPI from '@cambrian/app/services/api/ModuleRegistry'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { Text } from 'grommet'
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

            const module = ModuleRegistryAPI.module(moduleKey)
            if (module) {
                const Component = module.component
                if (Component) {
                    moduleComponents.push(
                        <Box gap="small">
                            <Text color="dark-4" size="small">
                                {module.name}
                            </Text>
                            <Component
                                solverAddress={solverAddress}
                                currentCondition={currentCondition}
                            />
                        </Box>
                    )
                }
            }
        } catch (e) {
            cpLogger.push(e)
        }
    })

    return (
        <Box gap="small">
            {moduleComponents.map((component, idx) => (
                <Box key={idx}>{component}</Box>
            ))}
        </Box>
    )
}

export default ModuleUIManager
