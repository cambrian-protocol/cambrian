import { Box } from 'grommet'
import { BoxExtendedProps } from 'grommet'
import { PropsWithChildren } from 'react'

const BaseFormContainer = ({
    children,
    ...rest
}: PropsWithChildren<{}> & BoxExtendedProps) => {
    return (
        <Box
            background={'background-front'}
            pad="medium"
            elevation="small"
            round="small"
            fill="horizontal"
            height={{ min: 'auto' }}
            {...rest}
        >
            {children}
        </Box>
    )
}

export default BaseFormContainer
