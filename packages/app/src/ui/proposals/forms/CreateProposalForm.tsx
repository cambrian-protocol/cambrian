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
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import ExportSuccessModal from '../../composer/general/modals/ExportSuccessModal'
import FlexInput from '@cambrian/app/components/inputs/FlexInput'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import Stagehand from '@cambrian/app/classes/Stagehand'
import { TRANSACITON_MESSAGE } from '@cambrian/app/constants/TransactionMessages'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { Text } from 'grommet'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface CreateProposalFormProps {
    composition: CompositionModel
    template: TemplateModel
    templateCID: string
}

export type CreateProposalFormType = {
    name: string
    pfp: string
    title: string
    description: string
    price: number
    tokenAddress: string
    flexInputs: FlexInputs
}

const initialInput = {
    name: '',
    pfp: '',
    title: '',
    description: '',
    price: 0,
    tokenAddress: '',
    flexInputs: {},
}

const CreateProposalForm = ({
    composition,
    template,
    templateCID,
}: CreateProposalFormProps) => {
    const { currentUser } = useCurrentUser()
    const [input, setInput] = useState<CreateProposalFormType>(initialInput)
    const [preferredTokensString, setPreferredTokensString] = useState('')
    const [suggestedPriceString, setSuggestedPriceString] = useState('')
    const [proposalId, setProposalId] = useState<string>()
    const [errorMsg, setErrorMsg] = useState<string>()
    const [transactionMsg, setTransactionMsg] = useState<string>()

    /**
     * Initialize input.flexInputs from template
     */
    useEffect(() => {
        const inputs = { ...input }
        inputs.flexInputs = template.flexInputs
        inputs.price = template.price?.amount || 0
        inputs.tokenAddress = template.price?.denominationToken || ''
        setInput(inputs)
    }, [])

    useEffect(() => {
        getPreferredTokensString()
        getSuggestedPriceString()
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
                            composition.solvers,
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
        setTransactionMsg(TRANSACITON_MESSAGE['CONFIRM'])
        try {
            if (!currentUser)
                throw new Error(
                    'You must connect a wallet in order to create a proposal!'
                )
            const stagehand = new Stagehand()
            const response = await stagehand.publishProposal(input, templateCID)
            if (!response)
                throw new Error('Error while publishing proposal to IPFS')

            const proposalsHub = new ProposalsHub(currentUser.signer)

            const proposalId = await proposalsHub.createSolutionAndProposal(
                response.parsedSolvers[0].collateralToken,
                input.price,
                response.parsedSolvers.map((solver) => solver.config),
                response.cid
            )
            if (!proposalId)
                throw new Error('Error while deploying solution and proposal')

            setProposalId(proposalId)
        } catch (e: any) {
            console.error(e)
            setErrorMsg(e.message)
        }
        setTransactionMsg(undefined)
    }

    // TODO Refactor Form / Dynamic Flex Inputs / Validation / Validate Type Error handling
    return (
        <>
            <BaseFormContainer>
                <Form<CreateProposalFormType>
                    onChange={(nextValue: CreateProposalFormType) => {
                        setInput(nextValue)
                    }}
                    value={input}
                    onSubmit={(event) => onSubmit(event)}
                    onValidate={(validation) => {
                        Object.keys(input.flexInputs).forEach((solverId) => {
                            Object.keys(input.flexInputs[solverId]).map(
                                (tagId) => {
                                    const inputValue =
                                        input.flexInputs[solverId][tagId].value
                                    if (
                                        inputValue === undefined ||
                                        inputValue === ''
                                    ) {
                                        validation.errors[
                                            input.flexInputs[solverId][tagId].id
                                        ] = 'required'
                                    }
                                }
                            )
                        })
                    }}
                >
                    <Box gap="medium">
                        <BaseFormGroupContainer>
                            <FormField
                                name="name"
                                label="Your/Organization Name"
                            />
                            <FormField name="pfp" label="Avatar URL" />
                        </BaseFormGroupContainer>
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
                                        required
                                    />
                                    <Text size="xsmall" color="dark-4">
                                        {suggestedPriceString}
                                    </Text>
                                </Box>
                                <Box fill>
                                    {isUncertainCollateral() ? (
                                        <Box>
                                            <FormField
                                                name="tokenAddress"
                                                label="Payment Token address"
                                                required
                                            />
                                            <Text size="xsmall" color="dark-4">
                                                {preferredTokensString}
                                            </Text>
                                        </Box>
                                    ) : (
                                        <FormField
                                            name="tokenAddress"
                                            label="Payment Token address"
                                            value={
                                                composition.solvers[0].config[
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
                            <Button
                                primary
                                type="submit"
                                label="Create Proposal"
                            />
                        </Box>
                    </Box>
                </Form>
            </BaseFormContainer>
            {proposalId && (
                <ExportSuccessModal
                    ctaLabel="Fund Proposal"
                    link="/proposals/"
                    exportedCID={proposalId}
                    description="This is your Proposal Id. Share it with your investors and fund the proposal."
                    title="Proposal created"
                    onClose={() => setProposalId(undefined)}
                />
            )}
            {errorMsg && (
                <ErrorPopupModal
                    errorMessage={errorMsg}
                    onClose={() => setErrorMsg(undefined)}
                />
            )}
            {transactionMsg && <LoadingScreen context={transactionMsg} />}
        </>
    )
}

export default CreateProposalForm
