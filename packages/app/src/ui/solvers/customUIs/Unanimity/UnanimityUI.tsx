import { Box } from 'grommet'
import { ModuleComponentProps } from '@cambrian/app/models/ModuleModel'
import { Text } from 'grommet'

export const UNANIMITY_MODULE_KEY = 'unanimity'

const UnanimityUI = ({}: ModuleComponentProps) => {
    return (
        <Box
            height="xsmall"
            background="background-contrast"
            width="fill"
            border
            round="small"
            pad="small"
            justify="center"
            align="center"
        >
            <Text>Unanimity Module Placeholder</Text>
        </Box>
    )
}

export default UnanimityUI
