import { Box, Button, Form, FormField } from 'grommet'
import React, { useState } from 'react'

import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface FundProposalFormProps {
    hasApproved: boolean
    onApproveFunding: (amountToFund: number) => void
    onFundProposal: (amountToFund: number) => void
    onDefundProposal: (amountToDefund: number) => void
    token: TokenModel
}

type FundProposalFormType = {
    amount: number
}

const initialInput = {
    amount: 0,
}

const FundProposalForm = ({
    hasApproved,
    token,
    onApproveFunding,
    onFundProposal,
    onDefundProposal,
}: FundProposalFormProps) => {
    const [input, setInput] = useState<FundProposalFormType>(initialInput)

    const onSubmit = () => {
        onFundProposal(input.amount)
        setInput(initialInput)
    }

    const onApprove = () => {
        onApproveFunding(input.amount)
    }

    return (
        <>
            <Form<FundProposalFormType>
                onChange={(nextValue: FundProposalFormType) => {
                    setInput(nextValue)
                }}
                value={input}
                onSubmit={hasApproved ? onSubmit : onApprove}
            >
                <Box gap="medium">
                    <Box direction="row" gap="small" justify="center">
                        <Box basis="1/4">
                            <FormField
                                name="amount"
                                label="Amount"
                                type="number"
                                required
                            />
                        </Box>
                        <TokenAvatar token={token} />
                    </Box>
                    <Box direction="row" justify="between">
                        <Button
                            secondary
                            label="Defund"
                            onClick={() => onDefundProposal(input.amount)}
                        />
                        {hasApproved ? (
                            <Button
                                primary
                                type="submit"
                                label="Fund Proposal"
                            />
                        ) : (
                            <Button
                                primary
                                type="submit"
                                label="Approve Spend"
                            />
                        )}
                    </Box>
                </Box>
            </Form>
        </>
    )
}

export default FundProposalForm
