import { Box, Button, Form, FormField, Text } from 'grommet'
import { useEffect, useState } from 'react'

import BaseLayerModal from './BaseLayerModal'
import HeaderTextSection from '../sections/HeaderTextSection'
import { SlotWithMetaDataModel } from '@cambrian/app/models/SolverModel'

interface ExecuteSolverModalProps {
    onBack: () => void
    manualSlots: SlotWithMetaDataModel[]
    onAddData: (data: ManualInputType) => void
}

export type ManualInputsFormType = { manualInputs: ManualInputType[] }

export type ManualInputType = {
    data: any
    slotWithMetaData: SlotWithMetaDataModel
}

const AddDataModal = ({
    onBack,
    manualSlots,
    onAddData,
}: ExecuteSolverModalProps) => {
    const [manualInputs, setManualInputs] = useState<ManualInputsFormType>()

    useEffect(() => {
        const manualInputs = manualSlots.map((slot) => {
            return { data: '', slotWithMetaData: slot }
        })

        setManualInputs({ manualInputs: manualInputs })
    }, [])

    let ManualInputGroup = null
    if (manualInputs !== undefined) {
        ManualInputGroup = manualInputs.manualInputs?.map((input, idx) => {
            return (
                <Box key={input.slotWithMetaData.slot.slot}>
                    <Box direction="row" gap="medium" align="center">
                        <Box flex>
                            <FormField
                                name={`manualInputs[${idx}].data`}
                                label={input.slotWithMetaData.description}
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
                    <Text size="small" color="dark-6">
                        {input.slotWithMetaData.tag.text}
                    </Text>
                </Box>
            )
        })
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
