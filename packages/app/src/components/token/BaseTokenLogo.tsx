import { Box, Image, Text } from 'grommet'

import { TokenModel } from '@cambrian/app/models/TokenModel'

interface BaseTokenLogoProps {
    token?: TokenModel
    size?: 'medium'
}

const BaseTokenLogo = ({ token, size }: BaseTokenLogoProps) => {
    return (
        <Box
            round="full"
            height={
                size === 'medium'
                    ? { max: '48px', min: '48px' }
                    : { max: '32px', min: '32px' }
            }
            width={
                size === 'medium'
                    ? { max: '48px', min: '48px' }
                    : { max: '32px', min: '32px' }
            }
            justify="center"
            align="center"
            background="background-back"
            overflow="hidden"
        >
            {token?.logoURI ? (
                token.logoURI.startsWith('ipfs') ? (
                    <Image
                        src={token.logoURI.replace(
                            'ipfs://',
                            'https://ipfs.io/ipfs/'
                        )}
                        height="32"
                    />
                ) : (
                    <Image src={token.logoURI} height="32" />
                )
            ) : (
                <Text size="small">{token?.symbol.substring(0, 3)}</Text>
            )}
        </Box>
    )
}

export default BaseTokenLogo
