import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { DisputeModel } from '@cambrian/app/models/DisputeModel'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import OutcomeOverview from '../../solver/OutcomeOverview'
import { SetStateAction } from 'react'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { ethers } from 'ethers'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'

interface ArbitrateDesiredOutcomeModalProps {
    onBack: () => void
    dispute: DisputeModel
    solverData: SolverModel
    setIsArbitrating: React.Dispatch<SetStateAction<number | undefined>>
    arbitratorContract: ethers.Contract
    disputeId: string
    currentCondition: SolverContractCondition
    isArbitrating?: number
}

const ArbitrateDesiredOutcomeModal = ({
    onBack,
    dispute,
    solverData,
    setIsArbitrating,
    arbitratorContract,
    disputeId,
    currentCondition,
    isArbitrating,
}: ArbitrateDesiredOutcomeModalProps) => {
    const { setAndLogError } = useErrorContext()
    const onArbitrate = async (choiceIndex: number) => {
        setIsArbitrating(choiceIndex)
        try {
            const tx: ethers.ContractTransaction = await arbitratorContract[
                'arbitrate(bytes32,uint256)'
            ](disputeId, choiceIndex)
            await tx.wait()
        } catch (e) {
            setAndLogError(e)
            setIsArbitrating(undefined)
        }
    }

    return (
        <BaseLayerModal onBack={onBack} width="xlarge">
            <ModalHeader
                metaInfo="Arbitration"
                title="Arbitrate an outcome"
                description="This report will overwrite the Keepers proposed outcome and allocates tokens accordingly."
            />
            <Box gap="medium" height={{ min: 'auto' }} fill="horizontal">
                <OutcomeOverview
                    outcomeCollections={getOutcomeCollectionsToArbitrate(
                        dispute,
                        solverData,
                        currentCondition
                    )}
                    collateralToken={solverData.collateralToken}
                    reportProps={{
                        onReport: onArbitrate,
                        reportLabel: 'Arbitrate Outcome',
                        reportedIndexSet: isArbitrating,
                        useChoiceIndex: true,
                    }}
                />
            </Box>
        </BaseLayerModal>
    )
}

export default ArbitrateDesiredOutcomeModal

// TODO Display disputer
const getOutcomeCollectionsToArbitrate = (
    dispute: DisputeModel,
    solverData: SolverModel,
    currentCondition: SolverContractCondition
) => {
    const outcomeCollections: OutcomeCollectionModel[] = []
    dispute.disputers.forEach((disputer, idx) => {
        const indexSet = getIndexSetFromBinaryArray(dispute.choices[idx])

        const outcomeCollection = solverData.outcomeCollections[
            currentCondition.conditionId
        ].find((outcomeCollection) => outcomeCollection.indexSet === indexSet)

        if (outcomeCollection) {
            outcomeCollections.push(outcomeCollection)
        }
    })
    return outcomeCollections
}
