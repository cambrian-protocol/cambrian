import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { SetStateAction, useState } from 'react'

import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import ErrorPopupModal from './ErrorPopupModal'
import { GenericMethods } from '../solver/Solver'
import HeaderTextSection from '../sections/HeaderTextSection'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'

interface ArbitrateModalProps {
    arbitratorContract?: ethers.Contract
    solverMethods: GenericMethods
    solverData: SolverModel
    currentCondition: SolverContractCondition
    onBack: () => void
    isArbitrating?: number
    setIsArbitrating: React.Dispatch<SetStateAction<number | undefined>>
    solverAddress: string
}

const ArbitrateModal = ({
    arbitratorContract,
    solverMethods,
    solverData,
    currentCondition,
    onBack,
    isArbitrating,
    setIsArbitrating,
    solverAddress,
}: ArbitrateModalProps) => {
    const [errMsg, setErrMsg] = useState<ErrorMessageType>()
    const disputeId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ['address', 'uint256'],
            [solverAddress, currentCondition.executions - 1]
        )
    )

    const onArbitrate = async (indexSet: number) => {
        setIsArbitrating(indexSet)
        try {
            const binaryArray = binaryArrayFromIndexSet(
                indexSet,
                solverData.config.conditionBase.outcomeSlots
            )

            if (arbitratorContract !== undefined) {
                const tx: ethers.ContractTransaction = await arbitratorContract[
                    'arbitrate(bytes32,uint256)'
                ](disputeId, binaryArray)
                await tx.wait()
            } else {
                const tx: ethers.ContractTransaction =
                    await solverMethods.arbitrate(
                        currentCondition.executions - 1,
                        binaryArray
                    )
                const rc = await tx.wait()
                if (
                    !rc.events?.find((event) => event.event === 'ChangedStatus')
                )
                    throw GENERAL_ERROR['ARBITRATION_ERROR']
            }
        } catch (e) {
            setErrMsg(await cpLogger.push(e))
        }
        setIsArbitrating(undefined)
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
                                proposedIndexSet={isArbitrating}
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
        </>
    )
}

export default ArbitrateModal
