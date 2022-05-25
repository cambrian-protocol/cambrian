import { Box, Text } from 'grommet'
import { IconContext, Warning } from 'phosphor-react'

interface WarningBannerProps {
    message: string
    icon?: JSX.Element
}

// TODO Change on Prod / Link to list of supported chains
const WarningBanner = ({ message, icon }: WarningBannerProps) => (
    <Box fill="horizontal" height={{ min: 'auto' }} border={{ side: 'bottom' }}>
        <Box
            pad="xsmall"
            align="center"
            justify="center"
            direction="row"
            gap="small"
            background={'background-contrast'}
        >
            <Box width={{ min: 'auto' }}>
                <IconContext.Provider value={{ size: '18' }}>
                    {icon ? icon : <Warning />}
                </IconContext.Provider>
            </Box>
            <Text size="small">{message}</Text>
        </Box>
    </Box>
)

export default WarningBanner
