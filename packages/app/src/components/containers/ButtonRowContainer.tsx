import { Box } from 'grommet'

interface IButtonRowContainer {
    primaryButton: JSX.Element
    secondaryButton?: JSX.Element
}

const ButtonRowContainer = ({
    primaryButton,
    secondaryButton,
}: IButtonRowContainer) => {
    return (
        <Box direction="row" justify="between">
            {secondaryButton && (
                <Box flex pad={{ right: 'small' }}>
                    {secondaryButton}
                </Box>
            )}
            <Box flex>{primaryButton}</Box>
        </Box>
    )
}

export default ButtonRowContainer
