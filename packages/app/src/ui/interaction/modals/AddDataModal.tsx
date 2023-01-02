import { Box, Form } from 'grommet'
import React, { SetStateAction, useEffect, useState } from 'react'

import AddManualSlotDataInput from '../../../components/inputs/AddManualSlotDataInput'
import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { GenericMethods } from '../../../components/solver/Solver'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
import { ethers } from 'ethers'
import { isAddress } from '@cambrian/app/utils/helpers/validation'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'

interface ExecuteSolverModalProps {
    isAddingData: boolean
    setIsAddingData: React.Dispatch<SetStateAction<boolean>>
    onBack: () => void
    manualSlots: RichSlotModel[]
    solverMethods: GenericMethods
}

export type ManualInputFormType = {
    data: any
    slotWithMetaData: RichSlotModel
}

// TODO Test adding multiple Manual Slots handling, integrate different manualInput type validation
const AddDataModal = ({
    isAddingData,
    setIsAddingData,
    onBack,
    manualSlots,
    solverMethods,
}: ExecuteSolverModalProps) => {
    const { showAndLogError } = useErrorContext()
    const [manualInputs, setManualInputs] = useState<ManualInputFormType[]>()

    useEffect(() => {
        const manualInputs = manualSlots.map((slot) => {
            return { data: '', slotWithMetaData: slot }
        })

        setManualInputs(manualInputs)
    }, [])

    const onAddData = async (idx: number) => {
        if (manualInputs) {
            setIsAddingData(true)
            const encodedData = ethers.utils.defaultAbiCoder.encode(
                ['address'],
                [manualInputs[idx].data]
            )
            try {
                const transaction: ethers.ContractTransaction =
                    await solverMethods.addData(
                        manualInputs[idx].slotWithMetaData.slot.slot,
                        encodedData
                    )
                const rc = await transaction.wait()
                if (!rc.events?.find((event) => event.event === 'IngestedData'))
                    throw GENERAL_ERROR['ADD_DATA_ERROR']
            } catch (e) {
                showAndLogError(e)
                setIsAddingData(false)
            }
        }
    }

    let ManualInputGroup = null
    if (manualInputs !== undefined) {
        ManualInputGroup = manualInputs?.map((input, idx) => {
            return (
                <Form<ManualInputFormType>
                    key={input.slotWithMetaData.slot.slot}
                    onSubmit={(e) => {
                        e.preventDefault()
                        onAddData(idx)
                    }}
                >
                    <AddManualSlotDataInput
                        isAddingData={isAddingData}
                        label={input.slotWithMetaData.tag.label}
                        value={manualInputs[idx].data}
                        onChange={(e) => {
                            const updatedManualInputs = [...manualInputs]
                            updatedManualInputs[idx].data = e.target.value
                            setManualInputs(updatedManualInputs)
                        }}
                        validate={[
                            () => {
                                if (!isAddress(manualInputs[idx].data))
                                    return 'Invalid address'
                            },
                        ]}
                        description={input.slotWithMetaData.tag.description}
                    />
                </Form>
            )
        })
    }

    return (
        <BaseLayerModal onBack={onBack}>
            <ModalHeader
                title="Add solve data"
                description='This Solver requires the following data. Fields marked "*" must be added before execution.'
            />
            <Box gap="medium" fill>
                {ManualInputGroup}
            </Box>
        </BaseLayerModal>
    )
}

export default AddDataModal
