import { Box, Heading, Text } from 'grommet'

import BaseTokenItem from '../token/BaseTokenItem'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface PriceInfoProps {
    label: string
    amount: number
    token?: TokenModel
    allowAnyPaymentToken?: boolean
    preferredTokens?: string[]
}

const PriceInfo = ({
    label,
    amount,
    token,
    preferredTokens,
    allowAnyPaymentToken,
}: PriceInfoProps) => {
    const hasPreferredToken = preferredTokens && preferredTokens.length > 0
    const hasAlternativePaymentOptions =
        hasPreferredToken || allowAnyPaymentToken

    return (
        <Box direction="row" wrap>
            <Box gap="small" pad={{ right: 'large' }}>
                <Heading level="4">{label}</Heading>
                <Box direction="row" gap="small" align="center">
                    <Heading level={'2'}>{amount}</Heading>
                    <BaseTokenItem tokenAddress={token?.address} />
                </Box>
            </Box>
            {hasAlternativePaymentOptions && (
                <Box gap="small">
                    <Heading level="4" color="dark-4">
                        Alternative Payment Options
                    </Heading>
                    <Box direction="row" gap="small" align="center">
                        {preferredTokens?.map((preferredToken, idx) => (
                            <BaseTokenItem
                                key={idx}
                                tokenAddress={preferredToken}
                            />
                        ))}
                        {allowAnyPaymentToken && (
                            <Box
                                pad={{
                                    right: 'xsmall',
                                    vertical: 'xsmall',
                                }}
                            >
                                <Box
                                    round="xsmall"
                                    pad={{
                                        vertical: 'xsmall',
                                        horizontal: 'small',
                                    }}
                                    background={'background-front'}
                                    elevation="small"
                                >
                                    <Box
                                        height={{
                                            min: '32px',
                                            max: '32px',
                                        }}
                                        justify="center"
                                    >
                                        <Text color="dark-4">Any ERC20</Text>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}
        </Box>
    )
}

export default PriceInfo
