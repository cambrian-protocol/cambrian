import { Box } from 'grommet'
import CambrianLogoMark from './CambrianLogoMark'
import { Text } from 'grommet'

interface CambrianLogoProps {
    align?: 'center'
}

const CambrianLogo = ({ align }: CambrianLogoProps) => {
    return (
        <Box
            direction={align === 'center' ? 'column' : 'row'}
            width={{ min: 'auto' }}
            align="center"
            pad={{ vertical: 'medium' }}
        >
            <CambrianLogoMark />
            <Box direction="row" pad="small" gap="xsmall">
                <Text weight={'bold'}>Cambrian</Text>
                <Text>Protocol</Text>
            </Box>
        </Box>
    )
}

export default CambrianLogo
