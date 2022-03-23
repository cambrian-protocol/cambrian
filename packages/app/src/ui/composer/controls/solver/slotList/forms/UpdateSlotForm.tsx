import { Box, Button, Form, FormExtendedEvent, FormField } from 'grommet'
import { SetStateAction, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import { ComposerSlotPathType } from '@cambrian/app/models/SlotModel'
import SelectCallingSolver from '@cambrian/app/components/selects/SelectCallingSolver'
import SelectSlot from '@cambrian/app/components/selects/SelectSlot'
import SelectSlotType from '@cambrian/app/components/selects/SelectSlotType'
import SelectSolverFunction from '@cambrian/app/components/selects/SelectSolverFunction'
import SlotDataInputField from '@cambrian/app/components/inputs/SlotDataInput'
import { SlotDataInputType } from '../modals/CreateSlotModal'
import { SlotFormType } from './CreateSlotForm'
import { SlotTagFormInputType } from '../../general/forms/SlotTagForm'
import SlotTagModal from '../../general/modals/SlotTagModal'
import { SlotType } from '@cambrian/app/models/SlotType'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { Tag } from 'phosphor-react'
import _uniqueId from 'lodash/uniqueId'
import { ethers } from 'ethers'

type SlotConfigFormProps = {
    onSubmit: (event: FormExtendedEvent<{}, Element>) => void
    slotInput: SlotFormType
    setSlotInput: React.Dispatch<SetStateAction<SlotFormType>>
    slotTagInput: SlotTagFormInputType
    setSlotTagInput: React.Dispatch<SetStateAction<SlotTagFormInputType>>
}

const UpdateSlotForm = ({
    onSubmit,
    slotInput,
    setSlotInput,
    slotTagInput,
    setSlotTagInput,
}: SlotConfigFormProps) => {
    const [showSlotTagModal, setShowSlotTagModal] = useState(false)

    const toggleShowSlotTagModal = () => setShowSlotTagModal(!showSlotTagModal)

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

    const handleUpdateReference = (updatedReference?: ComposerSlotPathType) => {
        setSlotInput((prev) => ({
            ...prev,
            reference: updatedReference,
        }))
    }
    let FormFields = null

    switch (slotInput.slotType) {
        case SlotType.Callback:
            FormFields = (
                <FormField label="Target slot" required name="reference">
                    <SelectSlot
                        name="reference"
                        updateReference={handleUpdateReference}
                        selectedReference={slotInput.reference}
                    />
                </FormField>
            )
            break
        case SlotType.Constant:
        case SlotType.Manual:
            FormFields = (
                <SlotDataInputField
                    disabledType
                    value={slotInput.dataInputFields[0]}
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
        <>
            <BaseFormContainer gap="medium">
                <BaseMenuListItem
                    subTitle="Define a label, a description and more..."
                    title="Tag"
                    icon={<Tag />}
                    onClick={toggleShowSlotTagModal}
                />
                <Form<SlotFormType>
                    value={slotInput}
                    onSubmit={(event) => onSubmit(event)}
                    onChange={(nextValue: SlotFormType) => {
                        setSlotInput(nextValue)
                    }}
                >
                    <FormField label="Slot type" name="slotType">
                        <SelectSlotType disabled name="slotType" />
                    </FormField>
                    {FormFields}
                    <Box margin={{ top: 'medium' }}>
                        <Button primary type="submit" label={'Save slot'} />
                    </Box>
                </Form>
            </BaseFormContainer>
            {showSlotTagModal && (
                <SlotTagModal
                    onBack={toggleShowSlotTagModal}
                    slotTagInput={slotTagInput}
                    onSubmit={(slotTag: SlotTagFormInputType) => {
                        setSlotTagInput(slotTag)
                    }}
                />
            )}
        </>
    )
}

export default UpdateSlotForm
