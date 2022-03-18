import { Box } from 'grommet'
import { CaretLeft } from 'phosphor-react'

interface BreadcrumpProps {
    onBack?: () => void
}

const Breadcrump = ({ onBack }: BreadcrumpProps) => {
    return (
        <Box
            direction="row"
            height={'3em'}
            margin={{ top: 'small' }}
            pad={{ horizontal: 'medium' }}
        >
            <Box width={'3em'} justify="center">
                {onBack && (
                    <Box onClick={onBack} focusIndicator={false}>
                        <CaretLeft size="24" />
                    </Box>
                )}
            </Box>
        </Box>
    )
}

export default Breadcrump
