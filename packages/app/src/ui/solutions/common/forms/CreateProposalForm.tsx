import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
} from 'grommet'
import { FlexInputs, TaggedInput } from '@cambrian/app/models/TagModel'
import React, { useEffect, useState } from 'react'

import { ComposerSolverModel } from '@cambrian/app/models/SolverModel'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { mergeFlexIntoComposition } from '@cambrian/app/utils/transformers/Composition'

interface CreateProposalFormProps {
    template: TemplateModel
    templateId: string
    onSuccess: () => void
    onFailure: () => void
}

type CreateProposalFormType = {
    title: string
    description: string
    price: number
    tokenAddress: string
    flexInputs: FlexInputs
}

const initialInput = {
    title: '',
    description: '',
    price: 0,
    tokenAddress: '',
    flexInputs: {},
}

const CreateProposalForm = ({
    template,
    templateId,
    onSuccess,
    onFailure,
}: CreateProposalFormProps) => {
    const [input, setInput] = useState<CreateProposalFormType>(initialInput)
    const [preferredTokensString, setPreferredTokensString] = useState('')
    const [suggestedPriceString, setSuggestedPriceString] = useState('')

    const ipfs = new IPFSAPI()

    /**
     * Initialize input.flexInputs from composition
     */
    React.useEffect(() => {
        const flexInputs = {} as {
            [solverId: string]: {
                [tagId: string]: TaggedInput
            }
        }

        template.composition.forEach((solver) => {
            Object.keys(solver.tags).forEach((tagId) => {
                if (solver.tags[tagId].isFlex === true) {
                    if (typeof flexInputs[solver.id] === 'undefined') {
                        flexInputs[solver.id] = {}
                    }

                    flexInputs[solver.id][tagId] = {
                        ...solver.tags[tagId],
                        value: undefined,
                    }
                }
            })
        })

        const inputs = { ...input }
        inputs.flexInputs = flexInputs
        setInput(inputs)
    }, [])

    useEffect(() => {
        getPreferredTokensString()
        getSuggestedPriceString()
        console.log(input.tokenAddress)
    }, [])

    const getPreferredTokensString = async () => {
        if (
            template.price?.preferredTokens &&
            template.price.preferredTokens !== 'any'
        ) {
            const tokenResponses = await Promise.allSettled(
                template.price.preferredTokens.map((address) =>
                    TokenAPI.getTokenInfo(address)
                )
            )
            const tokenSymbols = tokenResponses.map((res) =>
                res.status === 'fulfilled' ? res.value?.symbol : undefined
            )

            setPreferredTokensString(
                'Preferred tokens: ' + tokenSymbols.filter(Boolean).join(', ')
            )
        } else {
            setPreferredTokensString('')
        }
    }

    const getSuggestedPriceString = async () => {
        if (template.price?.amount && template.price.denominationToken) {
            const tokenResponse = await TokenAPI.getTokenInfo(
                template.price.denominationToken
            )
            const tokenSymbol = tokenResponse?.symbol

            if (tokenSymbol) {
                setSuggestedPriceString(
                    `Asking Price: ${template.price.amount} ${tokenSymbol} Equivalent`
                )
            } else {
                setSuggestedPriceString('')
            }
        } else {
            setPreferredTokensString('')
        }
    }

    const setFlexInputValue = (
        solverId: string,
        tagId: string,
        value: string | undefined
    ) => {
        const inputs: CreateProposalFormType = { ...input }
        inputs.flexInputs[solverId][tagId].value = value
        setInput(inputs)
    }

    /**
     * Render an input for any fields in a Solver where "isFlex" == true
     * These fields MUST be provided here in the Proposal stage
     */
    const renderFlexInputs = () => {
        return Object.keys(input.flexInputs).map((solverId) => {
            return Object.keys(input.flexInputs[solverId]).map((tagId) => {
                return (
                    <Box direction="row" key={`${solverId}-${tagId}`}>
                        <Box basis="3/4">
                            <FormField
                                name={tagId}
                                label={tagId}
                                help={input.flexInputs[solverId][tagId].text}
                                type={getFlexInputType(
                                    template.composition,
                                    input.flexInputs[solverId][tagId]
                                )}
                                onChange={(event) =>
                                    setFlexInputValue(
                                        solverId,
                                        tagId,
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </Box>
                    </Box>
                )
            })
        })
    }

    const getFlexInputType = (
        composition: ComposerSolverModel[],
        tag: TaggedInput
    ) => {
        if (
            tag.id === 'keeper' ||
            tag.id === 'arbitrator' ||
            tag.id === 'data' ||
            tag.id === 'collateralToken'
        ) {
            return 'string'
        } else if (tag.id === 'timelockSeconds') {
            return 'number'
        } else {
            // Slot ID
            const slot = composition.find(
                (solver) => solver.config.slots[tag.id]
            )?.config.slots[tag.id]

            if (slot?.dataTypes[0] === SolidityDataTypes.Uint256) {
                return 'number'
            } else {
                return 'string'
            }
        }
    }

    /**
     * Checks if "collateralToken" is flagged as isFlex
     * If so, it should be provided.
     */
    const isUncertainCollateral = () => {
        let bool = false
        Object.keys(input.flexInputs).forEach((solverId) => {
            if (input.flexInputs[solverId]['collateralToken']?.isFlex) {
                bool = true
            }
        })
        return bool
    }

    const onSubmit = async (event: FormExtendedEvent) => {
        event.preventDefault()

        const newComposition = mergeFlexIntoComposition(
            template.composition,
            input.flexInputs
        )

        const proposalContext = {
            price: input.price,
            title: input.title,
            description: input.description,
            tokenAddress: input.tokenAddress,
            sourceTemplateId: templateId,
        }

        // Construct template object
        const proposal = {
            composition: newComposition,
            pfp: input.pfp,
            name: input.name,
            title: input.title,
            description: input.description,
            price: {
                amount: input.askingAmount,
                denominationToken: input.denominationToken,
                preferredTokens: input.preferredTokens,
            },
        } as TemplateModel

        // Pin template to ipfs
        try {
            const res = await ipfs.pin(template)
            if (!res) throw 'No response received'
            onSuccess()
            console.log('Created Template', res.IpfsHash, template, input)
        } catch (e) {
            console.log(e)
            onFailure()
        }

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
        console.log('Create Proposal', template, input)
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
                <Box>{renderFlexInputs()}</Box>
                <Box direction="row" gap="small">
                    <Box width={{ max: 'medium' }}>
                        <FormField
                            name="price"
                            label="Price"
                            type="number"
                            help={`${suggestedPriceString}`}
                            required
                        />
                    </Box>
                    <Box fill>
                        {isUncertainCollateral() ? (
                            <FormField
                                name="tokenAddress"
                                label="Payment Token address"
                                help={`${preferredTokensString}`}
                                required
                            />
                        ) : (
                            <FormField
                                name="tokenAddress"
                                label="Payment Token address"
                                value={
                                    template.composition[0].config[
                                        'collateralToken'
                                    ]
                                }
                                disabled
                            />
                        )}
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
