import { Box, Button, Form, FormExtendedEvent, FormField } from 'grommet'
import { SlotPath, SlotTypes } from '@cambrian/app/models/SlotModel'

import { IconContext } from 'phosphor-react'
import SelectCallingSolver from '@cambrian/app/components/selects/SelectCallingSolver'
import SelectSlot from '@cambrian/app/components/selects/SelectSlot'
import SelectSlotType from '@cambrian/app/components/selects/SelectSlotType'
import SelectSolverFunction from '@cambrian/app/components/selects/SelectSolverFunction'
import { SetStateAction } from 'react'
import { SlotActionPayload } from '@cambrian/app/store/composer/composer.types'
import SlotDataInputField from '@cambrian/app/components/inputs/SlotDataInput'
import { SlotDataInputType } from '../modals/CreateSlotModal'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import _uniqueId from 'lodash/uniqueId'
import { ethers } from 'ethers'

type SlotConfigFormProps = {
    onSubmit: (event: FormExtendedEvent<{}, Element>) => void
    slotInput: SlotConfigFormType
    setSlotInput: React.Dispatch<SetStateAction<SlotConfigFormType>>
    submitLabel: string
}
export type SlotConfigFormType = {
    slotType: SlotTypes
    dataInputFields: SlotDataInputType[]
    slotDescription: string
    solverFunction?: ethers.utils.FunctionFragment | null
    targetSolverId?: string | null
    callbackTargetSlotPath?: SlotPath
}

const SlotConfigForm = ({
    onSubmit,
    slotInput,
    setSlotInput,
    submitLabel,
}: SlotConfigFormProps) => {
    const handleUpdateDataInputField = (
        updatedDataInput: SlotDataInputType
    ) => {
        const indexToUpdate = slotInput.dataInputFields.findIndex(
            (field) => field.id === updatedDataInput.id
        )
        const updatedInputFields = [...slotInput.dataInputFields]
        updatedInputFields[indexToUpdate] = updatedDataInput
        setSlotInput((prev) => ({
            ...prev,
            dataInputFields: updatedInputFields,
        }))
    }

    const handleUpdateSolverFunction = (
        updatedSolverFunction?: ethers.utils.FunctionFragment
    ) => {
        setSlotInput((prev) => ({
            ...prev,
            solverFunction: updatedSolverFunction,
            dataInputFields:
                updatedSolverFunction?.inputs.map((input) => ({
                    id: _uniqueId(),
                    data: '',
                    dataType: input.type as SolidityDataTypes,
                })) || [],
        }))
    }

    const handleUpdateCallbackSlotPath = (updatedTargetSlotPath?: SlotPath) => {
        setSlotInput((prev) => ({
            ...prev,
            callbackTargetSlotPath: updatedTargetSlotPath,
        }))
    }
    let FormFields = null

    switch (slotInput.slotType) {
        case SlotTypes.Callback:
            FormFields = (
                <FormField
                    label="Target slot"
                    required
                    name="callbackTargetSlotPath"
                >
                    <SelectSlot
                        name="callbackTargetSlotPath"
                        updateCallbackSlotPath={handleUpdateCallbackSlotPath}
                        selectedCallbackTargetSlotPath={
                            slotInput.callbackTargetSlotPath
                        }
                    />
                </FormField>
            )
            break
        case SlotTypes.Constant:
        case SlotTypes.Manual:
            FormFields = (
                <>
                    <FormField
                        label="Slot description"
                        name="slotDescription"
                    />
                    <SlotDataInputField
                        value={slotInput.dataInputFields[0]}
                        onUpdate={handleUpdateDataInputField}
                    />
                </>
            )
            break
        case SlotTypes.Function:
            FormFields = (
                <>
                    <FormField label="Calling Solver" name="callingSolverIndex">
                        <SelectCallingSolver name="callingSolverIndex" />
                    </FormField>
                    <FormField
                        label="Solver Function"
                        required
                        name="solverFunction"
                    >
                        <SelectSolverFunction
                            selectedSolverFunction={slotInput.solverFunction}
                            updateSolverFunction={handleUpdateSolverFunction}
                        />
                    </FormField>
                    <Box gap="small">
                        <FormField label="Input">
                            {slotInput.dataInputFields?.map(
                                (dataInput, idx) => (
                                    <SlotDataInputField
                                        key={idx}
                                        required
                                        value={dataInput}
                                        onUpdate={handleUpdateDataInputField}
                                    />
                                )
                            )}
                        </FormField>
                    </Box>
                </>
            )
            break
    }

    return (
        <Box fill>
            <Form<SlotConfigFormType>
                value={slotInput}
                onSubmit={(event) => onSubmit(event)}
                onChange={(nextValue: SlotConfigFormType) => {
                    setSlotInput(nextValue)
                }}
            >
                <FormField label="Slot type" name="slotType">
                    <SelectSlotType name="slotType" />
                </FormField>
                {FormFields}
                <Box>
                    <IconContext.Provider value={{ size: '24' }}>
                        <Button primary type="submit" label={submitLabel} />
                    </IconContext.Provider>
                </Box>
            </Form>
        </Box>
    )
}

export default SlotConfigForm

export const mapSlotConfigFormToSlotActionPayload = (
    slotConfigFormInput: SlotConfigFormType
): SlotActionPayload => {
    const dataTypes: SolidityDataTypes[] = []
    slotConfigFormInput.dataInputFields?.forEach((field) => {
        dataTypes.push(field.dataType)
    })
    const data: any[] = []

    slotConfigFormInput.dataInputFields?.forEach((field) => {
        let dataToAdd: any = field.data
        // Parse to number if possible
        if (field.dataType === SolidityDataTypes.Uint256) {
            const parsedInt = parseInt(field.data)
            if (!isNaN(parsedInt)) {
                dataToAdd = parsedInt
            }
        }
        data.push(dataToAdd)
    })

    const slotPayload: SlotActionPayload = {
        slotType: slotConfigFormInput.slotType,
        dataTypes: dataTypes,
        data: data,
    }

    switch (slotConfigFormInput.slotType) {
        case SlotTypes.Callback:
            // Doesn't hurt to check
            if (slotConfigFormInput.callbackTargetSlotPath !== undefined) {
                slotPayload.targetSolverId =
                    slotConfigFormInput.callbackTargetSlotPath.solverId
                slotPayload.data = [
                    slotConfigFormInput.callbackTargetSlotPath.slotId,
                ]
            }
            break
        case SlotTypes.Function:
            slotPayload.targetSolverId = slotConfigFormInput.targetSolverId
            slotPayload.solverFunction = slotConfigFormInput.solverFunction
            break
        case SlotTypes.Manual:
        case SlotTypes.Constant:
            slotPayload.description = slotConfigFormInput.slotDescription
    }
    return slotPayload
}
