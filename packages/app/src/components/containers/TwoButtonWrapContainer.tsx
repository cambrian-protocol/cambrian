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
        <Box direction="row" justify="between">
            <Box flex pad="xsmall">
                {secondaryButton}
            </Box>
            <Box flex pad="xsmall">
                {primaryButton}
            </Box>
        </Box>
    )
}

export default TwoButtonWrapContainer
