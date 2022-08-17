import { Box, Image } from 'grommet'

import { Heading } from 'grommet'
import { ResponsiveContext } from 'grommet'
import { Text } from 'grommet'

const EnderSection = () => (
    <ResponsiveContext.Consumer>
        {(screenSize) => {
            return (
                <Box justify="center" align="center" height={{ min: '30vh' }}>
                    <Box
                        direction="row"
                        width={'xlarge'}
                        wrap="reverse"
                        justify={screenSize === 'small' ? 'center' : 'between'}
                    >
                        <Box width={'medium'} pad="large">
                            <Text
                                textAlign={
                                    screenSize === 'small' ? 'center' : 'start'
                                }
                            >
                                The Future of Work isn't just about digital
                                organizations and self-sovereign remote workers,
                                it is about unlocking new forms of human
                                coordination.
                            </Text>
                        </Box>
                        <Box width={'medium'} pad="large">
                            <Heading
                                textAlign={
                                    screenSize === 'small' ? 'center' : 'start'
                                }
                            >
                                Imagine it,
                            </Heading>
                            <Heading
                                textAlign={
                                    screenSize === 'small' ? 'center' : 'start'
                                }
                            >
                                build it
                            </Heading>
                        </Box>
                    </Box>
                    <Image src="illustrations/build-it.svg" height="200px" />
                </Box>
            )
        }}
    </ResponsiveContext.Consumer>
)

export default EnderSection
