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
import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { Coin } from 'phosphor-react'
import { ComposerSolverModel } from '@cambrian/app/models/SolverModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import FlexInput from '@cambrian/app/components/inputs/FlexInput'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'

interface CreateTemplateFormProps {
    composition: CompositionModel
    compositionCID: string
    onSuccess: (templateCID: string) => void
    onFailure: () => void
}

export type CreateTemplateFormType = {
    pfp: string
    name: string
    title: string
    description: string
    askingAmount: number
    denominationToken: string // Token address for which to calculate equivalent value
    preferredTokens: 'any' | string[]
    flexInputs: FlexInputs
}

const initialInput = {
    pfp: '',
    name: '',
    title: '',
    description: '',
    askingAmount: 0,
    denominationToken: '0xc778417e063141139fce010982780140aa0cd5ab', // Ropsten wETH // TODO
    preferredTokens: 'any' as 'any',
    flexInputs: {} as FlexInputs,
}

const CreateTemplateForm = ({
    composition,
    onSuccess,
    compositionCID,
}: CreateTemplateFormProps) => {
    const [input, setInput] = useState<CreateTemplateFormType>(initialInput)
    const [denominationTokenSymbol, setDenominationTokenSymbol] = useState<
        string | undefined
    >('')
    const [preferredTokenSymbols, setPreferredTokenSymbols] = useState<
        (string | undefined)[] | undefined
    >()

    /**
     * Initialize input.flexInputs from composition
     */
    useEffect(() => {
        const flexInputs = {} as {
            [solverId: string]: {
                [tagId: string]: TaggedInput
            }
        }

        composition.solvers.forEach((solver) => {
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
        setInput(inputs)
    }, [])

    const setFlexInputValue = (
        solverId: string,
        tagId: string,
        value?: string
    ) => {
        const inputs: CreateTemplateFormType = { ...input }
        inputs.flexInputs[solverId][tagId].value = value
        setInput(inputs)
        setIsFlex(solverId, tagId, !value)
    }

    const setIsFlex = (solverId: string, tagId: string, isFlex: boolean) => {
        const inputs: CreateTemplateFormType = { ...input }
        inputs.flexInputs[solverId][tagId].isFlex = isFlex
        setInput(inputs)
    }

    /**
     * Render an input for any fields in a Solver where "isFlex" == true
     * Flex inputs are provided by the template or proposal
     * These fields may be provided by the template or left "isFlex" for the Proposal stage
     */
    const renderFlexInputs = () => {
        const flexInputs = Object.keys(input.flexInputs).map((solverId) =>
            Object.keys(input.flexInputs[solverId]).map((tagId) => {
                const currentFlexInput = input.flexInputs[solverId][tagId]
                return (
                    <FlexInput
                        key={`${solverId}-${tagId}`}
                        solverId={solverId}
                        input={currentFlexInput}
                        inputType={getFlexInputType(
                            composition.solvers,
                            currentFlexInput
                        )}
                        setIsFlex={setIsFlex}
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

    const fetchTokenSymbols = async (addresses: string) => {
        if (addresses === 'any') {
            return
        } else {
            const addressArray = addresses.split(',')
            const tokenResponses = await Promise.allSettled(
                addressArray.map((address) => TokenAPI.getTokenInfo(address))
            )
            const tokenSymbols = tokenResponses.map((res) =>
                res.status === 'fulfilled' ? res.value?.symbol : undefined
            )
            return tokenSymbols
        }
    }

    const updateDenominationTokenSymbol = async (address: string) => {
        if (address.length === 42) {
            const symbols = await fetchTokenSymbols(address)
            if (symbols) {
                setDenominationTokenSymbol(symbols[0])
            } else {
                setDenominationTokenSymbol(undefined)
            }
        }
    }

    const updatePreferredTokenSymbols = async (addresses: string) => {
        if (addresses === 'any') {
            setPreferredTokenSymbols(undefined)
        }

        const arr = addresses.split(',')
        if (arr[0] !== '' && !arr.find((address) => address.length !== 42)) {
            const symbols = await fetchTokenSymbols(addresses)
            if (symbols) {
                setPreferredTokenSymbols(symbols)
            } else {
                setPreferredTokenSymbols(undefined)
            }
        } else {
            setPreferredTokenSymbols(undefined)
        }
    }

    /**
     * Checks if "collateralToken" is flagged as isFlex
     * If so, it should be provided.
     * If it's not provided, the templater can SUGGEST a few tokens they would prefer
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

        const stageHand = new Stagehand()
        stageHand.setStage(composition, compositionCID, StageNames.composition)
        stageHand.createTemplate(input)
        const res = await stageHand.publishStage(StageNames.template)
        if (res && res.IpfsHash) {
            onSuccess(res?.IpfsHash)
        }
    }

    return (
        <BaseFormContainer>
            <Form<CreateTemplateFormType>
                onChange={(nextValue: CreateTemplateFormType) => {
                    setInput(nextValue)
                }}
                value={input}
                onSubmit={(event) => onSubmit(event)}
            >
                <Box gap="medium">
                    <BaseFormGroupContainer>
                        <FormField
                            name="name"
                            label="Your/Organization Name"
                            required
                        />
                        <FormField name="pfp" label="Avatar URL" required />
                        <FormField
                            name="title"
                            label="Template title"
                            required
                        />
                        <FormField
                            name="description"
                            label="Template description"
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
                    <BaseFormGroupContainer
                        direction="row"
                        gap="small"
                        align="end"
                    >
                        <Box basis="1/4">
                            <FormField
                                name="askingAmount"
                                label="Amount"
                                type="number"
                            />
                        </Box>
                        <Box flex>
                            <FormField
                                name="denominationToken"
                                label="Token address"
                                type="string"
                                onChange={(event) =>
                                    updateDenominationTokenSymbol(
                                        event.target.value
                                    )
                                }
                            />
                        </Box>
                        <Box margin={{ bottom: '1.5em' }}>
                            {denominationTokenSymbol || <Coin size="24" />}
                        </Box>
                        {isUncertainCollateral() && (
                            <FormField
                                name="preferredTokens"
                                label="Preferred tokens for payment"
                                help={
                                    Array.isArray(preferredTokenSymbols)
                                        ? preferredTokenSymbols
                                              .map((x) => x || 'error')
                                              .join(',')
                                        : 'Comma-seperated list of token contract addresses, or "any"'
                                }
                                type="string"
                                onChange={(event) =>
                                    updatePreferredTokenSymbols(
                                        event.target.value
                                    )
                                }
                            />
                        )}
                    </BaseFormGroupContainer>
                    <Box>
                        <Button primary type="submit" label="Create Template" />
                    </Box>
                </Box>
            </Form>
        </BaseFormContainer>
    )
}

export default CreateTemplateForm
