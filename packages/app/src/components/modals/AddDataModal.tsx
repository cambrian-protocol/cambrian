import { Box, Button, Form, FormField, Text } from 'grommet'
import { EventFilter, ethers } from 'ethers'
import { useEffect, useState } from 'react'

import BaseLayerModal from './BaseLayerModal'
import ErrorPopupModal from './ErrorPopupModal'
import { GenericMethods } from '../solver/Solver'
import HeaderTextSection from '../sections/HeaderTextSection'
import LoadingScreen from '../info/LoadingScreen'
import { RichSlotModel } from '@cambrian/app/models/SlotModel'
import { TRANSACITON_MESSAGE } from '@cambrian/app/constants/TransactionMessages'
import { UserType } from '@cambrian/app/store/UserContext'

interface ExecuteSolverModalProps {
    onBack: () => void
    manualSlots: RichSlotModel[]
    solverContract: ethers.Contract
    solverMethods: GenericMethods
    currentUser: UserType
    updateSolverData: () => Promise<void>
}

export type ManualInputsFormType = { manualInputs: ManualInputType[] }

export type ManualInputType = {
    data: any
    slotWithMetaData: RichSlotModel
}

const AddDataModal = ({
    onBack,
    manualSlots,
    solverContract,
    currentUser,
    solverMethods,
    updateSolverData,
}: ExecuteSolverModalProps) => {
    const [manualInputs, setManualInputs] = useState<ManualInputsFormType>()
    const [transactionMsg, setTransactionMsg] = useState<string>()
    const [errMsg, setErrMsg] = useState<string>()
    const ingestedDataFilter = {
        address: currentUser.address,
        topics: [ethers.utils.id('IngestedData()')],
        fromBlock: 'latest',
    } as EventFilter

    useEffect(() => {
        const manualInputs = manualSlots.map((slot) => {
            return { data: '', slotWithMetaData: slot }
        })

        setManualInputs({ manualInputs: manualInputs })
    }, [])

    useEffect(() => {
        solverContract.on(ingestedDataFilter, ingestListener)

        return () => {
            solverContract.removeListener(ingestedDataFilter, ingestListener)
        }
    }, [])

    const ingestListener = async () => {
        await updateSolverData()
        setTransactionMsg(undefined)
    }

    const onAddData = async (input: ManualInputType) => {
        setTransactionMsg(TRANSACITON_MESSAGE['CONFIRM'])
        try {
            // TODO Encode the right type (tags)
            const encodedData = ethers.utils.defaultAbiCoder.encode(
                ['address'],
                [input.data]
            )
            await solverMethods.addData(
                input.slotWithMetaData.slot.slot,
                encodedData
            )
            setTransactionMsg(TRANSACITON_MESSAGE['WAIT'])
        } catch (e: any) {
            setErrMsg(e.message)
            setTransactionMsg(undefined)
            console.error(e)
        }
    }

    let ManualInputGroup = null
    if (manualInputs !== undefined) {
        ManualInputGroup = manualInputs.manualInputs?.map((input, idx) => {
            return (
                <Box key={input.slotWithMetaData.slot.slot}>
                    <Box direction="row" gap="medium" align="center">
                        <Box flex>
                            <FormField
                                name={`manualInputs[${idx}].data`}
                                label={input.slotWithMetaData.tag.label}
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
                        {input.slotWithMetaData.tag.description}
                    </Text>
                </Box>
            )
        })
    }

    return (
        <>
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
            {errMsg && (
                <ErrorPopupModal
                    onClose={() => setErrMsg(undefined)}
                    errorMessage={errMsg}
                />
            )}
            {transactionMsg && <LoadingScreen context={transactionMsg} />}
        </>
    )
}

export default AddDataModal
