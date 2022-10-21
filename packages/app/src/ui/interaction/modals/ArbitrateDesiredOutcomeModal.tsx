import { SetStateAction, useState } from 'react'

import BaseAvatar from '../../../components/avatars/BaseAvatar'
import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { CardHeader } from 'grommet'
import { DisputeModel } from '@cambrian/app/models/DisputeModel'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../../../components/modals/ErrorPopupModal'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import OutcomeCollectionCard from '../../../components/cards/OutcomeCollectionCard'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { Text } from 'grommet'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { getSolverRecipientAddressHashmap } from '@cambrian/app/utils/helpers/solverHelpers'

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

    const recipientsHashmap = getSolverRecipientAddressHashmap(
        solverData,
        currentCondition
    )

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
            <BaseLayerModal onBack={onBack}>
                <ModalHeader
                    metaInfo="Arbitration"
                    title="Report an outcome"
                    description="This report will overwrite the Keepers proposed outcome and allocate tokens accordingly."
                />
                <Box gap="medium" height={{ min: 'auto' }} fill="horizontal">
                    {dispute.disputers.map((disputer, idx) => {
                        const indexSet = getIndexSetFromBinaryArray(
                            dispute.choices[idx]
                        )

                        const outcomeCollection = solverData.outcomeCollections[
                            currentCondition.conditionId
                        ].find(
                            (outcomeCollection) =>
                                outcomeCollection.indexSet === indexSet
                        )
                        if (outcomeCollection) {
                            return (
                                <OutcomeCollectionCard
                                    token={solverData.collateralToken}
                                    key={idx}
                                    outcomeCollection={outcomeCollection}
                                    itemKey={idx} // Index needs to be passed separately to set the right Loader
                                    onArbitrate={(indexSet) => onArbitrate(idx)} // Use index of this choice rather than the indexSet
                                    proposedIndexSet={isArbitrating}
                                    cardHeader={
                                        <CardHeader
                                            pad="small"
                                            elevation="small"
                                            direction="row"
                                            gap="small"
                                            justify="start"
                                        >
                                            <BaseAvatar address={disputer} />
                                            <Text truncate>
                                                {
                                                    recipientsHashmap[disputer]
                                                        ?.tag.label
                                                }
                                                's choice
                                            </Text>
                                        </CardHeader>
                                    }
                                />
                            )
                        }
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

export default ArbitrateDesiredOutcomeModal
