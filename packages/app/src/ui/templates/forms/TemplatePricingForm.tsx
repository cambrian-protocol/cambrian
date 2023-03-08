import { Box, Button, CheckBox, Form, FormExtendedEvent, Text } from 'grommet'

import AddTokenItem from '@cambrian/app/components/token/AddTokenItem'
import BaseTokenBadge from '@cambrian/app/components/token/BaseTokenBadge'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import NumberInput from '@cambrian/app/components/inputs/NumberInput'
import RemoveTokenItem from '@cambrian/app/components/token/RemoveTokenItem'
import SelectTokenItem from '@cambrian/app/components/token/SelectTokenItem'
import Template from '@cambrian/app/classes/stages/Template'
import { TemplatePriceModel } from '@cambrian/app/models/TemplateModel'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import _ from 'lodash'
import { useState } from 'react'

interface TemplatePricingFormProps {
    template: Template
    onSubmit?: () => void
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
}

const TemplatePricingForm = ({
    template,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
}: TemplatePricingFormProps) => {
    const [amount, setAmount] = useState(template.content.price.amount)
    const [allowAnyPaymentToken, setAllowAnyPaymentToken] = useState(
        template.content.price.allowAnyPaymentToken
    )
    const [denominationTokenAddress, setDenominationTokenAddress] = useState(
        template.content.price.denominationTokenAddress
    )
    const [preferredTokenAddresses, setPreferredTokenAddresses] = useState(
        template.content.price.preferredTokens
    )
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (
        event: FormExtendedEvent<TemplatePriceModel, Element>
    ) => {
        event.preventDefault()
        setIsSubmitting(true)
        const updatedTemplate = {
            ...template.content,
            price: {
                ...template.content.price,
                amount: amount,
                denominationTokenAddress: denominationTokenAddress,
                allowAnyPaymentToken: allowAnyPaymentToken,
                preferredTokens: preferredTokenAddresses,
            },
        }
        if (!_.isEqual(updatedTemplate, template.content)) {
            await template.updateContent(updatedTemplate)
        }
        onSubmit && onSubmit()
        setIsSubmitting(false)
    }

    return (
        <>
            <Form<TemplatePriceModel> onSubmit={handleSubmit}>
                <Box gap="medium">
                    <Box
                        pad={{ horizontal: 'xsmall' }}
                        gap="medium"
                        height={{ min: '30vh' }}
                    >
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
                                    value={amount}
                                    onChange={(e) =>
                                        setAmount(
                                            e.target.value === ''
                                                ? ''
                                                : Number(e.target.value)
                                        )
                                    }
                                />
                            </Box>
                            {template.content.price.isCollateralFlex ? (
                                <SelectTokenItem
                                    allowAnyPaymentToken
                                    tokenAddress={denominationTokenAddress}
                                    onSelect={(newSelectedToken) => {
                                        const filteredTokens = [
                                            ...preferredTokenAddresses,
                                        ].filter(
                                            (token) =>
                                                token !== newSelectedToken
                                        )
                                        setPreferredTokenAddresses(
                                            filteredTokens
                                        )
                                        setDenominationTokenAddress(
                                            newSelectedToken
                                        )
                                    }}
                                />
                            ) : (
                                <BaseTokenBadge
                                    tokenAddress={denominationTokenAddress}
                                />
                            )}
                        </Box>
                        {template.content.price.isCollateralFlex && (
                            <Box gap="small">
                                <Box gap="xsmall">
                                    <Text size="small" color="dark-4">{`${
                                        allowAnyPaymentToken
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
                                        {preferredTokenAddresses.map(
                                            (preferredToken) => (
                                                <RemoveTokenItem
                                                    key={preferredToken}
                                                    tokenAddress={
                                                        preferredToken
                                                    }
                                                    onRemove={(
                                                        removedToken
                                                    ) => {
                                                        const filteredTokens = [
                                                            ...preferredTokenAddresses,
                                                        ].filter(
                                                            (token) =>
                                                                token !==
                                                                removedToken
                                                        )
                                                        setPreferredTokenAddresses(
                                                            filteredTokens
                                                        )
                                                    }}
                                                />
                                            )
                                        )}
                                        <AddTokenItem
                                            addedTokens={preferredTokenAddresses.concat(
                                                denominationTokenAddress
                                            )}
                                            onAddToken={(newToken) => {
                                                const updatedPreferredTokens = [
                                                    ...preferredTokenAddresses,
                                                ]
                                                updatedPreferredTokens.push(
                                                    newToken
                                                )
                                                setPreferredTokenAddresses(
                                                    updatedPreferredTokens
                                                )
                                            }}
                                        />
                                    </Box>
                                </Box>
                                <CheckBox
                                    checked={allowAnyPaymentToken}
                                    onChange={(e) =>
                                        setAllowAnyPaymentToken(
                                            e.target.checked
                                        )
                                    }
                                    label="Allow any token for payment"
                                />
                            </Box>
                        )}
                    </Box>
                    <TwoButtonWrapContainer
                        primaryButton={
                            <LoaderButton
                                isLoading={isSubmitting}
                                size="small"
                                primary
                                label={submitLabel || 'Save'}
                                type="submit"
                            />
                        }
                        secondaryButton={
                            <Button
                                size="small"
                                secondary
                                label={cancelLabel || 'Reset all changes'}
                                onClick={
                                    onCancel
                                        ? onCancel
                                        : () =>
                                              window.alert(
                                                  'Todo reset Template'
                                              )
                                }
                            />
                        }
                    />
                </Box>
            </Form>
        </>
    )
}

export default TemplatePricingForm
