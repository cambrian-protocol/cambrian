import { Box } from 'grommet'
import { Heading } from 'grommet'
import RecommendedReadingCard from '../cards/RecommendedReadingCard'
import { ResponsiveContext } from 'grommet'
import { Text } from 'grommet'

const RecommendedReadingsSection = () => (
    <ResponsiveContext.Consumer>
        {(screenSize) => {
            return (
                <Box
                    pad="large"
                    height={{ min: '100vh' }}
                    gap="large"
                    justify="center"
                >
                    <Box
                        align={screenSize === 'small' ? 'start' : 'center'}
                        gap="medium"
                    >
                        <Box gap="medium">
                            <Heading
                                textAlign={
                                    screenSize === 'small' ? 'start' : 'center'
                                }
                            >
                                Recommended Readings
                            </Heading>
                            <Text
                                color="dark-4"
                                textAlign={
                                    screenSize === 'small' ? 'start' : 'center'
                                }
                            >
                                Explore our thoughts on future of work
                            </Text>
                        </Box>
                        <Box
                            direction="row"
                            overflow={
                                screenSize === 'small'
                                    ? { horizontal: 'auto' }
                                    : undefined
                            }
                            wrap={screenSize === 'small' ? false : true}
                            justify={
                                screenSize === 'small' ? 'start' : 'center'
                            }
                            gap={screenSize === 'small' ? 'medium' : undefined}
                        >
                            <RecommendedReadingCard
                                title="The Ownership Dial - Who Owns Web 3?"
                                author="Paul Malin"
                                href="https://mirror.xyz/0xDbd6EDa9C8D51a8503A6C4e8494Ee51210B3dA1d/YNki8ACVstR_OWHNszzCChtFtwzc8d2nau4Mu7W8PIE"
                                imageUrl="https://images.mirror-media.xyz/nft/amWVCen3Byp9ObE5mK-ou.jpg"
                            />
                            <RecommendedReadingCard
                                title="Decentraliation Is Not Enough"
                                author="Nicholas Wickman"
                                href="https://mirror.xyz/0xCef01218f74937187c93EcD12EdAFE76fbbEEc8B/DbSmaxc8DQyP6zFs04qHkKA0PBoiutgOlNqIc_Geqpw"
                                imageUrl="https://miro.medium.com/max/996/1*wfIFsy9EGy9ckI3L34QbTw.png"
                            />
                            <RecommendedReadingCard
                                title="Accountability Is Everything"
                                author="Nicholas Wickman"
                                href="https://mirror.xyz/0xCef01218f74937187c93EcD12EdAFE76fbbEEc8B/3v-m2ulAwBMIPZNxY4tJqQjnr-_MhALuLfPdyTdy6b8"
                                imageUrl="https://miro.medium.com/max/1400/1*5-cNAqKkvtklmn9UUs6AdA.png"
                            />
                            <RecommendedReadingCard
                                title="Conversations With The Norm"
                                author="Paul Malin"
                                href="https://mirror.xyz/0xDbd6EDa9C8D51a8503A6C4e8494Ee51210B3dA1d/SSnmQPe6S7NXfxY-fyxWbBhHQFWO5UyVlxJs2iUp_dU"
                                imageUrl="https://upload.wikimedia.org/wikipedia/commons/4/4d/Cordial_Thanksgiving_Greetings%2C_two_turkeys_%28NBY_20341%29.jpg?20180305102248"
                            />
                            <RecommendedReadingCard
                                title="Wishing for the Pre-Mine IDO"
                                author="Paul Malin"
                                href="https://mirror.xyz/0xDbd6EDa9C8D51a8503A6C4e8494Ee51210B3dA1d/JixHZ2MCVl29SdN7ThODsn_yPu8Kc13QsVbGgL1RrVI"
                                imageUrl="https://mirror.xyz/_next/image?url=https%3A%2F%2Fimages.mirror-media.xyz%2Fpublication-images%2F5AUX6WW5P3jmEYOydu2hH.jpg&w=640&q=90"
                            />
                        </Box>
                    </Box>
                </Box>
            )
        }}
    </ResponsiveContext.Consumer>
)

export default RecommendedReadingsSection
