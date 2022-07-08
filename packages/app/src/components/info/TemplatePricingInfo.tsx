import { Box, Heading, Text } from 'grommet'
import { useEffect, useState } from 'react'

import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { CoinVertical } from 'phosphor-react'
import TokenAvatar from '../avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'

interface TemplatePricingInfoProps {
    template: CeramicTemplateModel
    currentUser: UserType
}

// TODO Styling
const TemplatePricingInfo = ({
    template,
    currentUser,
}: TemplatePricingInfoProps) => {
    const [collateralToken, setCollateralToken] = useState<TokenModel>()

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        if (template.price?.denominationTokenAddress) {
            const ct = await fetchTokenInfo(
                template.price?.denominationTokenAddress,
                currentUser.web3Provider
            )
            if (ct) setCollateralToken(ct)
        }
    }

    return (
        <>
            <Box width={'medium'} gap="medium">
                <Text>The seller quotes:</Text>
                <Box direction="row" gap="small" justify="center">
                    <Heading level="2">{template.price?.amount}</Heading>
                    <TokenAvatar token={collateralToken} />
                </Box>
                {template.price.allowAnyPaymentToken && (
                    <Box direction="row" align="center" gap="small">
                        <CoinVertical size="24" />
                        <Text size="small">
                            The seller allows payment with any other token
                        </Text>
                    </Box>
                )}
                {template.price.preferredTokens &&
                    template.price.preferredTokens.length > 0 && (
                        <Box gap="small">
                            {template.price.allowAnyPaymentToken ? (
                                <Text>Preferred tokens for payment:</Text>
                            ) : (
                                <Text>Alternative Tokens for payment:</Text>
                            )}
                            <Box direction="row" justify="center" gap="small">
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
        </>
    )
}

export default TemplatePricingInfo
