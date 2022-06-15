import { Box } from 'grommet'
import { BoxExtendedProps } from 'grommet'
import { PropsWithChildren } from 'react'
import { Text } from 'grommet'

type BaseFormGroupContainerProps = PropsWithChildren<{}> &
    BoxExtendedProps & {
        groupTitle?: string
    }

const BaseFormGroupContainer = ({
    groupTitle,
    children,
    ...props
}: BaseFormGroupContainerProps) => (
    <Box gap="small" height={{ min: 'auto' }}>
        {groupTitle && (
            <Text color="dark-4" size="small">
                {groupTitle}
            </Text>
        )}
        <Box
            pad="medium"
            elevation="small"
            background={'background-contrast'}
            round="xsmall"
            {...props}
        >
            {children}
        </Box>
    </Box>
)

export default BaseFormGroupContainer
