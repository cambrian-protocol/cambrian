import { Box } from 'grommet'
import { Button } from 'grommet'
import { Envelope } from 'phosphor-react'
import { Heading } from 'grommet'
import { ResponsiveContext } from 'grommet'

const FooterCTASection = () => (
    <ResponsiveContext.Consumer>
        {(screenSize) => {
            return (
                <Box
                    pad="large"
                    gap={screenSize === 'small' ? 'large' : 'medium'}
                    align={screenSize === 'small' ? 'center' : 'start'}
                >
                    <>
                        <Heading
                            level={3}
                            textAlign={
                                screenSize === 'small' ? 'center' : 'start'
                            }
                        >
                            Curious?
                        </Heading>
                        <Heading
                            textAlign={
                                screenSize === 'small' ? 'center' : 'start'
                            }
                        >
                            Request a Demo
                        </Heading>
                    </>
                    <Box direction="row">
                        {screenSize === 'small' && <Box flex />}
                        <Button
                            primary
                            label="Get in touch"
                            icon={<Envelope color="white" size="24" />}
                            href="mailto:paul@cambrianprotocol.com?subject=Demo inquiry"
                        />
                        <Box flex />
                    </Box>
                </Box>
            )
        }}
    </ResponsiveContext.Consumer>
)

export default FooterCTASection
