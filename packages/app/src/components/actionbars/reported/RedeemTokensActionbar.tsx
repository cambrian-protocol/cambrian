import { useEffect, useState } from 'react'

import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { AllocationModel } from '@cambrian/app/models/AllocationModel'
import { BigNumber } from 'ethers'
import CTFContract from '@cambrian/app/contracts/CTFContract'
import ErrorPopupModal from '../../modals/ErrorPopupModal'
import { Handshake } from 'phosphor-react'
import LoadingScreen from '../../info/LoadingScreen'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { TRANSACITON_MESSAGE } from '@cambrian/app/constants/TransactionMessages'
import { UserType } from '@cambrian/app/store/UserContext'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import { formatDecimals } from '@cambrian/app/utils/helpers/tokens'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/ComposerTransformer'
import {
    calculateCollectionId,
    calculatePositionId,
} from '../../solver/SolverHelpers'

interface RedeemTokensActionbarProps {
    currentUser: UserType
    currentCondition: SolverContractCondition
    solverData: SolverModel
}

const RedeemTokensActionbar = ({
    currentCondition,
    solverData,
    currentUser,
}: RedeemTokensActionbarProps) => {
    const ctf = new CTFContract(currentUser.signer)

    const [
        userPayoutPercentageForCondition,
        setUserPayoutPercentageForCondition,
    ] = useState<BigNumber>()
    const [isRedeemed, setIsRedeemed] = useState<boolean>(false)
    const [redeemedAmount, setRedeemedAmount] = useState<number>()
    const [transactionMsg, setTransactionMsg] = useState<string>()
    const [errMsg, setErrMsg] = useState<string>()

    const payoutRedemptionFilter = ctf.contract.filters.PayoutRedemption(
        currentUser.address,
        solverData.config.conditionBase.collateralToken,
        currentCondition.parentCollectionId,
        null,
        null,
        null
    )

    useEffect(() => {
        initUserAllocations()
        initListener()
        return () => {
            ctf.contract.removeListener(
                payoutRedemptionFilter,
                redeemedListener
            )
        }
    }, [currentUser])

    const initUserAllocations = () => {
        const allocs: AllocationModel[] = []
        solverData.outcomeCollections[currentCondition.conditionId].forEach(
            (oc) => {
                oc.allocations.forEach((allocation) => {
                    const decodedAddress = decodeData(
                        [SolidityDataTypes.Address],
                        allocation.addressSlot.slot.data
                    )
                    if (decodedAddress === currentUser.address) {
                        allocs.push(allocation)
                    }
                })
            }
        )
        setUserPayoutPercentageForCondition(getTotalPayoutPct(allocs))
    }

    const initListener = async () => {
        const logs = await ctf.contract.queryFilter(payoutRedemptionFilter)
        const conditionLogs = logs.filter(
            (l) => l.args?.conditionId == currentCondition.conditionId
        )

        if (conditionLogs.length > 0) {
            const amount = conditionLogs
                .map((l) => l.args?.payout)
                .filter(Boolean)
                .reduce((x, y) => {
                    return x + y
                }, 0)

            setIsRedeemed(true)
            setRedeemedAmount(amount)
        } else {
            setIsRedeemed(false)
            setRedeemedAmount(undefined)
        }

        ctf.contract.on(payoutRedemptionFilter, redeemedListener)
    }

    // TODO Types
    const redeemedListener = (
        redeemer: any,
        collateralToken: any,
        parentCollectionId: any,
        conditionId: any,
        indexSets: any,
        payout: any
    ) => {
        if (conditionId == currentCondition.conditionId) {
            setIsRedeemed(true)
            setRedeemedAmount(payout)
            setTransactionMsg(undefined)
        }
    }

    /**
     * Mostly mimics calculation from ConditionalToken.sol
     */
    const getTotalPayoutPct = (allocations: AllocationModel[]) => {
        const payoutNumerators = currentCondition.payouts
        const indexSets = solverData.config.conditionBase.partition
        const outcomeSlotCount = solverData.config.conditionBase.outcomeSlots

        const indexSet = getIndexSetFromBinaryArray(payoutNumerators)
        const oc = solverData.outcomeCollections[
            currentCondition.conditionId
        ].find((outcomeCollection) => outcomeCollection.indexSet === indexSet)

        let den = currentCondition.payouts.reduce((total, next) => {
            return total + next
        })

        let payout = BigNumber.from(0)
        if (oc) {
            for (let i = 0; i < indexSets.length; i++) {
                const indexSet = indexSets[i]

                let payoutNumerator = 0

                for (let j = 0; j < outcomeSlotCount; j++) {
                    if ((indexSet & (1 << j)) != 0) {
                        payoutNumerator = payoutNumerator + payoutNumerators[j]
                    }
                }

                let payoutStake = '0'
                const positionId = calculatePositionId(
                    currentCondition.collateralToken,
                    calculateCollectionId(
                        currentCondition.conditionId,
                        indexSet
                    )
                )
                allocations.forEach((alloc) => {
                    if (alloc.positionId === positionId) {
                        payoutStake = (
                            BigInt(payoutStake) + BigInt(alloc.amountPercentage)
                        ).toString()
                    }
                })

                if (payoutStake && BigNumber.from(payoutStake).gt(0)) {
                    payout = payout
                        .add(BigNumber.from(payoutStake).mul(payoutNumerator))
                        .div(den)
                }
            }
        }

        return payout
    }

    /**
     * Each condition must be redeemed independently
     * TODO "Redeem Tokens" action may want to open a modal showing seperate redeemable value for each condition
     */
    const redeemCondition = async () => {
        setTransactionMsg(TRANSACITON_MESSAGE['CONFIRM'])
        try {
            await ctf.contract.redeemPositions(
                solverData.config.conditionBase.collateralToken,
                currentCondition.parentCollectionId,
                currentCondition.conditionId,
                solverData.config.conditionBase.partition
            )
            setTransactionMsg(TRANSACITON_MESSAGE['WAIT'])
        } catch (e: any) {
            setErrMsg(e.message)
            setTransactionMsg(undefined)
            console.error(e)
        }
    }

    return (
        <>
            <Actionbar
                actions={
                    isRedeemed
                        ? {
                              info: {
                                  icon: <Handshake />,
                                  label: `${
                                      (redeemedAmount !== undefined &&
                                          formatDecimals(
                                              solverData.collateralToken,
                                              redeemedAmount
                                          )) ||
                                      '?'
                                  } ${
                                      solverData.collateralToken
                                          ? solverData.collateralToken.symbol ||
                                            solverData.collateralToken.name
                                          : 'Tokens'
                                  }`,
                                  descLabel: 'You have redeemed',
                              },
                          }
                        : {
                              primaryAction: {
                                  onClick: () => redeemCondition(),
                                  label: 'Redeem tokens',
                              },
                              info: {
                                  icon: <Handshake />,
                                  label: `${
                                      userPayoutPercentageForCondition !==
                                          undefined &&
                                      solverData.numMintedTokensByCondition?.[
                                          currentCondition.conditionId
                                      ]
                                          ? formatDecimals(
                                                solverData.collateralToken,
                                                userPayoutPercentageForCondition
                                                    .mul(
                                                        solverData
                                                            .numMintedTokensByCondition[
                                                            currentCondition
                                                                .conditionId
                                                        ]
                                                    )
                                                    .div(BigNumber.from(100))
                                            )
                                          : ''
                                  } ${
                                      solverData.collateralToken
                                          ? solverData.collateralToken.symbol ||
                                            solverData.collateralToken.name
                                          : 'Tokens'
                                  }`,
                                  descLabel: 'You have earned',
                              },
                          }
                }
            />
            {errMsg && (
                <ErrorPopupModal
                    onClose={() => setErrMsg(undefined)}
                    errorMessage={errMsg}
                />
            )}
            {transactionMsg && <LoadingScreen context={transactionMsg} />}
        </>
    )
}

export default RedeemTokensActionbar
