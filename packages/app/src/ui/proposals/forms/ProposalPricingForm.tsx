import { Box, Button, Form, FormExtendedEvent, Text } from 'grommet'

import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import BaseTokenBadge from '@cambrian/app/components/token/BaseTokenBadge'
import ButtonRowContainer from '@cambrian/app/components/containers/ButtonRowContainer'
import { EditProposalContextType } from '@cambrian/app/hooks/useEditProposal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import NumberInput from '@cambrian/app/components/inputs/NumberInput'
import SelectTokenItem from '@cambrian/app/components/token/SelectTokenItem'
import { useState } from 'react'

interface ProposalPricingFormProps {
    editProposalContext: EditProposalContextType
    onSubmit?: () => Promise<void>
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
}

const ProposalPricingForm = ({
    editProposalContext,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
}: ProposalPricingFormProps) => {
    const {
        stageStack,
        proposal,
        setProposal,
        onSaveProposal,
        onResetProposal,
        collateralToken,
    } = editProposalContext

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: FormExtendedEvent<{}, Element>) => {
        event.preventDefault()
        setIsSubmitting(true)
        onSubmit ? await onSubmit() : await onSaveProposal()
        setIsSubmitting(false)
    }

    if (!stageStack || !proposal) {
        return (
            <Box height="large" gap="medium">
                <BaseSkeletonBox height={'xsmall'} width={'100%'} />
                <BaseSkeletonBox height={'xsmall'} width={'100%'} />
            </Box>
        )
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
                            {stageStack.template.price.allowAnyPaymentToken ||
                            (stageStack.template.price.preferredTokens &&
                                stageStack.template.price.preferredTokens
                                    .length > 0) ? (
                                <>
                                    <Text>
                                        The seller quotes an equivalent of{' '}
                                        {stageStack.template.price?.amount}{' '}
                                        {collateralToken?.symbol}
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
                                        {stageStack.template.price?.amount}{' '}
                                        {collateralToken?.symbol}
                                    </Text>
                                    <Text color="dark-4" size="small">
                                        Feel free to make a counter offer, if
                                        you assume it might be accepted
                                    </Text>
                                </>
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
                                    value={proposal.price.amount}
                                    onChange={(e) =>
                                        setProposal({
                                            ...proposal,
                                            price: {
                                                ...proposal.price,
                                                amount: Number(e.target.value),
                                            },
                                        })
                                    }
                                />
                            </Box>
                            {stageStack.template.price.allowAnyPaymentToken ||
                            stageStack.template.price.preferredTokens.length >
                                0 ? (
                                <SelectTokenItem
                                    allowAnyPaymentToken={
                                        stageStack.template.price
                                            .allowAnyPaymentToken
                                    }
                                    preferredTokenList={stageStack.template.price.preferredTokens.concat(
                                        [
                                            stageStack.template.price
                                                .denominationTokenAddress,
                                        ]
                                    )}
                                    tokenAddress={proposal.price.tokenAddress}
                                    onSelect={(newSelectedToken) => {
                                        setProposal({
                                            ...proposal,
                                            price: {
                                                ...proposal.price,
                                                tokenAddress: newSelectedToken,
                                            },
                                        })
                                    }}
                                />
                            ) : (
                                <BaseTokenBadge token={collateralToken} />
                            )}
                        </Box>
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
                            label={cancelLabel || 'Reset all changes'}
                            onClick={onCancel ? onCancel : onResetProposal}
                        />
                    }
                />
            </Box>
        </Form>
    )
}

export default ProposalPricingForm
