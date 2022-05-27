import { Box, Button, Form, FormExtendedEvent, FormField } from 'grommet'
import React, { useEffect, useState } from 'react'

import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import ModuleRegistryAPI, {
    RegisteredModule,
} from '@cambrian/app/services/api/ModuleRegistry'
import _ from 'lodash'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import Solver from '@cambrian/app/components/solver/Solver'
import { ComposerModuleLoaderModel } from '@cambrian/app/models/ModuleLoaderModel'

export type SolverModuleInputType = {
    type: SolidityDataTypes
    data: string
}

export type ModuleSettings = {
    [key: string]: ComposerModuleLoaderModel
}

type DataInputForm = {
    inputs: ModuleSettings
}

const initialSolverModuleSettings = {}

const ComposerSolverModuleInputControl = () => {
    const { dispatch, currentSolver } = useComposerContext()

    const [initialInputs, setInitialInputs] = useState<ModuleSettings>(
        initialSolverModuleSettings
    )
    const [value, setValue] = useState<DataInputForm>({
        inputs: initialSolverModuleSettings,
    })

    useEffect(() => {
        getInitialInputs()
    }, [])

    const getInitialInputs = () => {
        try {
            const inputData: ModuleSettings = {}

            if (
                currentSolver !== undefined &&
                currentSolver.config.modules.length > 0
            ) {
                currentSolver.config.modules.forEach((moduleLoader) => {
                    inputData[moduleLoader.module.key] = moduleLoader
                })
            }

            setValue({ inputs: JSON.parse(JSON.stringify(inputData)) })
            setInitialInputs(inputData)
        } catch (e) {
            console.error('Error getting registered core data input for Solver')
            cpLogger.push(e)
        }
    }

    const onSubmit = (event: FormExtendedEvent<DataInputForm>) => {
        event.preventDefault()

        dispatch({
            type: 'UPDATE_MODULE_DATA',
            payload: event.value.inputs,
        })

        setInitialInputs(event.value.inputs)
    }

    // TEMP
    const addModule = () => {
        const newModule = ModuleRegistryAPI.module('ipfsTextSubmitter')
        const newModuleInput = {
            module: newModule,
            data:
                newModule.dataInputs?.map((dataInput) => {
                    return {
                        module: newModule.key,
                        type: dataInput.type,
                        data: dataInput.default,
                    }
                }) || [],
        }

        setValue({
            inputs: { ...value.inputs, [newModule.key]: newModuleInput },
        })
    }

    const renderModules = () => {
        return Object.keys(value.inputs).map((moduleKey) => {
            const registeredModule = ModuleRegistryAPI.module(moduleKey)
            if (registeredModule) {
                return (
                    <Box gap="small" overflow={{ vertical: 'auto' }}>
                        <HeaderTextSection
                            title={registeredModule.name}
                            paragraph={registeredModule.description}
                        />
                        <HeaderTextSection
                            subTitle={`${registeredModule.name} Settings`}
                        />
                        {registeredModule.dataInputs &&
                            registeredModule.dataInputs.length > 0 &&
                            value.inputs[moduleKey].data.map((item, index) => (
                                <FormField
                                    key={index}
                                    name={`inputs[${moduleKey}][${index}].data`}
                                    label={
                                        registeredModule.dataInputs![index]
                                            .label
                                    }
                                    value={item.data}
                                />
                            ))}

                        <Box flex>
                            <Button
                                disabled={_.isEqual(
                                    initialInputs,
                                    value.inputs
                                )}
                                primary
                                type="submit"
                                label={'Save'}
                            />
                        </Box>
                    </Box>
                )
            }
        })
    }

    if (!currentSolver) throw Error('No current Solver defined!')

    // TODO Implementation Contract Select
    return (
        <>
            <Box gap="small" overflow={{ vertical: 'auto' }}>
                <HeaderTextSection title="Modules" />

                <Form<DataInputForm>
                    value={value}
                    onSubmit={(event) => onSubmit(event)}
                    onChange={(nextValue: DataInputForm) => {
                        setValue(nextValue)
                    }}
                >
                    {renderModules()}
                </Form>
                <Button onClick={() => addModule()}>Add Module</Button>
            </Box>
        </>
    )
}

export default ComposerSolverModuleInputControl
