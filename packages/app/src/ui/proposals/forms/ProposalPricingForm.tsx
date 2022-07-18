import { Box, Button, Form, FormExtendedEvent, FormField, Text } from 'grommet'
import { useEffect, useState } from 'react'

import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import TokenInput from '@cambrian/app/components/inputs/TokenInput'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useProposal } from '@cambrian/app/hooks/useProposal'

interface ProposalPricingFormProps {
    postRollSubmit?: () => Promise<void>
    submitLabel?: string
    postRollCancel?: () => void
    cancelLabel?: string
}

type ProposalPricingFormType = {
    tokenAddress: string
    price: number
}

// TODO Validation
const ProposalPricingForm = ({
    postRollSubmit,
    submitLabel,
    postRollCancel,
    cancelLabel,
}: ProposalPricingFormProps) => {
    const {
        proposalInput,
        setProposalInput,
        proposalStack,
        onSaveProposal,
        onResetProposalInput,
    } = useProposal()

    const { currentUser } = useCurrentUser()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [denominationToken, setDenominationToken] = useState<TokenModel>()

    useEffect(() => {
        return () => {}
    }, [])

    useEffect(() => {
        if (proposalStack) {
            initDenominationToken(
                proposalStack.templateDoc.content.price.denominationTokenAddress
            )
        }
    }, [])

    const initDenominationToken = async (address: string) => {
        if (currentUser) {
            const token = await fetchTokenInfo(
                address,
                currentUser.web3Provider
            )
            setDenominationToken(token)
        }
    }

    const handleSubmit = async (
        event: FormExtendedEvent<ProposalPricingFormType, Element>
    ) => {
        event.preventDefault()
        setIsSubmitting(true)
        await onSaveProposal()
        postRollSubmit && postRollSubmit()
        setIsSubmitting(false)
    }

    return (
        <Form<ProposalPricingFormType> onSubmit={handleSubmit}>
            <Box justify="between" height={{ min: '50vh' }}>
                {denominationToken && proposalStack && proposalInput && (
                    <>
                        <Box gap="medium">
                            <Box
                                pad="small"
                                round="xsmall"
                                background="background-contrast"
                                border
                                elevation="small"
                            >
                                {proposalStack.templateDoc.content.price
                                    .allowAnyPaymentToken ||
                                (proposalStack.templateDoc.content.price
                                    .preferredTokens &&
                                    proposalStack.templateDoc.content.price
                                        .preferredTokens.length > 0) ? (
                                    <>
                                        <Text>
                                            The seller quotes an equivalent of{' '}
                                            {
                                                proposalStack.templateDoc
                                                    .content.price?.amount
                                            }{' '}
                                            {denominationToken.symbol}
                                        </Text>
                                        <Text color="dark-4" size="small">
                                            Please make sure you match the value
                                            if you want to pay with a different
                                            token.
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Text>
                                            The seller quotes{' '}
                                            {
                                                proposalStack.templateDoc
                                                    .content.price?.amount
                                            }{' '}
                                            {denominationToken.symbol}
                                        </Text>
                                        <Text color="dark-4" size="small">
                                            Feel free to make a counter offer,
                                            if you assume it might be accepted
                                        </Text>
                                    </>
                                )}
                            </Box>
                            <Box direction="row" gap="small">
                                <Box width={{ max: 'medium' }}>
                                    <FormField
                                        label="Amount"
                                        type="number"
                                        min={0}
                                        value={proposalInput.price.amount}
                                        onChange={(e) =>
                                            setProposalInput({
                                                ...proposalInput,
                                                price: {
                                                    ...proposalInput.price,
                                                    amount: Number(
                                                        e.target.value
                                                    ),
                                                },
                                            })
                                        }
                                    />
                                </Box>
                                <TokenInput
                                    template={proposalStack.templateDoc.content}
                                    denominationToken={denominationToken}
                                    proposalInput={proposalInput}
                                    setProposalInput={setProposalInput}
                                />
                            </Box>
                        </Box>
                        <Box
                            direction="row"
                            justify="between"
                            pad={{ top: 'medium' }}
                        >
                            <Button
                                size="small"
                                secondary
                                label={cancelLabel || 'Reset all changes'}
                                onClick={() => {
                                    onResetProposalInput()
                                    postRollCancel && postRollCancel()
                                }}
                            />
                            <LoaderButton
                                isLoading={isSubmitting}
                                size="small"
                                primary
                                label={submitLabel || 'Save'}
                                type="submit"
                            />
                        </Box>
                    </>
                )}
            </Box>
        </Form>
    )
}

export default ProposalPricingForm
