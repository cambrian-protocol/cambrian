import { Box, Button, Form, FormExtendedEvent, FormField } from 'grommet'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import { ComposerSlotPathType } from '@cambrian/app/models/SlotModel'
import { CreateSlotActionPayload } from '@cambrian/app/store/composer/actions/solverActions/createSlot.action'
import SelectCallingSolver from '@cambrian/app/components/selects/SelectCallingSolver'
import SelectSlot from '@cambrian/app/components/selects/SelectSlot'
import SelectSlotType from '@cambrian/app/components/selects/SelectSlotType'
import SelectSolverFunction from '@cambrian/app/components/selects/SelectSolverFunction'
import SlotDataInputField from '@cambrian/app/components/inputs/SlotDataInput'
import SlotTagFormFields from '../../general/forms/SlotTagFormFields'
import { SlotTagModel } from '@cambrian/app/models/SlotTagModel'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import _uniqueId from 'lodash/uniqueId'
import { defaultSlotTagValues } from '@cambrian/app/classes/Tags/SlotTag'
import { ethers } from 'ethers'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'
import { useState } from 'react'

type SlotConfigFormProps = {
    onClose: () => void
}

export type CreateSlotFormType = SlotTagModel & {
    slotType: SlotType
    dataInputFields: SlotDataInputType[]
    solverFunction?: ethers.utils.FunctionFragment
    targetSolverId?: string
    reference?: ComposerSlotPathType
}

type SlotDataInputType = {
    id: string
    data: any
    dataType: SolidityDataTypes
}

export const initialCreateSlotInput: CreateSlotFormType = {
    ...defaultSlotTagValues,
    slotType: SlotType.Constant,
    dataInputFields: [
        { id: _uniqueId(), data: '', dataType: SolidityDataTypes.Bytes },
    ],
}

const CreateSlotForm = ({ onClose }: SlotConfigFormProps) => {
    const { dispatch } = useComposerContext()

    const [input, setInput] = useState<CreateSlotFormType>(
        initialCreateSlotInput
    )

    const handleUpdateDataInputField = (
        updatedDataInput: SlotDataInputType
    ) => {
        const indexToUpdate = input.dataInputFields.findIndex(
            (field) => field.id === updatedDataInput.id
        )
        const updatedInputFields = [...input.dataInputFields]
        updatedInputFields[indexToUpdate] = updatedDataInput
        setInput((prev) => ({
            ...prev,
            dataInputFields: updatedInputFields,
        }))
    }

    const handleUpdateSolverFunction = (
        updatedSolverFunction?: ethers.utils.FunctionFragment
    ) => {
        setInput((prev) => ({
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

    const handleUpdateReference = (updatedReference?: ComposerSlotPathType) => {
        setInput((prev) => ({
            ...prev,
            reference: updatedReference,
        }))
    }

    const onSubmit = (
        event: FormExtendedEvent<CreateSlotFormType, Element>
    ) => {
        event.preventDefault()
        dispatch({
            type: 'CREATE_SLOT',
            payload: mapSlotFormTypeToSlotActionPayload(input),
        })
        onClose()
    }

    let FormFields = null

    switch (input.slotType) {
        case SlotType.Callback:
            FormFields = (
                <FormField label="Invoking slot" required name="reference">
                    <SelectSlot
                        name="reference"
                        updateReference={handleUpdateReference}
                        selectedReference={input.reference}
                    />
                </FormField>
            )
            break
        case SlotType.Constant:
        case SlotType.Manual:
            FormFields = (
                <SlotDataInputField
                    value={input.dataInputFields[0]}
                    onUpdate={handleUpdateDataInputField}
                />
            )
            break
        case SlotType.Function:
            FormFields = (
                <>
                    <FormField label="Calling Solver" name="targetSolverId">
                        <SelectCallingSolver name="targetSolverId" />
                    </FormField>
                    <FormField
                        label="Solver Function"
                        required
                        name="solverFunction"
                    >
                        <SelectSolverFunction
                            selectedSolverFunction={input.solverFunction}
                            updateSolverFunction={handleUpdateSolverFunction}
                        />
                    </FormField>
                    <Box gap="small">
                        <FormField label="Input">
                            {input.dataInputFields?.map((dataInput, idx) => (
                                <SlotDataInputField
                                    key={idx}
                                    required
                                    value={dataInput}
                                    onUpdate={handleUpdateDataInputField}
                                />
                            ))}
                        </FormField>
                    </Box>
                </>
            )
            break
    }

    return (
        <>
            <Form<CreateSlotFormType>
                value={input}
                onSubmit={(event) => onSubmit(event)}
                onChange={(nextValue: CreateSlotFormType) => {
                    setInput(nextValue)
                }}
            >
                <BaseFormContainer>
                    <SlotTagFormFields />
                    <BaseFormGroupContainer>
                        <FormField label="Slot type" name="slotType">
                            <SelectSlotType name="slotType" />
                        </FormField>
                        {FormFields}
                    </BaseFormGroupContainer>
                    <Button primary type="submit" label="Create slot" />
                </BaseFormContainer>
            </Form>
        </>
    )
}

export default CreateSlotForm

export const mapSlotFormTypeToSlotActionPayload = (
    slotConfigFormInput: CreateSlotFormType
): CreateSlotActionPayload => {
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

    const slotPayload: CreateSlotActionPayload = {
        label: slotConfigFormInput.label,
        description: slotConfigFormInput.description,
        instruction: slotConfigFormInput.instruction,
        isFlex: slotConfigFormInput.isFlex,
        slotType: slotConfigFormInput.slotType,
        dataTypes: dataTypes,
        data: data,
        reference: slotConfigFormInput.reference,
        solverId: slotConfigFormInput.solverId,
        slotId: slotConfigFormInput.slotId,
    }

    switch (slotConfigFormInput.slotType) {
        case SlotType.Callback:
            // Doesn't hurt to check
            if (slotConfigFormInput.reference !== undefined) {
                slotPayload.targetSolverId =
                    slotConfigFormInput.reference.solverId
            }
            break
        case SlotType.Function:
            slotPayload.targetSolverId = slotConfigFormInput.targetSolverId
            slotPayload.solverFunction = slotConfigFormInput.solverFunction
            break
    }
    return slotPayload
}
