import { Box } from 'grommet'

interface TwoButtonWrapContainerProps {
    primaryButton: JSX.Element
    secondaryButton: JSX.Element
}

const TwoButtonWrapContainer = ({
    primaryButton,
    secondaryButton,
}: TwoButtonWrapContainerProps) => {
    return (
        <Box direction="row" wrap justify="between">
            <Box width={{ min: 'small' }} flex pad="xsmall">
                {secondaryButton}
            </Box>
            <Box width={{ min: 'small' }} flex pad="xsmall">
                {primaryButton}
            </Box>
        </Box>
    )
}

export default TwoButtonWrapContainer
