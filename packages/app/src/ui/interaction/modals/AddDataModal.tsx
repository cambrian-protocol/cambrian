import { Box, Form } from 'grommet'
import React, { SetStateAction, useEffect, useState } from 'react'

import AddManualSlotDataInput from '../../../components/inputs/AddManualSlotDataInput'
import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../../../components/modals/ErrorPopupModal'
import { GenericMethods } from '../../../components/solver/Solver'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
import { ShieldCheck } from 'phosphor-react'
import { ethers } from 'ethers'
import { invokeContractFunction } from '@cambrian/app/utils/helpers/invokeContractFunctiion'
import { isAddress } from '@cambrian/app/utils/helpers/validation'

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
    const [manualInputs, setManualInputs] = useState<ManualInputFormType[]>()
    const [errMsg, setErrMsg] = useState<ErrorMessageType>()

    useEffect(() => {
        const manualInputs = manualSlots.map((slot) => {
            return { data: '', slotWithMetaData: slot }
        })

        setManualInputs(manualInputs)
    }, [])

    const onAddData = async (idx: number) => {
        if (manualInputs) {
            const encodedData = ethers.utils.defaultAbiCoder.encode(
                ['address'],
                [manualInputs[idx].data]
            )
            await invokeContractFunction(
                'IngestedData',
                () =>
                    solverMethods.addData(
                        manualInputs[idx].slotWithMetaData.slot.slot,
                        encodedData
                    ),
                setIsAddingData,
                setErrMsg,
                'ADD_DATA_ERROR'
            )
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
        <>
            <BaseLayerModal onBack={onBack}>
                <ModalHeader
                    icon={<ShieldCheck />}
                    title="Add solve data"
                    description='This Solver requires the following data. Fields marked "*" must be added before execution.'
                />
                <Box gap="medium" fill>
                    {ManualInputGroup}
                </Box>
            </BaseLayerModal>
            {errMsg && (
                <ErrorPopupModal
                    onClose={() => setErrMsg(undefined)}
                    errorMessage={errMsg}
                />
            )}
        </>
    )
}

export default AddDataModal
