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
import { Coin } from 'phosphor-react'
import { ComposerSolverModel } from '@cambrian/app/models/SolverModel'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import FlexInput from '@cambrian/app/components/inputs/FlexInput'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'

interface CreateTemplateFormProps {
    composition: CompositionModel
    onSuccess: (templateCId: string) => void
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
    onFailure,
}: CreateTemplateFormProps) => {
    const [input, setInput] = useState<CreateTemplateFormType>(initialInput)
    const [denominationTokenSymbol, setDenominationTokenSymbol] = useState<
        string | undefined
    >('')
    const [preferredTokenSymbols, setPreferredTokenSymbols] = useState<
        (string | undefined)[] | undefined
    >()

    const ipfs = new IPFSAPI()

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
        const updatedComposerSolvers = [...composition.solvers]
        // Update our composition with new flexInput values
        if (Object.entries(input.flexInputs).length > 0) {
            updatedComposerSolvers.forEach(
                (solver: ComposerSolverModel, i: number) => {
                    for (const [tagId, taggedInput] of Object.entries(
                        input.flexInputs[solver.id]
                    )) {
                        console.log(tagId, taggedInput)
                        updatedComposerSolvers[i].slotTags[tagId] = {
                            id: taggedInput.id,
                            label: taggedInput.label,
                            description: taggedInput.description,
                            isFlex: taggedInput.isFlex,
                        }

                        if (typeof taggedInput.value !== 'undefined') {
                            switch (tagId) {
                                case 'keeper':
                                    updatedComposerSolvers[i].config[
                                        'keeperAddress'
                                    ].address = taggedInput.value
                                    break

                                case 'arbitrator':
                                    updatedComposerSolvers[i].config[
                                        'arbitratorAddress'
                                    ].address = taggedInput.value
                                    break

                                case 'data':
                                    updatedComposerSolvers[i].config['data'] =
                                        taggedInput.value
                                    break

                                case 'collateralToken':
                                    updatedComposerSolvers[i].config[
                                        'collateralToken'
                                    ] = taggedInput.value
                                    break

                                case 'timelockSeconds':
                                    updatedComposerSolvers[i].config[
                                        'timelockSeconds'
                                    ] = parseInt(taggedInput.value)
                                    break

                                default:
                                    // SlotID
                                    updatedComposerSolvers[i].config.slots[
                                        tagId
                                    ].data = [taggedInput.value]
                            }
                        }
                    }
                }
            )
        }

        // Construct template object
        const template: TemplateModel = {
            composerSolvers: updatedComposerSolvers,
            pfp: input.pfp,
            name: input.name,
            title: input.title,
            description: input.description,
            price: {
                amount: input.askingAmount,
                denominationToken: input.denominationToken,
                preferredTokens: input.preferredTokens,
            },
        }

        // Pin template to ipfs
        try {
            const res = await ipfs.pin(template)
            if (res && res.IpfsHash) {
                onSuccess(res.IpfsHash)
            }
        } catch (e) {
            console.log(e)
            onFailure()
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
