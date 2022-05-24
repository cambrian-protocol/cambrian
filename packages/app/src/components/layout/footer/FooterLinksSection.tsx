import { Anchor } from 'grommet'
import { Box } from 'grommet'
import { ResponsiveContext } from 'grommet'
import { Text } from 'grommet'

const FooterLinksSection = () => (
    <ResponsiveContext.Consumer>
        {(screenSize) => {
            return (
                <Box
                    border={{ side: 'top' }}
                    pad={{
                        vertical: 'large',
                    }}
                    direction="row"
                    justify={screenSize === 'small' ? 'around' : 'between'}
                >
                    <FooterLinksContainer
                        title="Resources"
                        items={[
                            {
                                label: 'Support',
                                href: 'https://discord.com/channels/856113492348108882/968295116576026625',
                            },
                            {
                                label: 'Learn',
                                href: 'https://www.notion.so/cambrianprotocol/Cambrian-Protocol-Wiki-24613f0f7cdb4b32b3f7900915740a70',
                            },
                            {
                                label: 'Notion',
                                href: 'https://www.notion.so/cambrianprotocol/Project-Description-97ba57659ed2421386065588ee052600',
                            },
                        ]}
                    />
                    <FooterLinksContainer
                        title="Company"
                        items={[
                            {
                                label: 'Contact us',
                                href: 'mailto:paul@cambrianprotocol.com',
                            },
                        ]}
                    />
                    <FooterLinksContainer
                        title="Social"
                        items={[
                            {
                                label: 'Twitter',
                                href: 'https://twitter.com/cambrian_eth',
                            },
                            {
                                label: 'Github',
                                href: 'https://github.com/cambrian-protocol/cambrian',
                            },
                            {
                                label: 'Discord',
                                href: 'https://discord.gg/pZP4HNYrZs',
                            },
                        ]}
                    />
                    {screenSize !== 'small' && <Box />}
                </Box>
            )
        }}
    </ResponsiveContext.Consumer>
)

export default FooterLinksSection

interface FooterLinksContainerProps {
    title: string
    items: { label: string; href: string }[]
}

const FooterLinksContainer = ({ title, items }: FooterLinksContainerProps) => (
    <Box gap="small">
        <Text>{title}</Text>
        {items.map((item, idx) => (
            <Anchor key={idx} href={item.href}>
                <Text size="small" color="dark-4">
                    {item.label}
                </Text>
            </Anchor>
        ))}
    </Box>
)
