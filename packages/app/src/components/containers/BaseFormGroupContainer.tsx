import { Box } from 'grommet'
import { BoxExtendedProps } from 'grommet'
import { PropsWithChildren } from 'react'

const BaseFormGroupContainer = ({
    children,
    ...props
}: PropsWithChildren<{}> & BoxExtendedProps) => {
    return (
        <Box
            pad="medium"
            elevation="small"
            background={'background-contrast'}
            round="small"
            height={{ min: 'auto' }}
            {...props}
        >
            {children}
        </Box>
    )
}

export default BaseFormGroupContainer
