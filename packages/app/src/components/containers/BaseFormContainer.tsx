import { Box } from 'grommet'
import { BoxExtendedProps } from 'grommet'
import { PropsWithChildren } from 'react'

const BaseFormContainer = ({
    children,
    ...rest
}: PropsWithChildren<{}> & BoxExtendedProps) => {
    return (
        <Box
            background={'background-contrast'}
            pad="medium"
            elevation="small"
            round="small"
            fill="horizontal"
            height={{ min: 'auto' }}
            gap="medium"
            {...rest}
        >
            {children}
        </Box>
    )
}

export default BaseFormContainer
