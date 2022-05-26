import { BigNumber, ethers } from 'ethers'
import { SetStateAction, useState } from 'react'

import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from './ErrorPopupModal'
import HeaderTextSection from '../sections/HeaderTextSection'
import OutcomeCollectionCard from '../cards/OutcomeCollectionCard'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface ArbitrationDesireOutcomeModalProps {
    currentUser: UserType
    solverAddress: string
    arbitratorContract: ethers.Contract
    proposedOutcomeCollection: OutcomeCollectionModel
    desiredIndexSet?: number
    setDesiredIndexSet: React.Dispatch<SetStateAction<number | undefined>>
    solverData: SolverModel
    currentCondition: SolverContractCondition
    onBack: () => void
}

const ArbitrationDesireOutcomeModal = ({
    currentUser,
    arbitratorContract,
    proposedOutcomeCollection,
    setDesiredIndexSet,
    desiredIndexSet,
    solverData,
    currentCondition,
    onBack,
    solverAddress,
}: ArbitrationDesireOutcomeModalProps) => {
    const [errMsg, setErrMsg] = useState<ErrorMessageType>()

    const onDesireOutcome = async (indexSet: number) => {
        setDesiredIndexSet(indexSet)
        try {
            // TODO Implement proper Info fetching
            let info: { address?: string; fee?: BigNumber; lapse?: BigNumber } =
                {
                    address: currentUser.address,
                }

            try {
                const fee: BigNumber = await arbitratorContract.getFee()
                info = { ...info, fee: fee }
            } catch {}
            try {
                const lapse: BigNumber = await arbitratorContract.lapse()
                info = { ...info, lapse: lapse }
            } catch {}

            const tx = await arbitratorContract.requestArbitration(
                solverAddress,
                currentCondition.executions - 1,
                indexSet,
                info
            )
            const receipt = await tx.wait()
        } catch (e) {
            setErrMsg(await cpLogger.push(e))
            setDesiredIndexSet(undefined)
        }
    }

    const filteredOutcomes = solverData.outcomeCollections[
        currentCondition.conditionId
    ].filter(
        (outcomeCollection) =>
            outcomeCollection.indexSet !== proposedOutcomeCollection.indexSet
    )

    return (
        <>
            <BaseLayerModal onBack={onBack}>
                <HeaderTextSection
                    title={'Arbitration'}
                    paragraph="Please select your desired outcome"
                />
                <Box gap="medium" height={{ min: 'auto' }} fill="horizontal">
                    {filteredOutcomes.map((outcomeCollection, idx) => {
                        return (
                            <OutcomeCollectionCard
                                idx={idx + 1}
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
