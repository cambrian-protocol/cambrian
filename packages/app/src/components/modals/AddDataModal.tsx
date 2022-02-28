import { Box, Button, Form, FormField } from 'grommet'
import { useEffect, useState } from 'react'

import BaseLayerModal from './BaseLayerModal'
import HeaderTextSection from '../sections/HeaderTextSection'
import { ParsedSlotModel } from '@cambrian/app/models/SlotModel'

interface ExecuteSolverModalProps {
    onBack: () => void
    manualSlots: ParsedSlotModel[]
    onAddData: (data: ManualInputType) => void
}

export type ManualInputsFormType = { manualInputs: ManualInputType[] }

export type ManualInputType = { data: any; slot: ParsedSlotModel }

const AddDataModal = ({
    onBack,
    manualSlots,
    onAddData,
}: ExecuteSolverModalProps) => {
    const [manualInputs, setManualInputs] = useState<ManualInputsFormType>()

    useEffect(() => {
        const manualInputs = manualSlots.map((slot) => {
            return { data: '', slot: slot }
        })

        setManualInputs({ manualInputs: manualInputs })
    }, [])

    // TODO Tags / Slot Input descripiton
    let ManualInputGroup = null
    if (manualInputs !== undefined) {
        ManualInputGroup = manualInputs.manualInputs.map((input, idx) => (
            <Box
                direction="row"
                gap="medium"
                key={input.slot.slot}
                align="center"
            >
                <Box flex>
                    <FormField
                        name={`manualInputs[${idx}].data`}
                        label="Selected Writer"
                        required
                    />
                </Box>
                <Box>
                    <Button
                        primary
                        type="submit"
                        label="Add Data"
                        onClick={() =>
                            onAddData(manualInputs.manualInputs[idx])
                        }
                    />
                </Box>
            </Box>
        ))
    }

    return (
        <BaseLayerModal onBack={onBack}>
            <HeaderTextSection
                title="Data Required"
                subTitle="Add solve data"
                paragraph='This Solver requires the following data. Fields marked "*" must be added before execution.'
            />
            <Box gap="medium" fill>
                {ManualInputGroup && (
                    <Form<ManualInputsFormType>
                        onSubmit={(e) => e.preventDefault()}
                        value={manualInputs}
                        onChange={(newFormState) =>
                            setManualInputs(newFormState)
                        }
                    >
                        {ManualInputGroup}
                    </Form>
                )}
            </Box>
        </BaseLayerModal>
    )
}

export default AddDataModal
