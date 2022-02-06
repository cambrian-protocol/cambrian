import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
} from 'grommet'
import React, { useState } from 'react'

import { SolutionModel } from '@cambrian/app/models/SolutionModel'

interface CreateProposalFormProps {
    solution: SolutionModel
    onSuccess: () => void
    onFailure: () => void
}

type CreateProposalFormType = {
    title: string
    description: string
    price: number
    tokenAddress: string
}

const initialInput = {
    title: '',
    description: '',
    price: 0,
    tokenAddress: '',
}

const CreateProposalForm = ({
    solution,
    onSuccess,
    onFailure,
}: CreateProposalFormProps) => {
    const [input, setInput] = useState<CreateProposalFormType>(initialInput)

    const onSubmit = (event: FormExtendedEvent) => {
        event.preventDefault()
        /* 
        Create proposal and save proposal data to ipfs

        Transformer parsesSolvers and spits out solverConfigs
         
        const cid = await Hash.of(solverConfigs);

        await this.IPFSSolutionsHub.connect(this.keeper).createSolution(
        solutionId,
        this.ToyToken.address,
        solverConfigs,
        getBytes32FromMultihash(cid)
        );

        let tx = await this.ProposalsHub.connect(this.keeper).createProposal(
        this.ToyToken.address,
        this.IPFSSolutionsHub.address,
        this.amount,
        solutionId
        );
        let rc = await tx.wait();
        const proposalId = new ethers.utils.Interface([
        "event CreateProposal(bytes32 id)",
        ]).parseLog(rc.logs[0]).args.id;
        
        Display CTA to view proposal via proposalId
        */
        onSuccess()
        console.log('Create Proposal', solution, input)
    }
    return (
        <>
            <Form<CreateProposalFormType>
                onChange={(nextValue: CreateProposalFormType) => {
                    setInput(nextValue)
                }}
                value={input}
                onSubmit={(event) => onSubmit(event)}
            >
                <FormField name="title" label="Title" required />
                <FormField name="description" label="Description" required>
                    <TextArea name="description" rows={5} resize={false} />
                </FormField>
                <Box direction="row" gap="small">
                    <Box width={{ max: 'xsmall' }}>
                        <FormField
                            name="price"
                            label="Price"
                            type="number"
                            required
                        />
                    </Box>
                    <Box fill>
                        <FormField
                            name="tokenAddress"
                            label="Token address"
                            required
                        />
                    </Box>
                </Box>
                <Box pad={{ top: 'medium' }}>
                    <Button primary type="submit" label="Create Proposal" />
                </Box>
            </Form>
        </>
    )
}

export default CreateProposalForm
