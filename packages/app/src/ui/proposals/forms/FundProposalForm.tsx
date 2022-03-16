import { Box, Button, Form, FormField } from 'grommet'
import React, { useState } from 'react'

import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface FundProposalFormProps {
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
    token,
    onFundProposal,
    onDefundProposal,
}: FundProposalFormProps) => {
    const [input, setInput] = useState<FundProposalFormType>(initialInput)

    const onSubmit = () => {
        onFundProposal(input.amount)
        setInput(initialInput)
    }
    return (
        <>
            <Form<FundProposalFormType>
                onChange={(nextValue: FundProposalFormType) => {
                    setInput(nextValue)
                }}
                value={input}
                onSubmit={onSubmit}
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
                        <Button primary type="submit" label="Fund Proposal" />
                    </Box>
                </Box>
            </Form>
        </>
    )
}

export default FundProposalForm
