import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { SetStateAction, useState } from 'react'

import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import { Box } from 'grommet'
import ErrorPopupModal from '../../../components/modals/ErrorPopupModal'
import { GenericMethods } from '../../../components/solver/Solver'
import OutcomeCollectionCard from '../../../components/cards/OutcomeCollectionCard'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import { Scales } from 'phosphor-react'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'

interface ArbitrateModalProps {
    solverMethods: GenericMethods
    solverData: SolverModel
    currentCondition: SolverContractCondition
    onBack: () => void
    isArbitrating?: number
    setIsArbitrating: React.Dispatch<SetStateAction<number | undefined>>
}

const ArbitrateModal = ({
    solverMethods,
    solverData,
    currentCondition,
    onBack,
    isArbitrating,
    setIsArbitrating,
}: ArbitrateModalProps) => {
    const [errMsg, setErrMsg] = useState<ErrorMessageType>()

    const onArbitrate = async (indexSet: number) => {
        setIsArbitrating(indexSet)
        try {
            const binaryArray = binaryArrayFromIndexSet(
                indexSet,
                solverData.config.conditionBase.outcomeSlots
            )
            const tx: ethers.ContractTransaction =
                await solverMethods.arbitrate(
                    currentCondition.executions - 1,
                    binaryArray
                )
            const rc = await tx.wait()
            if (!rc.events?.find((event) => event.event === 'ChangedStatus'))
                throw GENERAL_ERROR['ARBITRATION_ERROR']
        } catch (e) {
            setErrMsg(await cpLogger.push(e))
            setIsArbitrating(undefined)
        }
    }

    return (
        <>
            <BaseLayerModal onBack={onBack}>
                <ModalHeader
                    icon={<Scales />}
                    metaInfo="Arbitration"
                    title="Report an outcome"
                    description="This report will overwrite the Keepers proposed outcome and allocate tokens accordingly."
                />
                <Box gap="medium" height={{ min: 'auto' }} fill="horizontal">
                    {solverData.outcomeCollections[
                        currentCondition.conditionId
                    ].map((outcomeCollection) => {
                        return (
                            <OutcomeCollectionCard
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
