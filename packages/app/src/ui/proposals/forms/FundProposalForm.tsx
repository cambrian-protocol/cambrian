import { Box, Button, Form, FormField } from 'grommet'
import React, { useState } from 'react'

import { Coin } from 'phosphor-react'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface FundProposalFormProps {
    token: TokenModel
}

type FundProposalFormType = {
    fundingAmount: number
}

const initialInput = {
    fundingAmount: 0,
}

const FundProposalForm = ({ token }: FundProposalFormProps) => {
    const [input, setInput] = useState<FundProposalFormType>(initialInput)

    const onSubmit = () => {
        /*
        TODO Fund proposal
           await this.ProposalsHub.connect(this.buyer).fundProposal(
            proposalId,
            this.ToyToken.address,
            input
            );  
            onSuccess()
         */
        setInput(initialInput)
        console.log(input)
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
                <Box direction="row" gap="small">
                    <Box flex>
                        <FormField
                            name="fundingAmount"
                            label="Fund"
                            type="number"
                            required
                        />
                    </Box>
                    <TokenAvatar token={token} />
                </Box>
                <Box pad={{ top: 'medium' }}>
                    <Button
                        primary
                        type="submit"
                        label="Fund Proposal"
                        icon={<Coin size="24" />}
                    />
                </Box>
            </Form>
        </>
    )
}

export default FundProposalForm
