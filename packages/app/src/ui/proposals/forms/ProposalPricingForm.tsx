import { Box, Button, Form, FormExtendedEvent, Text } from 'grommet'
import {
    ProposalModel,
    ProposalPriceModel,
} from '@cambrian/app/models/ProposalModel'

import BaseTokenBadge from '@cambrian/app/components/token/BaseTokenBadge'
import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import NumberInput from '@cambrian/app/components/inputs/NumberInput'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import SelectTokenItem from '@cambrian/app/components/token/SelectTokenItem'
import _ from 'lodash'
import { useState } from 'react'

interface ProposalPricingFormProps {
    proposal: Proposal
    onSubmit?: () => void
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
}

const ProposalPricingForm = ({
    proposal,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
}: ProposalPricingFormProps) => {
    const [amount, setAmount] = useState(proposal.content.price.amount)
    const [collateralTokenAddress, setCollateralTokenAddress] = useState(
        proposal.content.price.tokenAddress
    )
    const [isSubmitting, setIsSubmitting] = useState(false)
    const templatePrice = proposal.template.content.price
    const isFlexibleCollateralToken =
        templatePrice.allowAnyPaymentToken ||
        templatePrice.preferredTokens.length > 0

    const handleSubmit = async (
        event: FormExtendedEvent<ProposalPriceModel, Element>
    ) => {
        try {
            event.preventDefault()
            setIsSubmitting(true)
            const updatedProposal: ProposalModel = {
                ...proposal.content,
                price: {
                    amount: amount,
                    tokenAddress: collateralTokenAddress,
                },
            }
            if (!_.isEqual(updatedProposal, proposal.content)) {
                await proposal.updateContent(updatedProposal)
            }
            onSubmit && onSubmit()
            setIsSubmitting(false)
        } catch (e) {
            console.error(e)
        }
    }

    const onReset = () => {
        setAmount(proposal.content.price.amount)
        setCollateralTokenAddress(proposal.content.price.tokenAddress)
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Box gap="medium">
                <Box gap="medium">
                    <Box
                        pad="small"
                        round="xsmall"
                        background="background-contrast"
                        border
                        elevation="small"
                    >
                        <Text>
                            The seller quotes
                            {isFlexibleCollateralToken
                                ? ' an equivalent of '
                                : ' '}
                            {templatePrice.amount}{' '}
                            {proposal.denomintaionToken.symbol}
                        </Text>
                        {isFlexibleCollateralToken ? (
                            <Text color="dark-4" size="small">
                                Please make sure you match the value if you want
                                to pay with a different token.
                            </Text>
                        ) : (
                            <Text color="dark-4" size="small">
                                Feel free to make a counter offer, if you assume
                                it might be accepted.
                            </Text>
                        )}
                    </Box>
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
                        {isFlexibleCollateralToken ? (
                            <SelectTokenItem
                                allowAnyPaymentToken={
                                    templatePrice.allowAnyPaymentToken
                                }
                                preferredTokenList={templatePrice.preferredTokens.concat(
                                    [templatePrice.denominationTokenAddress]
                                )}
                                tokenAddress={
                                    proposal.content.price.tokenAddress
                                }
                                onSelect={(newSelectedToken) => {
                                    setCollateralTokenAddress(newSelectedToken)
                                }}
                            />
                        ) : (
                            <BaseTokenBadge token={proposal.collateralToken} />
                        )}
                    </Box>
                </Box>
                <ButtonRowContainer
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
                            label={cancelLabel || 'Reset changes'}
                            onClick={onCancel ? onCancel : onReset}
                        />
                    }
                />
            </Box>
        </Form>
    )
}

export default ProposalPricingForm
