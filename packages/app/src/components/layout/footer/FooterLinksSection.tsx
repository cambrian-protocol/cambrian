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
                                href: 'https://discord.gg/pZP4HNYrZs',
                            },
                            { label: 'Docs', href: '#' },
                            { label: 'Notion', href: '#' },
                        ]}
                    />
                    <FooterLinksContainer
                        title="Company"
                        items={[
                            { label: 'About us', href: '#' },
                            { label: 'Partners', href: '#' },
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
