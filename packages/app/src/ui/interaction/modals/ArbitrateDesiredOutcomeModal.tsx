import { SetStateAction, useState } from 'react'

import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { DisputeModel } from '@cambrian/app/models/DisputeModel'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../../../components/modals/ErrorPopupModal'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { OutcomeCollectionInfoType } from '@cambrian/app/components/info/solver/BaseSolverInfo'
import OutcomeOverview from '../../solver/OutcomeOverview'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { getOutcomeCollectionInfoFromContractData } from '@cambrian/app/utils/helpers/solverHelpers'

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
    const [errMsg, setErrMsg] = useState<ErrorMessageType>()
    const onArbitrate = async (choiceIndex: number) => {
        setIsArbitrating(choiceIndex)
        try {
            const tx: ethers.ContractTransaction = await arbitratorContract[
                'arbitrate(bytes32,uint256)'
            ](disputeId, choiceIndex)
            await tx.wait()
        } catch (e) {
            setErrMsg(await cpLogger.push(e))
            setIsArbitrating(undefined)
        }
    }

    return (
        <>
            <BaseLayerModal onBack={onBack} width="xlarge">
                <ModalHeader
                    metaInfo="Arbitration"
                    title="Arbitrate an outcome"
                    description="This report will overwrite the Keepers proposed outcome and allocates tokens accordingly."
                />
                <Box gap="medium" height={{ min: 'auto' }} fill="horizontal">
                    <OutcomeOverview
                        outcomeCollectionInfos={getOutcomeCollectionsToArbitrate(
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
            {errMsg && (
                <ErrorPopupModal
                    onClose={() => setErrMsg(undefined)}
                    errorMessage={errMsg}
                />
            )}
        </>
    )
}

export default ArbitrateDesiredOutcomeModal

// TODO Display disputer
const getOutcomeCollectionsToArbitrate = (
    dispute: DisputeModel,
    solverData: SolverModel,
    currentCondition: SolverContractCondition
) => {
    const outcomeCollections: OutcomeCollectionInfoType[] = []

    dispute.disputers.forEach((disputer, idx) => {
        const indexSet = getIndexSetFromBinaryArray(dispute.choices[idx])

        const outcomeCollection = solverData.outcomeCollections[
            currentCondition.conditionId
        ].find((outcomeCollection) => outcomeCollection.indexSet === indexSet)

        if (
            outcomeCollection &&
            solverData.numMintedTokensByCondition &&
            solverData.numMintedTokensByCondition[currentCondition.conditionId]
        ) {
            outcomeCollections.push({
                ...getOutcomeCollectionInfoFromContractData(
                    outcomeCollection,
                    Number(
                        ethers.utils.formatUnits(
                            solverData.numMintedTokensByCondition[
                                currentCondition.conditionId
                            ],
                            solverData.collateralToken.decimals
                        )
                    )
                ),
                indexSet: indexSet,
            })
        }
    })
    return outcomeCollections
}
