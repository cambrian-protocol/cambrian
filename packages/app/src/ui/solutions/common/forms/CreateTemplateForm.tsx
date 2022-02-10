import KeeperInputsModal from '@cambrian/app/components/modals/KeeperInputsModal'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { Tag, Tags, TemplateMetadata } from '@cambrian/app/models/TagModels'
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
    onSuccess: () => void
    onFailure: () => void
}

type CreateTemplateFormType = {
    pfp: string
    name: string
    title: string
    description: string
    awaitingInputs: {
        [solverId: string]: {
            [tagId: string]: TaggedInput
        }
    }
}

type TaggedInput = Tag & {
    value: string | number | undefined
}

const initialInput = {
    pfp: '',
    name: '',
    title: '',
    description: '',
    awaitingInputs: {},
}

const CreateTemplateForm = ({
    composition,
    onSuccess,
    onFailure,
}: CreateTemplateFormProps) => {
    const [input, setInput] = useState<CreateTemplateFormType>(initialInput)

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
        value: string | number | undefined
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
                    <Box direction="row">
                        <Box basis="3/4">
                            <FormField
                                name={tagId}
                                label={
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

    const onSubmit = (event: FormExtendedEvent) => {
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

                if (typeof taggedInput.value === 'string') {
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

                        default:
                            // SlotID
                            newComposition[i].config.slots[tagId].data = [
                                taggedInput.value,
                            ]
                    }
                } else if (typeof taggedInput.value === 'number') {
                    switch (tagId) {
                        case 'timelockSeconds':
                            newComposition[i].config['timelockSeconds'] =
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
            composition: newComposition,
            pfp: input.pfp,
            name: input.name,
            title: input.title,
            description: input.description,
        } as TemplateMetadata

        /* 
        Create template and save template data to ipfs

        */
        onSuccess()
        console.log('Created Template', template, input)
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
                <Box gap="small">{renderAwaitedInputs()}</Box>
                <Box pad={{ top: 'medium' }}>
                    <Button primary type="submit" label="Create Template" />
                </Box>
            </Form>
        </>
    )
}

export default CreateTemplateForm
