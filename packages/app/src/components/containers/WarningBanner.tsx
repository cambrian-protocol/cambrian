import { Box, ResponsiveContext, Text } from 'grommet'
import { IconContext, Warning } from 'phosphor-react'

interface WarningBannerProps {
    message: string
    icon?: JSX.Element
}

// TODO Change on Prod / Link to list of supported chains
const WarningBanner = ({ message, icon }: WarningBannerProps) => (
    <ResponsiveContext.Consumer>
        {(screenSize) => (
            <Box
                width={screenSize === 'small' ? { min: '100vw' } : undefined}
                height={{ min: 'auto' }}
            >
                <Box
                    pad="xsmall"
                    background="status-warning"
                    align="center"
                    justify="center"
                    direction="row"
                    gap="small"
                    elevation="small"
                >
                    <Box width={{ min: 'auto' }}>
                        <IconContext.Provider value={{ size: '18' }}>
                            {icon ? icon : <Warning />}
                        </IconContext.Provider>
                    </Box>
                    <Text size="small">{message}</Text>
                </Box>
            </Box>
        )}
    </ResponsiveContext.Consumer>
)

export default WarningBanner
