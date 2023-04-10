import { Box, CheckBox, Text } from 'grommet'

import AddTokenItem from '@cambrian/app/components/token/AddTokenItem'
import BaseTokenBadge from '@cambrian/app/components/token/BaseTokenBadge'
import NumberInput from '@cambrian/app/components/inputs/NumberInput'
import RemoveTokenItem from '@cambrian/app/components/token/RemoveTokenItem'
import SelectTokenItem from '@cambrian/app/components/token/SelectTokenItem'
import { SetStateAction } from 'react'
import { TemplateInputType } from '../EditTemplateUI'
import _ from 'lodash'

interface TemplatePricingFormProps {
    templateInput: TemplateInputType
    setTemplateInput: React.Dispatch<SetStateAction<TemplateInputType>>
}

const TemplatePricingForm = ({
    templateInput,
    setTemplateInput,
}: TemplatePricingFormProps) => {
    return (
        <Box gap="medium" margin={{ bottom: 'small' }}>
            <Box
                border
                round="xsmall"
                pad="small"
                direction="row"
                align="center"
                gap="small"
                justify="between"
            >
                <Box flex>
                    <NumberInput
                        name="amount"
                        value={templateInput.price.amount}
                        onChange={(e) =>
                            setTemplateInput({
                                ...templateInput,
                                price: {
                                    ...templateInput.price,
                                    amount:
                                        e.target.value === ''
                                            ? ''
                                            : Number(e.target.value),
                                },
                            })
                        }
                    />
                </Box>
                {templateInput.price.isCollateralFlex ? (
                    <SelectTokenItem
                        allowAnyPaymentToken
                        tokenAddress={
                            templateInput.price.denominationTokenAddress
                        }
                        onSelect={(newSelectedToken) => {
                            const filteredTokens = [
                                ...templateInput.price.preferredTokens,
                            ].filter((token) => token !== newSelectedToken)
                            setTemplateInput({
                                ...templateInput,
                                price: {
                                    ...templateInput.price,
                                    preferredTokens: filteredTokens,
                                    denominationTokenAddress: newSelectedToken,
                                },
                            })
                        }}
                    />
                ) : (
                    <BaseTokenBadge
                        tokenAddress={
                            templateInput.price.denominationTokenAddress
                        }
                    />
                )}
            </Box>
            {templateInput.price.isCollateralFlex && (
                <Box gap="small">
                    <Box gap="xsmall">
                        <Text size="small" color="dark-4">{`${
                            templateInput.price.allowAnyPaymentToken
                                ? 'Preferred '
                                : 'Alternative '
                        }tokens which can be used for payment`}</Text>
                        <Box
                            border
                            round="xsmall"
                            pad="small"
                            direction="row"
                            wrap
                        >
                            {templateInput.price.preferredTokens.map(
                                (preferredToken) => (
                                    <RemoveTokenItem
                                        key={preferredToken}
                                        tokenAddress={preferredToken}
                                        onRemove={(removedToken) => {
                                            const filteredTokens = [
                                                ...templateInput.price
                                                    .preferredTokens,
                                            ].filter(
                                                (token) =>
                                                    token !== removedToken
                                            )
                                            setTemplateInput({
                                                ...templateInput,
                                                price: {
                                                    ...templateInput.price,
                                                    preferredTokens:
                                                        filteredTokens,
                                                },
                                            })
                                        }}
                                    />
                                )
                            )}
                            <AddTokenItem
                                addedTokens={templateInput.price.preferredTokens.concat(
                                    templateInput.price.denominationTokenAddress
                                )}
                                onAddToken={(newToken) => {
                                    const updatedPreferredTokens = [
                                        ...templateInput.price.preferredTokens,
                                    ]
                                    updatedPreferredTokens.push(newToken)
                                    setTemplateInput({
                                        ...templateInput,
                                        price: {
                                            ...templateInput.price,
                                            preferredTokens:
                                                updatedPreferredTokens,
                                        },
                                    })
                                }}
                            />
                        </Box>
                    </Box>
                    <CheckBox
                        checked={templateInput.price.allowAnyPaymentToken}
                        onChange={(e) =>
                            setTemplateInput({
                                ...templateInput,
                                price: {
                                    ...templateInput.price,
                                    allowAnyPaymentToken: e.target.checked,
                                },
                            })
                        }
                        label="Allow any token for payment"
                    />
                </Box>
            )}
        </Box>
    )
}

export default TemplatePricingForm
