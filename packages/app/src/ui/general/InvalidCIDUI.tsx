import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { Box } from 'grommet'
import { SmileyXEyes } from 'phosphor-react'
import { StageNames } from '@cambrian/app/classes/Stagehand'
import { Text } from 'grommet'

interface InvalidCIDUIProps {
    contextTitle: string
    stageName: StageNames
}

const InvalidCIDUI = ({ contextTitle, stageName }: InvalidCIDUIProps) => {
    return (
        <BaseLayout contextTitle={contextTitle}>
            <Box fill justify="center" align="center" gap="large">
                <SmileyXEyes size="42" />
                <Box width="medium">
                    <Text>No valid {stageName} found at provided CID</Text>
                    <Text size="small" color="dark-4">
                        Please double check the {stageName} CID, try again, or
                        check with the {stageName} creator if the {stageName}
                        was valid when exported
                    </Text>
                </Box>
            </Box>
        </BaseLayout>
    )
}

export default InvalidCIDUI
