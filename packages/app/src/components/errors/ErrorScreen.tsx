import { ArrowClockwise, DiscordLogo, XCircle } from 'phosphor-react'
import { Box, Button } from 'grommet'

import { BaseLayout } from '../layout/BaseLayout'
import HeaderTextSection from '../sections/HeaderTextSection'

const ErrorScreen = () => (
    <BaseLayout contextTitle="Ooops">
        <Box fill justify="center">
            <Box gap="medium">
                <HeaderTextSection
                    subTitle="Oooops"
                    title="Something went wrong"
                    paragraph="Please try again or get in touch via Discord."
                    icon={<XCircle />}
                />
                <Box direction="row" fill="horizontal" gap="small">
                    <Box flex>
                        <Button
                            secondary
                            label="Contact"
                            href="https://discord.gg/pZP4HNYrZs"
                            icon={<DiscordLogo />}
                        />
                    </Box>
                    <Box flex>
                        <Button
                            primary
                            label="Retry"
                            onClick={() => {
                                window.location.reload()
                            }}
                            icon={<ArrowClockwise />}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    </BaseLayout>
)

export default ErrorScreen
