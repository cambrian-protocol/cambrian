import { Box, Button, Form, FormExtendedEvent, FormField, Text } from 'grommet'
import { SetStateAction, useEffect, useState } from 'react'

import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TokenInput from '@cambrian/app/components/inputs/TokenInput'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import TwoButtonWrapContainer from '@cambrian/app/components/containers/TwoButtonWrapContainer'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface ProposalPricingFormProps {
    proposalInput: ProposalModel
    template: TemplateModel
    setProposalInput: React.Dispatch<SetStateAction<ProposalModel | undefined>>
    onSubmit: () => Promise<void>
    submitLabel?: string
    onCancel?: () => void
    cancelLabel?: string
}

const ProposalPricingForm = ({
    proposalInput,
    template,
    setProposalInput,
    onSubmit,
    submitLabel,
    onCancel,
    cancelLabel,
}: ProposalPricingFormProps) => {
    const { currentUser } = useCurrentUserContext()
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

    const handleSubmit = async (event: FormExtendedEvent<{}, Element>) => {
        event.preventDefault()
        setIsSubmitting(true)
        await onSubmit()
        setIsSubmitting(false)
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Box justify="between" height={{ min: '50vh' }} gap="medium">
                <Box gap="medium">
                    <Box gap="medium" pad="xsmall">
                        <Box
                            pad="small"
                            round="xsmall"
                            background="background-contrast"
                            border
                            elevation="small"
                        >
                            {template.price.allowAnyPaymentToken ||
                            (template.price.preferredTokens &&
                                template.price.preferredTokens.length > 0) ? (
                                <>
                                    <Text>
                                        The seller quotes an equivalent of{' '}
                                        {template.price?.amount}{' '}
                                        {denominationToken?.symbol}
                                    </Text>
                                    <Text color="dark-4" size="small">
                                        Please make sure you match the value if
                                        you want to pay with a different token.
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Text>
                                        The seller quotes{' '}
                                        {template.price?.amount}{' '}
                                        {denominationToken?.symbol}
                                    </Text>
                                    <Text color="dark-4" size="small">
                                        Feel free to make a counter offer, if
                                        you assume it might be accepted
                                    </Text>
                                </>
                            )}
                        </Box>
                        <Box direction="row" gap="small">
                            <FormField
                                label="Amount"
                                type="number"
                                step={0.000000001}
                                min={0}
                                value={proposalInput.price.amount}
                                onChange={(e) =>
                                    setProposalInput({
                                        ...proposalInput,
                                        price: {
                                            ...proposalInput.price,
                                            amount: Number(e.target.value),
                                        },
                                    })
                                }
                            />
                            {denominationToken && (
                                <TokenInput
                                    template={template}
                                    denominationToken={denominationToken}
                                    proposalInput={proposalInput}
                                    setProposalInput={setProposalInput}
                                />
                            )}
                        </Box>
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
            </Box>
        </Form>
    )
}

export default ProposalPricingForm
