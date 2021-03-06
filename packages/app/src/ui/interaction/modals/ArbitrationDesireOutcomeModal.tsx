import { SetStateAction, useState } from 'react'

import BaseLayerModal from '../../../components/modals/BaseLayerModal'
import { Box } from 'grommet'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../../../components/modals/ErrorPopupModal'
import OutcomeCollectionCard from '../../../components/cards/OutcomeCollectionCard'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { binaryArrayFromIndexSet } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { TreeStructure } from 'phosphor-react'

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
    const [errMsg, setErrMsg] = useState<ErrorMessageType>()

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
            setErrMsg(await cpLogger.push(e))
        }
        setDesiredIndexSet(undefined)
    }

    return (
        <>
            <BaseLayerModal onBack={onBack}>
                <ModalHeader
                    icon={<TreeStructure />}
                    metaInfo="Arbitration"
                    title="Propose an outcome"
                    description="Please select your desired outcome."
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
                                onPropose={onDesireOutcome}
                                proposedIndexSet={desiredIndexSet}
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

export default ArbitrationDesireOutcomeModal
