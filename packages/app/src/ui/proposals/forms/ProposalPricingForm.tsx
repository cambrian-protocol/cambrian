import { Box, Button, Form, FormExtendedEvent, FormField, Text } from 'grommet'
import { SetStateAction, useEffect, useState } from 'react'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import TokenInput from '@cambrian/app/components/inputs/TokenInput'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface ProposalPricingFormProps {
    proposalInput: CeramicProposalModel
    template: CeramicTemplateModel
    setProposalInput: React.Dispatch<
        SetStateAction<CeramicProposalModel | undefined>
    >
    onSubmit: () => Promise<void>
    submitLabel?: string
    onCancel?: () => void
    cancelLabel?: string
}

type ProposalPricingFormType = {
    tokenAddress: string
    price: number
}

// TODO Validation
const ProposalPricingForm = ({
    proposalInput,
    template,
    setProposalInput,
    onSubmit,
    submitLabel,
    onCancel,
    cancelLabel,
}: ProposalPricingFormProps) => {
    const { currentUser } = useCurrentUser()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [denominationToken, setDenominationToken] = useState<TokenModel>()

    useEffect(() => {
        return () => {}
    }, [])

    useEffect(() => {
        initDenominationToken(template.price.denominationTokenAddress)
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
        await onSubmit()
        setIsSubmitting(false)
    }

    return (
        <Form<ProposalPricingFormType> onSubmit={handleSubmit}>
            <Box justify="between" height={{ min: '50vh' }}>
                {denominationToken && proposalInput && (
                    <>
                        <Box gap="medium">
                            <Box
                                pad="small"
                                round="xsmall"
                                background="background-contrast"
                                border
                                elevation="small"
                            >
                                {template.price.allowAnyPaymentToken ||
                                (template.price.preferredTokens &&
                                    template.price.preferredTokens.length >
                                        0) ? (
                                    <>
                                        <Text>
                                            The seller quotes an equivalent of{' '}
                                            {template.price?.amount}{' '}
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
                                            {template.price?.amount}{' '}
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
                                    template={template}
                                    denominationToken={denominationToken}
                                    proposalInput={proposalInput}
                                    setProposalInput={setProposalInput}
                                />
                            </Box>
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
                                    onClick={onCancel}
                                />
                            }
                        />
                    </>
                )}
            </Box>
        </Form>
    )
}

export default ProposalPricingForm
