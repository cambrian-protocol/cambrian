import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import { Box } from 'grommet'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import OutcomeOverview from '../../solver/OutcomeOverview'
import { SetStateAction } from 'react'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { ethers } from 'ethers'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'

interface ArbitrationDesireOutcomeModalProps {
    solverAddress: string
    arbitratorContract: ethers.Contract
    desiredIndexSet?: number
    setDesiredIndexSet: React.Dispatch<SetStateAction<number | undefined>>
    fee: ethers.BigNumber
    solverData: SolverModel
    currentCondition: SolverContractCondition
    onBack: () => void
}

const ArbitrationDesireOutcomeModal = ({
    arbitratorContract,
    setDesiredIndexSet,
    desiredIndexSet,
    solverData,
    currentCondition,
    onBack,
    solverAddress,
    fee,
}: ArbitrationDesireOutcomeModalProps) => {
    const { showAndLogError } = useErrorContext()

    const onDesireOutcome = async (indexSet: number) => {
        setDesiredIndexSet(indexSet)
        try {
            const desiredOutcomeArray = binaryArrayFromIndexSet(
                indexSet,
                solverData.config.conditionBase.outcomeSlots
            ).map((x) => ethers.BigNumber.from(x))

            const tx: ethers.ContractTransaction = await arbitratorContract[
                'requestArbitration(address,uint256,uint256[])'
            ](
                solverAddress,
                currentCondition.executions - 1,
                desiredOutcomeArray,
                { value: fee }
            )

            await tx.wait()
            onBack()
        } catch (e) {
            showAndLogError(e)
        }
        setDesiredIndexSet(undefined)
    }

    return (
        <BaseLayerModal onBack={onBack}>
            <ModalHeader
                metaInfo="Arbitration"
                title="Propose an outcome"
                description="Please select your desired outcome."
            />
            <Box gap="medium" height={{ min: 'auto' }} fill="horizontal">
                <OutcomeOverview
                    reportProps={{
                        onReport: onDesireOutcome,
                        reportedIndexSet: desiredIndexSet,
                        reportLabel: 'Request Outcome',
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

export default ArbitrationDesireOutcomeModal
