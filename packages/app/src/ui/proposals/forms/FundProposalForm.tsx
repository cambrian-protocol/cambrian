import { Box, Button, Form, FormField } from 'grommet'
import React, { useState } from 'react'

import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface FundProposalFormProps {
    onExecuteProposal: () => void
    onApproveFunding: (amountToFund: number) => Promise<boolean>
    onFundProposal: (amountToFund: number) => Promise<boolean>
    onDefundProposal: (amountToDefund: number) => void
    token: TokenModel
    isFunded: boolean
}

type FundProposalFormType = {
    amount: number
}

const initialInput = {
    amount: 0,
}

const FundProposalForm = ({
    token,
    onExecuteProposal,
    onApproveFunding,
    onFundProposal,
    onDefundProposal,
    isFunded,
}: FundProposalFormProps) => {
    const [input, setInput] = useState<FundProposalFormType>(initialInput)
    const [isApproved, setIsApproved] = useState(false)

    const onSubmit = async () => {
        if (await onFundProposal(input.amount)) {
            setIsApproved(false)
            setInput(initialInput)
        }
    }

    const onApprove = async () => {
        setIsApproved(await onApproveFunding(input.amount))
    }

    return (
        <>
            <Form<FundProposalFormType>
                onChange={(nextValue: FundProposalFormType) => {
                    setInput(nextValue)
                }}
                value={input}
                onSubmit={isApproved ? onSubmit : onApprove}
            >
                <Box gap="medium">
                    <BaseFormGroupContainer
                        direction="row"
                        gap="small"
                        justify="center"
                    >
                        <Box>
                            <FormField
                                name="amount"
                                label="Amount"
                                type="number"
                                required
                            />
                        </Box>
                        <TokenAvatar token={token} />
                    </BaseFormGroupContainer>
                    <Box direction="row" justify="between">
                        <Button
                            secondary
                            label="Defund"
                            onClick={() => onDefundProposal(input.amount)}
                        />
                        {isFunded ? (
                            <Button
                                primary
                                onClick={onExecuteProposal}
                                label="Execute Proposal"
                            />
                        ) : isApproved ? (
                            <Button
                                disabled={isFunded}
                                primary
                                type="submit"
                                label="Fund Proposal"
                            />
                        ) : (
                            <Button
                                primary
                                type="submit"
                                label="Approve access"
                            />
                        )}
                    </Box>
                </Box>
            </Form>
        </>
    )
}

export default FundProposalForm
