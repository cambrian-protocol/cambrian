import {
    CONTACT_EMAIL_LINK,
    GITHUB_LINK,
    INVITE_DISCORD_LINK,
    NOTION_ENTRY_LINK,
    SUPPORT_DISCORD_LINK,
    TWITTER_PROFILE_LINK,
    WHITEPAPER_LINK,
    WIKI_NOTION_LINK,
} from 'packages/app/config/ExternalLinks'

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
                                href: SUPPORT_DISCORD_LINK,
                            },
                            {
                                label: 'Learn',
                                href: WIKI_NOTION_LINK,
                            },
                            {
                                label: 'Notion',
                                href: NOTION_ENTRY_LINK,
                            },
                        ]}
                    />
                    <FooterLinksContainer
                        title="Company"
                        items={[
                            {
                                label: 'Whitepaper',
                                href: WHITEPAPER_LINK,
                            },
                            {
                                label: 'Contact us',
                                href: CONTACT_EMAIL_LINK,
                            },
                        ]}
                    />
                    <FooterLinksContainer
                        title="Social"
                        items={[
                            {
                                label: 'Twitter',
                                href: TWITTER_PROFILE_LINK,
                            },
                            {
                                label: 'Github',
                                href: GITHUB_LINK,
                            },
                            {
                                label: 'Discord',
                                href: INVITE_DISCORD_LINK,
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
