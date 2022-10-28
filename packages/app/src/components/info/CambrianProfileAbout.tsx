import { Box, Heading, Text } from 'grommet'

import BaseAvatar from '../avatars/BaseAvatar'
import { CambrianProfileType } from '@cambrian/app/store/UserContext'
import ClipboardButton from '../buttons/ClipboardButton'
import { CurrencyEth } from 'phosphor-react'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'

interface CambrianProfileAboutProps {
    cambrianProfile: TileDocument<CambrianProfileType>
}

const CambrianProfileAbout = ({
    cambrianProfile,
}: CambrianProfileAboutProps) => (
    <Box
        height={{ min: 'auto' }}
        gap="medium"
        style={{ position: 'relative' }}
        pad="medium"
        round="xsmall"
        background="background-popup"
    >
        <Box
            round={{ corner: 'top', size: 'xsmall' }}
            height="xsmall"
            width={'100%'}
            background="secondary-gradient"
            style={{ position: 'absolute', top: 0, left: 0 }}
        />
        <Box gap="small" align="start" style={{ position: 'relative' }}>
            {cambrianProfile.content.avatar ? (
                <BaseAvatar
                    size="medium"
                    pfpPath={cambrianProfile.content.avatar as string}
                />
            ) : (
                <BaseAvatar
                    size="medium"
                    address={cambrianProfile?.controllers[0].slice(-42)}
                />
            )}
            <Box>
                <Heading level="4">
                    {cambrianProfile?.content.name || 'Anon'}
                </Heading>
                <Text size="xsmall" color="dark-4">
                    {(cambrianProfile?.content.title as string) || 'Unknown'}
                </Text>
            </Box>
        </Box>
        <Text size="small" color="dark-4" style={{ whiteSpace: 'pre-line' }}>
            {cambrianProfile?.content.description}
        </Text>
        <Box
            direction="row"
            align="center"
            justify="between"
            gap="small"
            flex
            width={'medium'}
        >
            <CurrencyEth size="18" />
            <Text size="xsmall" color="dark-4" truncate>
                {ellipseAddress(cambrianProfile?.controllers[0].slice(-42), 15)}
            </Text>
            <ClipboardButton
                value={cambrianProfile?.controllers[0].slice(-42) || ''}
                size="xsmall"
            />
        </Box>
    </Box>
)

export default CambrianProfileAbout
