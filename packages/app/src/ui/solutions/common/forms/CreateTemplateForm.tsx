import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
} from 'grommet'
import { CheckBox, Header } from 'grommet'
import { FlexInputs, Tag, TaggedInput } from '@cambrian/app/models/TagModel'
import React, { useState } from 'react'

import { ComposerSolverModel } from '@cambrian/app/models/SolverModel'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import KeeperInputsModal from '@cambrian/app/components/modals/KeeperInputsModal'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'

interface CreateTemplateFormProps {
    composition: ComposerSolverModel[]
    onSuccess: (cid: string) => void
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
    React.useEffect(() => {
        const flexInputs = {} as {
            [solverId: string]: {
                [tagId: string]: TaggedInput
            }
        }

        composition.forEach((solver) => {
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

    const setFlexInputValue = (
        solverId: string,
        tagId: string,
        value: string | undefined
    ) => {
        const inputs: CreateTemplateFormType = { ...input }
        inputs.flexInputs[solverId][tagId].value = value
        setInput(inputs)
        setIsFlex(solverId, tagId, !value)
    }

    const setIsFlex = (solverId: string, tagId: string, bool: boolean) => {
        const inputs: CreateTemplateFormType = { ...input }
        inputs.flexInputs[solverId][tagId].isFlex = bool
        setInput(inputs)
    }

    /**
     * Render an input for any fields in a Solver where "isFlex" == true
     * Flex inputs are provided by the template or proposal
     * These fields may be provided by the template or left "isFlex" for the Proposal stage
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
                                    composition,
                                    input.flexInputs[solverId][tagId]
                                )}
                                onChange={(event) =>
                                    setFlexInputValue(
                                        solverId,
                                        tagId,
                                        event.target.value
                                    )
                                }
                            />
                        </Box>

                        <Box align="end">
                            <CheckBox
                                checked={
                                    input.flexInputs[solverId][tagId].isFlex
                                }
                                label="Leave Unfilled"
                                onChange={(event) =>
                                    setIsFlex(
                                        solverId,
                                        tagId,
                                        event.target.checked
                                    )
                                }
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

        const newComposition = composition.map((x) => x)

        // Update our composition with new flexInput values
        newComposition.forEach((solver: ComposerSolverModel, i: number) => {
            for (const [tagId, taggedInput] of Object.entries(
                input.flexInputs[solver.id]
            )) {
                newComposition[i].tags[tagId] = {
                    id: taggedInput.id,
                    text: taggedInput.text,
                    isFlex: taggedInput.isFlex,
                }

                if (typeof taggedInput.value !== 'undefined') {
                    switch (tagId) {
                        case 'keeper':
                            newComposition[i].config['keeperAddress'].address =
                                taggedInput.value
                            break

                        case 'arbitrator':
                            newComposition[i].config[
                                'arbitratorAddress'
                            ].address = taggedInput.value
                            break

                        case 'data':
                            newComposition[i].config['data'] = taggedInput.value
                            break

                        case 'collateralToken':
                            newComposition[i].config['collateralToken'] =
                                taggedInput.value
                            break

                        case 'timelockSeconds':
                            newComposition[i].config['collateralToken'] =
                                taggedInput.value
                            break

                        default:
                            // SlotID
                            newComposition[i].config.slots[tagId].data = [
                                taggedInput.value,
                            ]
                    }
                }
            }
        })

        // Construct template object
        const template = {
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
            onSuccess(res.IpfsHash)
            console.log('Created Template', res.IpfsHash, template, input)
        } catch (e) {
            console.log(e)
            onFailure()
        }
    }

    return (
        <>
            <Form<CreateTemplateFormType>
                onChange={(nextValue: CreateTemplateFormType) => {
                    setInput(nextValue)
                }}
                value={input}
                onSubmit={(event) => onSubmit(event)}
            >
                <FormField
                    name="name"
                    label="Your/Organization Name"
                    required
                />
                <FormField name="pfp" label="Avatar URL" required />
                <FormField name="title" label="Title" required />
                <FormField name="description" label="Description" required>
                    <TextArea name="description" rows={5} resize={false} />
                </FormField>
                <Header>Awaiting Inputs</Header>
                <Box gap="small">{renderFlexInputs()}</Box>
                <Box gap="small">
                    <FormField name="price" label="Asking Price">
                        <FormField
                            name="denominationToken"
                            label="Denomination token"
                            help={denominationTokenSymbol || 'Contract address'}
                            type="string"
                            onChange={(event) =>
                                updateDenominationTokenSymbol(
                                    event.target.value
                                )
                            }
                        />
                        <FormField
                            name="askingAmount"
                            label="Amount (in the denomination token)"
                            help="eg. 1.0042"
                            type="number"
                        />
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
                    </FormField>
                </Box>
                <Box pad={{ top: 'medium' }}>
                    <Button primary type="submit" label="Create Template" />
                </Box>
            </Form>
        </>
    )
}

export default CreateTemplateForm
