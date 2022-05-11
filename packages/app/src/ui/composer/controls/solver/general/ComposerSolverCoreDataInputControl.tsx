import { Box, Button, Form, FormExtendedEvent, FormField } from 'grommet'
import React, { useEffect, useState } from 'react'

import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import SolverRegisteryAPI from '@cambrian/app/services/api/SolverRegistry.api'
import _ from 'lodash'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

export type SolverCoreDataInputType = {
    type: SolidityDataTypes
    data: string
}

export type RegisteredCoreDataInput = {
    type: SolidityDataTypes
    default: string
    label: string
}

type DataInputForm = {
    inputs: SolverCoreDataInputType[]
}

const initialSolverCoreDataInputs: SolverCoreDataInputType[] = []

const ComposerSolverCoreDataInputControl = () => {
    const { dispatch, currentSolver } = useComposerContext()

    const [dataLabel, setDataLabel] = useState<string>()

    const [registeredInputs, setRegisteredInputs] =
        useState<RegisteredCoreDataInput[]>()

    const [initialInputs, setInitialInputs] = useState<
        SolverCoreDataInputType[]
    >(initialSolverCoreDataInputs)
    const [value, setValue] = useState<DataInputForm>({
        inputs: initialSolverCoreDataInputs,
    })

    useEffect(() => {
        getRegisteredCoreDataInputs()
        getRegisteredDataLabel()
    }, [])

    const getRegisteredDataLabel = async () => {
        if (
            currentSolver !== undefined &&
            currentSolver.config.implementation
        ) {
            try {
                const dataLabel =
                    await SolverRegisteryAPI.dataLabelFromImplementation(
                        currentSolver.config.implementation
                    )
                setDataLabel(dataLabel)
            } catch (e) {
                cpLogger.push(e)
            }
        }
    }

    const getRegisteredCoreDataInputs = async () => {
        if (
            currentSolver !== undefined &&
            currentSolver.config.implementation
        ) {
            try {
                const registeredInputs =
                    await SolverRegisteryAPI.dataInputsFromImplementation(
                        currentSolver.config.implementation
                    )

                if (registeredInputs) {
                    setRegisteredInputs(
                        registeredInputs as RegisteredCoreDataInput[]
                    )

                    let inputData: SolverCoreDataInputType[] =
                        registeredInputs.map((input) => {
                            return {
                                type: input.type,
                                data: input.default,
                            }
                        })

                    if (
                        currentSolver.config.data &&
                        currentSolver.config.data.length
                    ) {
                        inputData = currentSolver.config.data
                    }

                    setInitialInputs(inputData)

                    // Reassignment so that _.isEqual can return false for Save Button check
                    setValue({ inputs: JSON.parse(JSON.stringify(inputData)) })
                }
            } catch (e) {
                console.error(
                    'Error getting registered core data input for Solver'
                )
                cpLogger.push(e)
            }
        }
    }

    const onSubmit = (event: FormExtendedEvent<DataInputForm>) => {
        event.preventDefault()

        dispatch({
            type: 'UPDATE_SOLVER_DATA',
            payload: event.value.inputs,
        })

        setInitialInputs(event.value.inputs)
    }

    if (!currentSolver) throw Error('No current Solver defined!')

    // TODO Implementation Contract Select
    return (
        <>
            <Box gap="small" overflow={{ vertical: 'auto' }}>
                <HeaderTextSection
                    title="Core Data Inputs"
                    subTitle={'Solver'}
                    paragraph="This data enables functions unique to this Solver. Incorrect values here will likely cause problems. Only modify these inputs as they instruct."
                />
                <HeaderTextSection
                    subTitle="Data Inputs"
                    paragraph={dataLabel || 'No labels found for this Solver'}
                />
                <Form<DataInputForm>
                    value={value}
                    onSubmit={(event) => onSubmit(event)}
                    onChange={(nextValue: DataInputForm) => {
                        setValue(nextValue)
                    }}
                >
                    {value.inputs.length &&
                        value.inputs.map((item, index) => (
                            <FormField
                                key={index}
                                name={`inputs[${index}].data`}
                                label={
                                    registeredInputs && registeredInputs[index]
                                        ? registeredInputs[index].label
                                        : ''
                                }
                                value={item.data}
                            />
                        ))}
                    <Box flex>
                        <Button
                            disabled={_.isEqual(initialInputs, value.inputs)}
                            primary
                            type="submit"
                            label={'Save'}
                        />
                    </Box>
                </Form>
            </Box>
        </>
    )
}

export default ComposerSolverCoreDataInputControl
