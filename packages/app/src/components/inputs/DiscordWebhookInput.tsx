import { Anchor, FormField, Text } from 'grommet'

interface DiscordWebhookInputProps {
    name: string
}

const DiscordWebhookInput = ({ name }: DiscordWebhookInputProps) => (
    <>
        <FormField
            name={name}
            label="Discord Webhook"
            validate={[
                (url: string) => {
                    if (
                        url !== '' &&
                        !url.startsWith('https://discord.com/api/webhooks/')
                    )
                        return 'Not a valid discord webhook'
                },
            ]}
        />
        <Text size="xsmall" color="dark-4">
            Add a{' '}
            <Anchor
                target="_blank"
                href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
            >
                Discord webhook
            </Anchor>{' '}
            to receive relevant notifications.
        </Text>
    </>
)

export default DiscordWebhookInput
