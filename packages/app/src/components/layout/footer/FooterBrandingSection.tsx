import { Box } from 'grommet'
import CambrianLogo from '../../branding/CambrianLogo'
import { ResponsiveContext } from 'grommet'
import { Text } from 'grommet'

const FooterBrandingSection = () => (
    <ResponsiveContext.Consumer>
        {(screenSize) => {
            return (
                <Box
                    pad={{
                        top: 'large',
                        bottom: 'large',
                    }}
                    direction={screenSize === 'small' ? 'column' : 'row'}
                    justify={screenSize === 'small' ? 'center' : 'between'}
                    wrap
                    align="center"
                >
                    <CambrianLogo
                        align={screenSize === 'small' ? 'center' : undefined}
                    />
                    <Box width={'medium'}>
                        <Text
                            size="small"
                            color="dark-4"
                            textAlign={
                                screenSize === 'small' ? 'center' : 'start'
                            }
                        >
                            Work is evolving.
                        </Text>
                    </Box>
                </Box>
            )
        }}
    </ResponsiveContext.Consumer>
)

export default FooterBrandingSection
