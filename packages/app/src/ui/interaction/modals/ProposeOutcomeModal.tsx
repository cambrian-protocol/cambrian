import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { GENERAL_ERROR } from '@cambrian/app/constants/ErrorMessages'
import { GenericMethods } from '../../../components/solver/Solver'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import OutcomeOverview from '../../solver/OutcomeOverview'
import { SetStateAction } from 'react'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { ethers } from 'ethers'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'

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
    const { showAndLogError } = useErrorContext()

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
            showAndLogError(e)
            setProposedIndexSet(undefined)
        }
    }

    return (
        <BaseLayerModal onBack={onBack} width="xlarge">
            <ModalHeader
                title="Propose an outcome"
                description="Select the outcome when solve conditions are met."
            />
            <Box gap="medium" height={{ min: 'auto' }} fill="horizontal">
                <OutcomeOverview
                    reportProps={{
                        onReport: onProposeOutcome,
                        reportLabel: 'Propose Outcome',
                        reportedIndexSet: proposedIndexSet,
                    }}
                    collateralToken={solverData.collateralToken}
                    outcomeCollections={
                        solverData.outcomeCollections[
                            currentCondition.conditionId
                        ]
                    }
                />
            </Box>
        </BaseLayerModal>
    )
}

export default ProposeOutcomeModal
