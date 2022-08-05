import { Box, Heading, Text } from 'grommet'

import BaseAvatar from '@cambrian/app/components/avatars/BaseAvatar'
import { usePublicRecord } from '@self.id/framework'

interface BasicProfileInfoProps {
    did: string
    hideDetails?: boolean
    size?: 'small'
}

const BasicProfileInfo = ({
    did,
    hideDetails,
    size,
}: BasicProfileInfoProps) => {
    const sellerBasicProfile = usePublicRecord('basicProfile', did)

    return (
        <Box justify="center" gap="medium">
            <Box direction="row" wrap align="center">
                <BaseAvatar
                    pfpPath={sellerBasicProfile.content?.avatar as string}
                    size={size ? undefined : 'medium'}
                />
                <Box pad="small">
                    <Heading level={size === 'small' ? '4' : '3'} truncate>
                        {sellerBasicProfile.content?.name || 'Anonym'}
                    </Heading>
                    {size !== 'small' && (
                        <Text size="small" color="dark-4">
                            {sellerBasicProfile.content?.title as string}
                        </Text>
                    )}
                </Box>
            </Box>
            {!hideDetails && (
                <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                    {sellerBasicProfile.content?.description}
                </Text>
            )}
        </Box>
    )
}

export default BasicProfileInfo
