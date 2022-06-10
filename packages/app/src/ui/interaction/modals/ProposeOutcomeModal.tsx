import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { SetStateAction, useState } from 'react'

import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import { Box } from 'grommet'
import ErrorPopupModal from '../../../components/modals/ErrorPopupModal'
import { GenericMethods } from '../../../components/solver/Solver'
import HeaderTextSection from '../../../components/sections/HeaderTextSection'
import OutcomeCollectionCard from '../../../components/cards/OutcomeCollectionCard'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'

interface ProposeOutcomeModalProps {
    proposedIndexSet?: number
    setProposedIndexSet: React.Dispatch<SetStateAction<number | undefined>>
    solverMethods: GenericMethods
    solverData: SolverModel
    currentCondition: SolverContractCondition
    onBack: () => void
}

const ProposeOutcomeModal = ({
    setProposedIndexSet,
    proposedIndexSet,
    solverMethods,
    solverData,
    currentCondition,
    onBack,
}: ProposeOutcomeModalProps) => {
    const [errMsg, setErrMsg] = useState<ErrorMessageType>()

    const onProposeOutcome = async (indexSet: number) => {
        setProposedIndexSet(indexSet)
        try {
            const binaryArray = binaryArrayFromIndexSet(
                indexSet,
                solverData.config.conditionBase.outcomeSlots
            )
            const transaction: ethers.ContractTransaction =
                await solverMethods.proposePayouts(
                    currentCondition.executions - 1,
                    binaryArray
                )
            const rc = await transaction.wait()
            if (!rc.events?.find((event) => event.event === 'ChangedStatus'))
                throw GENERAL_ERROR['PROPOSE_OUTCOME_ERROR']
        } catch (e) {
            setErrMsg(await cpLogger.push(e))
            setProposedIndexSet(undefined)
        }
    }

    return (
        <>
            <BaseLayerModal onBack={onBack}>
                <HeaderTextSection title={'Propose an outcome'} />
                <Box gap="medium" height={{ min: 'auto' }} fill="horizontal">
                    {solverData.outcomeCollections[
                        currentCondition.conditionId
                    ].map((outcomeCollection) => {
                        return (
                            <OutcomeCollectionCard
                                token={solverData.collateralToken}
                                key={outcomeCollection.indexSet}
                                outcomeCollection={outcomeCollection}
                                onPropose={onProposeOutcome}
                                proposedIndexSet={proposedIndexSet}
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

export default ProposeOutcomeModal
