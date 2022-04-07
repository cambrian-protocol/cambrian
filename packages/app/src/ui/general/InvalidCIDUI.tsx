import { Box } from 'grommet'
import { SmileyXEyes } from 'phosphor-react'
import { StageNames } from '@cambrian/app/classes/Stagehand'
import { Text } from 'grommet'

interface InvalidCIDUIProps {
    stageName: StageNames
}

const InvalidCIDUI = ({ stageName }: InvalidCIDUIProps) => (
    <Box fill justify="center" align="center" gap="large">
        <SmileyXEyes size="42" />
        <Box width="medium">
            <Text>No valid {stageName} found at provided identifier</Text>
            <Text size="small" color="dark-4">
                Please double check the {stageName} identifier, try again, or
                check with the {stageName} creator if the {stageName} was
                successfully exported.
            </Text>
        </Box>
    </Box>
)

export default InvalidCIDUI
