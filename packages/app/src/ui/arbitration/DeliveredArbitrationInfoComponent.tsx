import { useEffect, useState } from 'react'

import CTFContract from '@cambrian/app/contracts/CTFContract'
import { OutcomeCollectionInfoType } from '@cambrian/app/components/info/solver/BaseSolverInfo'
import PayoutInfoComponent from '../../components/bars/sidebar/PayoutInfoComponent'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/ComposerTransformer'
import { getOutcomeCollectionInfoFromContractData } from '@cambrian/app/utils/helpers/solverHelpers'

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
        useState<OutcomeCollectionInfoType>()

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
                const outcomeInfo =
                    solverData.numMintedTokensByCondition &&
                    getOutcomeCollectionInfoFromContractData(
                        outcomeCollection,
                        Number(
                            ethers.utils.formatUnits(
                                solverData.numMintedTokensByCondition[
                                    currentCondition.conditionId
                                ],
                                solverData.collateralToken.decimals
                            )
                        )
                    )
                setReportedOutcome(outcomeInfo)
            }
        }
    }

    return (
        <>
            {reportedOutcome && (
                <PayoutInfoComponent
                    border
                    title="Reported Outcome"
                    token={solverData.collateralToken}
                    outcome={reportedOutcome}
                />
            )}
        </>
    )
}

export default DeliveredArbitrationInfoComponent
