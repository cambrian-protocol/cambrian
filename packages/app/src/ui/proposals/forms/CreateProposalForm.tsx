import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
} from 'grommet'
import { FlexInputs, TaggedInput } from '@cambrian/app/models/SlotTagModel'
import React, { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { ComposerSolverModel } from '@cambrian/app/models/SolverModel'
import FlexInput from '@cambrian/app/components/inputs/FlexInput'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'

interface CreateProposalFormProps {
    template: TemplateModel
}

export type CreateProposalFormType = {
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

const CreateProposalForm = ({ template }: CreateProposalFormProps) => {
    const [input, setInput] = useState<CreateProposalFormType>(initialInput)
    const [preferredTokensString, setPreferredTokensString] = useState('')
    const [suggestedPriceString, setSuggestedPriceString] = useState('')

    /**
     * Initialize input.flexInputs from composition
     */
    useEffect(() => {
        const flexInputs = {} as {
            [solverId: string]: {
                [tagId: string]: TaggedInput
            }
        }
        template.updatedComposition.solvers.forEach((solver) => {
            Object.keys(solver.slotTags).forEach((tagId) => {
                if (solver.slotTags[tagId].isFlex === true) {
                    if (typeof flexInputs[solver.id] === 'undefined') {
                        flexInputs[solver.id] = {}
                    }

                    flexInputs[solver.id][tagId] = {
                        ...solver.slotTags[tagId],
                        value: undefined,
                    }
                }
            })
        })
        const inputs = { ...input }
        inputs.flexInputs = flexInputs
        inputs.price = template.price?.amount || 0
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
        const flexInputs = Object.keys(input.flexInputs).map((solverId) =>
            Object.keys(input.flexInputs[solverId]).map((tagId) => {
                const currentFlexInput = input.flexInputs[solverId][tagId]
                return (
                    <FlexInput
                        required
                        key={`${solverId}-${tagId}`}
                        solverId={solverId}
                        input={currentFlexInput}
                        inputType={getFlexInputType(
                            template.updatedComposition.solvers,
                            currentFlexInput
                        )}
                        setFlexInputValue={setFlexInputValue}
                    />
                )
            })
        )

        if (flexInputs.length !== 0) {
            return <BaseFormGroupContainer>{flexInputs}</BaseFormGroupContainer>
        }
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

        /* 
        const newComposition = mergeFlexIntoComposition(
            template.composition,
            input.flexInputs
        ) */

        /*    const proposalContext = {
            price: input.price,
            title: input.title,
            description: input.description,
            tokenAddress: input.tokenAddress,
            sourceTemplateId: templateId,
        } */

        // Construct template object
        /*  const proposal = {
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
        } as TemplateModel */

        // Pin template to ipfs
        /*  try {
            const res = await ipfs.pin(template)
            if (!res) throw 'No response received'
            onSuccess()
            console.log('Created Template', res.IpfsHash, template, input)
        } catch (e) {
            console.log(e)
            onFailure()
        } */

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
        /*  onSuccess() */
        console.log('Create Proposal', template, input)
    }
    return (
        <BaseFormContainer>
            <Form<CreateProposalFormType>
                onChange={(nextValue: CreateProposalFormType) => {
                    setInput(nextValue)
                }}
                value={input}
                onSubmit={(event) => onSubmit(event)}
            >
                <Box gap="medium">
                    <BaseFormGroupContainer>
                        <FormField name="title" label="Title" required />
                        <FormField
                            name="description"
                            label="Description"
                            required
                        >
                            <TextArea
                                name="description"
                                rows={5}
                                resize={false}
                            />
                        </FormField>
                    </BaseFormGroupContainer>
                    {renderFlexInputs()}
                    <BaseFormGroupContainer>
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
                                            template.updatedComposition
                                                .solvers[0].config[
                                                'collateralToken'
                                            ]
                                        }
                                        disabled
                                    />
                                )}
                            </Box>
                        </Box>
                    </BaseFormGroupContainer>
                    <Box>
                        <Button primary type="submit" label="Create Proposal" />
                    </Box>
                </Box>
            </Form>
        </BaseFormContainer>
    )
}

export default CreateProposalForm
