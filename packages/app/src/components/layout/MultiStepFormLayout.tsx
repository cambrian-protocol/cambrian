import { Box } from 'grommet'
import { PropsWithChildren } from 'react'

type MultiStepFormLayoutProps = PropsWithChildren<{}> & {
    nav: JSX.Element
}

const MultiStepFormLayout = ({ nav, children }: MultiStepFormLayoutProps) => {
    return (
        <Box
            height={{ min: '60vh' }}
            width="xlarge"
            pad={{ horizontal: 'large' }}
        >
            <Box flex animation={'fadeIn'} justify="start">
                {children}
            </Box>
            {nav}
        </Box>
    )
}

export default MultiStepFormLayout
