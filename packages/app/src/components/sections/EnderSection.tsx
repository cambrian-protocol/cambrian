import { Box } from 'grommet'
import { Heading } from 'grommet'
import { ResponsiveContext } from 'grommet'
import { Text } from 'grommet'

const EnderSection = () => (
    <ResponsiveContext.Consumer>
        {(screenSize) => {
            return (
                <Box justify="center" align="center">
                    <Box
                        style={{ position: 'relative' }}
                        direction="row"
                        width={'xlarge'}
                        wrap="reverse"
                        justify={screenSize === 'small' ? 'center' : 'between'}
                    >
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
                    </Box>
                </Box>
            )
        }}
    </ResponsiveContext.Consumer>
)

export default EnderSection
