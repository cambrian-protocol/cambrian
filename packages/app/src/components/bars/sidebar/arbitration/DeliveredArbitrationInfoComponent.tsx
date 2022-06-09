import { useEffect, useState } from 'react'

import CTFContract from '@cambrian/app/contracts/CTFContract'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import PayoutInfoComponent from '../PayoutInfoComponent'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/ComposerTransformer'

interface DeliveredArbitrationInfoComponentProps {
    solverData: SolverModel
    currentUser: UserType
    currentCondition: SolverContractCondition
}

const DeliveredArbitrationInfoComponent = ({
    solverData,
    currentUser,
    currentCondition,
}: DeliveredArbitrationInfoComponentProps) => {
    const [reportedOutcome, setReportedOutcome] =
        useState<OutcomeCollectionModel>()

    useEffect(() => {
        fetchPayoutFromCTF()
    }, [])

    const fetchPayoutFromCTF = async () => {
        if (currentUser.signer && currentUser.chainId) {
            const conditionalTokenFrameworkContract = new CTFContract(
                currentUser.signer,
                currentUser.chainId
            )
            const logs =
                await conditionalTokenFrameworkContract.contract.queryFilter(
                    conditionalTokenFrameworkContract.contract.filters.ConditionResolution(
                        currentCondition.conditionId
                    )
                )

            const reportedBinaryArray = logs[0].args?.payoutNumerators

            const indexSet = getIndexSetFromBinaryArray(reportedBinaryArray)

            const outcomeCollection = solverData.outcomeCollections[
                currentCondition.conditionId
            ].find(
                (outcomeCollection) => outcomeCollection.indexSet === indexSet
            )
            if (outcomeCollection) {
                setReportedOutcome(outcomeCollection)
            }
        }
    }

    return (
        <>
            {reportedOutcome && (
                <PayoutInfoComponent
                    border
                    title="Reported Outcome"
                    reporterOrProposer="Arbitrator"
                    keeperOrArbitratorAddress={solverData.config.arbitrator}
                    token={solverData.collateralToken}
                    outcome={reportedOutcome}
                />
            )}
        </>
    )
}

export default DeliveredArbitrationInfoComponent
