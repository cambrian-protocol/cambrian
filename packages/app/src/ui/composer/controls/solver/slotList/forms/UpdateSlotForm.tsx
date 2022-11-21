import { Box, Button, Form, FormExtendedEvent, FormField } from 'grommet'
import {
    ComposerSlotModel,
    ComposerSlotPathType,
} from '@cambrian/app/models/SlotModel'
import {
    CreateSlotFormType,
    initialCreateSlotInput,
    mapSlotFormTypeToSlotActionPayload,
} from './CreateSlotForm'
import SlotDataInputField, {
    SlotDataInputType,
} from '@cambrian/app/components/inputs/SlotDataInput'
import { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseFormGroupContainer from '@cambrian/app/components/containers/BaseFormGroupContainer'
import ReferencedSlotInfo from '@cambrian/app/components/info/ReferencedSlotInfo'
import SelectCallingSolver from '@cambrian/app/components/selects/SelectCallingSolver'
import SelectSlot from '@cambrian/app/components/selects/SelectSlot'
import SelectSlotType from '@cambrian/app/components/selects/SelectSlotType'
import SelectSolverFunction from '@cambrian/app/components/selects/SelectSolverFunction'
import SlotTagFormFields from '../../general/forms/SlotTagFormFields'
import { SlotType } from '@cambrian/app/models/SlotType'
import _uniqueId from 'lodash/uniqueId'
import { useComposerContext } from '@cambrian/app/store/composer/composer.context'

type UpdateSlotFormProps = {
    slot: ComposerSlotModel
    onClose: () => void
}

const UpdateSlotForm = ({ onClose, slot }: UpdateSlotFormProps) => {
    const { dispatch, currentSolver } = useComposerContext()

    if (!currentSolver) throw Error('No current Solver defined!')

    const [input, setInput] = useState<CreateSlotFormType>(
        initialCreateSlotInput
    )

    // Init
    useEffect(() => {
        const dataInputFields = slot.data.map((dataEntry, idx) => {
            return {
                id: _uniqueId(),
                data: dataEntry,
                dataType: slot.dataTypes[idx],
            }
        })

        const slotTag = currentSolver.slotTags[slot.id]

        setInput({
            slotType: slot.slotType,
            dataInputFields: dataInputFields,
            solverFunction: slot.solverFunction,
            targetSolverId: slot.targetSolverId,
            reference: slot.reference,
            label: (slotTag && slotTag.label) || '',
            description: (slotTag && slotTag.description) || '',
            instruction: (slotTag && slotTag.instruction) || '',
            isFlex: (slotTag && slotTag.isFlex) || false,
            slotId: slotTag.slotId,
            solverId: slotTag.solverId,
        })
    }, [])

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
            type: 'UPDATE_SLOT',
            payload: {
                slotIdToUpdate: slot.id,
                updatedSlot: mapSlotFormTypeToSlotActionPayload(input),
            },
        })
        onClose()
    }

    let FormFields = null

    switch (input.slotType) {
        case SlotType.Callback:
            FormFields = (
                <FormField label="Target slot" required name="reference">
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
                    disabledType
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
                            disabled
                            selectedSolverFunction={input.solverFunction}
                            updateSolverFunction={() => {}}
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
                    {input.reference ? (
                        <ReferencedSlotInfo reference={input.reference} />
                    ) : (
                        <>
                            <FormField label="Slot type" name="slotType">
                                <SelectSlotType disabled name="slotType" />
                            </FormField>
                            {FormFields}
                        </>
                    )}
                </BaseFormGroupContainer>
                <Button primary type="submit" label={'Save slot'} />
            </BaseFormContainer>
        </Form>
    )
}

export default UpdateSlotForm
