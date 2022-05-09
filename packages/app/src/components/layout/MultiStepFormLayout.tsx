import { Box } from 'grommet'
import { PropsWithChildren } from 'react'

type MultiStepFormLayoutProps = PropsWithChildren<{}> & {
    nav: JSX.Element
}

const MultiStepFormLayout = ({ nav, children }: MultiStepFormLayoutProps) => {
    return (
        <Box height={{ min: '80vh' }}>
            <Box flex animation={'fadeIn'} justify="center">
                {children}
            </Box>
            {nav}
        </Box>
    )
}

export default MultiStepFormLayout
