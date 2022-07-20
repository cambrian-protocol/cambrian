import { Box, Heading, Text } from 'grommet'

import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import { usePublicRecord } from '@self.id/framework'

interface BasicProfileInfoProps {
    did: string
}

const BasicProfileInfo = ({ did }: BasicProfileInfoProps) => {
    const sellerBasicProfile = usePublicRecord('basicProfile', did)

    return (
        <Box justify="center" gap="medium">
            <Box direction="row" gap="medium" align="center">
                <BaseAvatar
                    pfpPath={sellerBasicProfile.content?.avatar as string}
                    size="medium"
                />
                <Box>
                    <Heading level="3">
                        {sellerBasicProfile.content?.name}
                    </Heading>
                    <Text size="small" color="dark-4">
                        {sellerBasicProfile.content?.title as string}
                    </Text>
                </Box>
            </Box>
            <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                {sellerBasicProfile.content?.description}
            </Text>
        </Box>
    )
}

export default BasicProfileInfo
