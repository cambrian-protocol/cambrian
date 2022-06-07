import BaseFormGroupContainer from '../containers/BaseFormGroupContainer'
import { Box } from 'grommet'
import { CONDITION_STATUS_INFO } from '@cambrian/app/models/ConditionStatus'
import { IconContext } from 'phosphor-react'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { Text } from 'grommet'

interface SolverConditionInfoProps {
    currentCondition: SolverContractCondition
}

const SolverConditionInfo = ({
    currentCondition,
}: SolverConditionInfoProps) => {
    const conditionStatusDetails =
        CONDITION_STATUS_INFO[currentCondition.status]

    return (
        <BaseFormGroupContainer
            groupTitle="Solver Status"
            direction="row"
            gap="small"
            align="center"
        >
            <Box width={{ min: 'auto' }}>
                <IconContext.Provider value={{ size: '24' }}>
                    {conditionStatusDetails.icon}
                </IconContext.Provider>
            </Box>
            <Box>
                <Text>{conditionStatusDetails.name}</Text>
                <Text color="dark-4" size="small">
                    {conditionStatusDetails.desciption}
                </Text>
            </Box>
        </BaseFormGroupContainer>
    )
}

export default SolverConditionInfo
