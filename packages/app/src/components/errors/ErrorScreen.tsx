import { ArrowClockwise, DiscordLogo, XCircle } from 'phosphor-react'
import { Box, Button } from 'grommet'

import HeaderTextSection from '../sections/HeaderTextSection'
import PageLayout from '../layout/PageLayout'

const ErrorScreen = () => (
    <PageLayout contextTitle="Ooops">
        <Box fill justify="center" align="center" height={{ min: '90vh' }}>
            <Box gap="medium" width={'large'}>
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
                            label="Support"
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
    </PageLayout>
)

export default ErrorScreen
