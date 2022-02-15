import KeeperInputsModal from '@cambrian/app/components/modals/KeeperInputsModal'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { Tag } from '@cambrian/app/models/TagModel'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { IPFSAPI } from '@cambrian/app/services/api/IPFS.api'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { CheckBox, Header } from 'grommet'
import {
    Box,
    Button,
    Form,
    FormExtendedEvent,
    FormField,
    TextArea,
} from 'grommet'
import React, { useState } from 'react'

interface CreateTemplateFormProps {
    composition: SolverModel[]
    onSuccess: (cid: string) => void
    onFailure: () => void
}

type CreateTemplateFormType = {
    pfp: string
    name: string
    title: string
    description: string
    askingAmount: number
    denominationToken: string // Token address for which to calculate equivalent value
    preferredTokens: 'any' | string[]
    awaitingInputs: {
        [solverId: string]: {
            [tagId: string]: TaggedInput
        }
    }
}

type TaggedInput = Tag & {
    value: string | undefined
}

const initialInput = {
    pfp: '',
    name: '',
    title: '',
    description: '',
    askingAmount: 0,
    denominationToken: '0xc778417e063141139fce010982780140aa0cd5ab', // Ropsten wETH // TODO
    preferredTokens: 'any' as 'any',
    awaitingInputs: {},
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
    >([])

    const ipfs = new IPFSAPI()

    React.useEffect(() => {
        console.log(input)
    }, [input])

    React.useEffect(() => {
        const awaitingInputs = {} as {
            [solverId: string]: {
                [tagId: string]: TaggedInput
            }
        }

        composition.forEach((solver) => {
            Object.keys(solver.tags).forEach((tagId) => {
                if (solver.tags[tagId].isAwaitingInput === true) {
                    if (typeof awaitingInputs[solver.id] === 'undefined') {
                        awaitingInputs[solver.id] = {}
                    }

                    awaitingInputs[solver.id][tagId] = {
                        ...solver.tags[tagId],
                        value: undefined,
                    }
                }
            })
        })

        const inputs = { ...input }
        inputs.awaitingInputs = awaitingInputs
        setInput(inputs)
    }, [])

    const setAwaitedInputValue = (
        solverId: string,
        tagId: string,
        value: string | undefined
    ) => {
        const inputs: CreateTemplateFormType = { ...input }
        inputs.awaitingInputs[solverId][tagId].value = value
        inputs.awaitingInputs[solverId][tagId].isAwaitingInput = false
        setInput(inputs)
    }

    const setIsAwaitingInput = (
        solverId: string,
        tagId: string,
        bool: boolean
    ) => {
        const inputs: CreateTemplateFormType = { ...input }
        inputs.awaitingInputs[solverId][tagId].isAwaitingInput = bool
        setInput(inputs)
    }

    const renderAwaitedInputs = () => {
        return Object.keys(input.awaitingInputs).map((solverId) => {
            return Object.keys(input.awaitingInputs[solverId]).map((tagId) => {
                return (
                    <Box direction="row" key={`${solverId}-${tagId}`}>
                        <Box basis="3/4">
                            <FormField
                                name={tagId}
                                label={tagId}
                                help={
                                    input.awaitingInputs[solverId][tagId].text
                                }
                                type={getInputType(
                                    composition,
                                    input.awaitingInputs[solverId][tagId]
                                )}
                                onChange={(event) =>
                                    setAwaitedInputValue(
                                        solverId,
                                        tagId,
                                        event.target.value
                                    )
                                }
                            />
                        </Box>

                        <Box align="end">
                            <CheckBox
                                label="Leave Unfilled"
                                onChange={(event) =>
                                    setIsAwaitingInput(
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

    const getInputType = (composition: SolverModel[], tag: TaggedInput) => {
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

    const onSubmit = async (event: FormExtendedEvent) => {
        event.preventDefault()

        const newComposition = composition.map((x) => x)

        newComposition.forEach((solver: SolverModel, i: number) => {
            for (const [tagId, taggedInput] of Object.entries(
                input.awaitingInputs[solver.id]
            )) {
                newComposition[i].tags[tagId] = {
                    id: taggedInput.id,
                    text: taggedInput.text,
                    isAwaitingInput: taggedInput.isAwaitingInput,
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

        const template = {
            composition: composition,
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

        try {
            /* 
        Create template and save template data to ipfs
        */
            const res = await ipfs.pin(template)
            console.log(res.IpfsHash)
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
                <FormField name="price" label="Asking Price" required>
                    <FormField
                        name="denominationToken"
                        label="Denomination token"
                        help={denominationTokenSymbol || 'Contract address'}
                        type="string"
                        onChange={(event) =>
                            updateDenominationTokenSymbol(event.target.value)
                        }
                        required
                    />
                    <FormField
                        name="askingAmount"
                        label="Amount (in the denomination token)"
                        help="eg. 1.0042"
                        type="number"
                        required
                    />
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
                            updatePreferredTokenSymbols(event.target.value)
                        }
                        required
                    />
                </FormField>
                <Header>Awaiting Inputs</Header>
                <Box gap="small">{renderAwaitedInputs()}</Box>
                <Box pad={{ top: 'medium' }}>
                    <Button primary type="submit" label="Create Template" />
                </Box>
            </Form>
        </>
    )
}

export default CreateTemplateForm
