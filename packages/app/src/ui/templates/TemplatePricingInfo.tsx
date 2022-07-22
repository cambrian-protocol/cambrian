import { Box, Text } from 'grommet'
import { useEffect, useState } from 'react'

import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { Coins } from 'phosphor-react'
import PriceInfo from '../../components/info/PriceInfo'
import TokenAvatar from '../../components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface TemplatePricingInfoProps {
    template: CeramicTemplateModel
}

const TemplatePricingInfo = ({ template }: TemplatePricingInfoProps) => {
    const { currentUser } = useCurrentUser()
    const [collateralToken, setCollateralToken] = useState<TokenModel>()

    useEffect(() => {
        init()
    }, [currentUser])

    const init = async () => {
        if (template.price?.denominationTokenAddress && currentUser) {
            const ct = await fetchTokenInfo(
                template.price?.denominationTokenAddress,
                currentUser.web3Provider
            )
            if (ct) setCollateralToken(ct)
        }
    }

    return (
        <Box>
            <PriceInfo
                amount={template.price.amount}
                label="Sellers quote"
                token={collateralToken}
            />
            <Box direction="row" wrap>
                {template.price.allowAnyPaymentToken && (
                    <Box
                        basis="1/2"
                        height={'auto'}
                        gap="xsmall"
                        width={{ min: 'small' }}
                        pad={{ vertical: 'medium' }}
                    >
                        <Text color="dark-4">Flexible Token</Text>
                        <Box direction="row" gap="medium">
                            <Coins size="24" />
                            <Text size="small" color={'dark-4'}>
                                Any ERC20 token allowed
                            </Text>
                        </Box>
                    </Box>
                )}
                {template.price.preferredTokens &&
                    template.price.preferredTokens.length > 0 && (
                        <Box
                            basis="1/2"
                            height={'auto'}
                            gap="xsmall"
                            width={{ min: 'auto' }}
                            pad={{ vertical: 'medium' }}
                        >
                            {template.price.allowAnyPaymentToken ? (
                                <Text color={'dark-4'}>
                                    Preferred tokens for payment:
                                </Text>
                            ) : (
                                <Text color={'dark-4'}>
                                    Alternative Tokens for payment:
                                </Text>
                            )}
                            <Box direction="row" gap="small" pad="small">
                                {template.price.preferredTokens.map(
                                    (preferredToken, idx) => (
                                        <TokenAvatar
                                            key={idx}
                                            token={preferredToken}
                                        />
                                    )
                                )}
                            </Box>
                        </Box>
                    )}
            </Box>
        </Box>
    )
}

export default TemplatePricingInfo
