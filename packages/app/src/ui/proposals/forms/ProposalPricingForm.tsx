import { Box, Text } from 'grommet'

import BaseTokenBadge from '@cambrian/app/components/token/BaseTokenBadge'
import NumberInput from '@cambrian/app/components/inputs/NumberInput'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import { ProposalInputType } from '../EditProposalUI'
import SelectTokenItem from '@cambrian/app/components/token/SelectTokenItem'
import { SetStateAction } from 'react'
import _ from 'lodash'

interface ProposalPricingFormProps {
    disabled?: boolean
    proposal: Proposal
    proposalInput: ProposalInputType
    setProposalInput: React.Dispatch<SetStateAction<ProposalInputType>>
}

const ProposalPricingForm = ({
    disabled,
    proposal,
    proposalInput,
    setProposalInput,
}: ProposalPricingFormProps) => {
    const templatePrice = proposal.template.content.price
    const isFlexibleCollateralToken =
        templatePrice.allowAnyPaymentToken ||
        templatePrice.preferredTokens.length > 0

    return (
        <Box gap="medium" margin={{ bottom: 'small' }}>
            <Box
                pad="small"
                round="xsmall"
                background="background-contrast"
                border
                elevation="small"
            >
                <Text>
                    The seller quotes
                    {isFlexibleCollateralToken ? ' an equivalent of ' : ' '}
                    {templatePrice.amount} {proposal.denominationToken.symbol}
                </Text>
                {isFlexibleCollateralToken ? (
                    <Text color="dark-4" size="small">
                        Please make sure you match the value if you want to pay
                        with a different token.
                    </Text>
                ) : (
                    <Text color="dark-4" size="small">
                        Feel free to make a counter offer, if you assume it
                        might be accepted.
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
                        disabled={disabled}
                        name="amount"
                        value={proposalInput.price.amount}
                        onChange={(e) =>
                            setProposalInput({
                                ...proposalInput,
                                price: {
                                    ...proposalInput.price,
                                    amount:
                                        e.target.value === ''
                                            ? ''
                                            : Number(e.target.value),
                                },
                            })
                        }
                    />
                </Box>
                {isFlexibleCollateralToken && !disabled ? (
                    <SelectTokenItem
                        allowAnyPaymentToken={
                            templatePrice.allowAnyPaymentToken
                        }
                        preferredTokenList={templatePrice.preferredTokens.concat(
                            [templatePrice.denominationTokenAddress]
                        )}
                        tokenAddress={proposalInput.price.tokenAddress}
                        onSelect={(newSelectedToken) =>
                            setProposalInput({
                                ...proposalInput,
                                price: {
                                    ...proposalInput.price,
                                    tokenAddress: newSelectedToken,
                                },
                            })
                        }
                    />
                ) : (
                    <BaseTokenBadge token={proposal.collateralToken} />
                )}
            </Box>
        </Box>
    )
}

export default ProposalPricingForm
