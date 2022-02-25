import { Box, Button, Form, FormExtendedEvent, FormField } from 'grommet'
import { useEffect, useState } from 'react'

import BaseLayerModal from './BaseLayerModal'
import HeaderTextSection from '../sections/HeaderTextSection'
import { ParsedSlotModel } from '@cambrian/app/models/SlotModel'

interface ExecuteSolverModalProps {
    onBack: () => void
    manualSlots: ParsedSlotModel[]
    onAddData: (data: ManualInputsFormType) => void
}

export type ManualInputsFormType = {
    manualInputs: { input: string; slot: ParsedSlotModel }[]
}

const AddDataModal = ({
    onBack,
    manualSlots,
    onAddData,
}: ExecuteSolverModalProps) => {
    const [manualInputs, setManualInputs] = useState<ManualInputsFormType>()

    useEffect(() => {
        const manualInputs = manualSlots.map((slot) => {
            return { input: '', slot: slot }
        })
        setManualInputs({ manualInputs: manualInputs })
    }, [])

    const onSubmit = (
        event: FormExtendedEvent<ManualInputsFormType, Element>
    ) => {
        event.preventDefault()
        if (manualInputs !== undefined) {
            onAddData(manualInputs)
        }
    }

    // TODO Tags / Slot Input descripiton
    let ManualInputGroup = null
    if (manualInputs !== undefined) {
        ManualInputGroup = manualInputs.manualInputs.map((manualInput, idx) => (
            <FormField
                key={manualInput.slot.slot}
                required
                name={`manualInputs[${idx}].input`}
            />
        ))
    }

    return (
        <BaseLayerModal onBack={onBack}>
            <HeaderTextSection
                title="Prepare and execute solve"
                subTitle="Let's set up this solver"
                paragraph="Please input the following mandatory fields and click on Add Data. After you have added the data the Solver will be ready to execute."
            />
            <Box gap="medium" fill>
                {ManualInputGroup && (
                    <Form<ManualInputsFormType>
                        value={manualInputs}
                        onSubmit={(event) => onSubmit(event)}
                        onChange={(newFormState) =>
                            setManualInputs(newFormState)
                        }
                    >
                        {ManualInputGroup}
                        <Box>
                            <Button primary type="submit" label="Add data" />
                        </Box>
                    </Form>
                )}
            </Box>
        </BaseLayerModal>
    )
}

export default AddDataModal
