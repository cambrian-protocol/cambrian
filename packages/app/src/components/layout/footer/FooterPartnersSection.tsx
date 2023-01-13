import { Box, Heading, Image, ResponsiveContext } from 'grommet'

const FooterPartnersSection = () => (
    <ResponsiveContext.Consumer>
        {(screenSize) => {
            return (
                <Box pad="large" border={{ side: 'bottom' }} gap="small">
                    <Box
                        height={{ min: 'auto' }}
                        align={screenSize === 'small' ? 'center' : 'start'}
                    >
                        <Heading level={'5'}>Proudly</Heading>
                        <Heading level={'3'}>Backed by</Heading>
                    </Box>
                    <Box
                        direction="row"
                        wrap
                        fill
                        justify="around"
                        align="center"
                    >
                        <Box
                            pad="small"
                            width={{
                                min: 'small',
                                max: 'small',
                            }}
                        >
                            <Image
                                fit="contain"
                                fill
                                src="/images/logo/chainlink_startup_logo.svg"
                            />
                        </Box>
                        <Box
                            pad="small"
                            width={{
                                min: 'xsmall',
                                max: 'xsmall',
                            }}
                        >
                            <Image
                                fit="contain"
                                fill
                                src="/images/logo/techstars_iowa_logo.png"
                            />
                        </Box>
                    </Box>
                </Box>
            )
        }}
    </ResponsiveContext.Consumer>
)

export default FooterPartnersSection
