import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'

import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import ErrorPopupModal from './ErrorPopupModal'
import { GenericMethods } from '../solver/Solver'
import HeaderTextSection from '../sections/HeaderTextSection'
import LoadingScreen from '../info/LoadingScreen'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { TRANSACITON_MESSAGE } from '@cambrian/app/constants/TransactionMessages'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import { useState } from 'react'

interface ArbitrateModalProps {
    solverMethods: GenericMethods
    solverData: SolverModel
    currentCondition: SolverContractCondition
    onBack: () => void
}

const ArbitrateModal = ({
    solverMethods,
    solverData,
    currentCondition,
    onBack,
}: ArbitrateModalProps) => {
    const [transactionMsg, setTransactionMsg] = useState<string>()
    const [errMsg, setErrMsg] = useState<ErrorMessageType>()

    const onArbitrate = async (indexSet: number) => {
        setTransactionMsg(TRANSACITON_MESSAGE['CONFIRM'])
        try {
            const binaryArray = binaryArrayFromIndexSet(
                indexSet,
                solverData.config.conditionBase.outcomeSlots
            )
            const transaction: ethers.ContractTransaction =
                await solverMethods.arbitrate(
                    currentCondition.executions - 1,
                    binaryArray
                )
            setTransactionMsg(TRANSACITON_MESSAGE['WAIT'])
            const rc = await transaction.wait()

            if (!rc.events?.find((event) => event.event === 'ChangedStatus'))
                throw GENERAL_ERROR['ARBITRATION_ERROR']
        } catch (e) {
            setErrMsg(await cpLogger.push(e))
        }
        setTransactionMsg(undefined)
    }

    return (
        <>
            <BaseLayerModal onBack={onBack}>
                <HeaderTextSection
                    subTitle="Arbitration"
                    title={'Report arbitration Outcome'}
                />
                <Box gap="medium" height={{ min: 'auto' }} fill="horizontal">
                    {solverData.outcomeCollections[
                        currentCondition.conditionId
                    ].map((outcomeCollection, idx) => {
                        return (
                            <OutcomeCollectionCard
                                idx={idx + 1}
                                token={solverData.collateralToken}
                                key={outcomeCollection.indexSet}
                                outcomeCollection={outcomeCollection}
                                onArbitrate={onArbitrate}
                            />
                        )
                    })}
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

export default ArbitrateModal
