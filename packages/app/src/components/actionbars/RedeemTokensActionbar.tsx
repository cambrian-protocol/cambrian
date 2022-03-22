import { useContext, useEffect, useState } from 'react'

import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { AllocationModel } from '@cambrian/app/models/AllocationModel'
import { CTFContext } from '@cambrian/app/store/CTFContext'
import { Handshake } from 'phosphor-react'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserContext } from '@cambrian/app/store/UserContext'
import { formatDecimals } from '@cambrian/app/utils/helpers/tokens'
import { SlotsHistoryHashMapType } from '@cambrian/app/models/SlotModel'
import { SolverConfigModel } from '@cambrian/app/models/SolverConfigModel'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { BigNumber } from 'ethers'

interface RedeemTokensActionbarProps {
    currentCondition: SolverContractCondition
    solverData: SolverModel
    proposedOutcome: OutcomeCollectionModel
}

const RedeemTokensActionbar = ({
    currentCondition,
    solverData,
    proposedOutcome,
}: RedeemTokensActionbarProps) => {
    // TODO Fetch token and amount for signer
    // TODO Redeem token functionality
    const ctf = useContext(CTFContext)
    const user = useContext(UserContext)

    const [collateralToken, setCollateralToken] = useState<TokenModel>()

    const [userAllocations, setUserAllocations] = useState<AllocationModel[]>()
    const [
        userPayoutPercentageForCondition,
        setUserPayoutPercentageForCondition,
    ] = useState<BigNumber>()
    const [isRedeemed, setIsRedeemed] = useState<boolean>(false)
    const [redeemedAmount, setRedeemedAmount] = useState<number>()

    useEffect(() => {
        if (ctf && user.currentUser) {
            listenIsRedeemed()
        }
    }, [ctf, user])

    useEffect(() => {
        getCollateralToken()
    }, [])

    useEffect(() => {
        if (user.currentUser && solverData) {
            getUserAllocations()
        }
    }, [user, solverData])

    useEffect(() => {
        console.log('userAllocs: ', userAllocations)

        if (userAllocations) {
            console.log('total payout: ', getTotalPayoutPct(userAllocations))
            setUserPayoutPercentageForCondition(
                getTotalPayoutPct(userAllocations)
            )
        }
    }, [userAllocations])

    const getUserAllocations = () => {
        const allocs: AllocationModel[] = []
        solverData.outcomeCollections[currentCondition.conditionId].forEach(
            (oc) => {
                oc.allocations.forEach((allocation) => {
                    const decodedAddress = decodeData(
                        [SolidityDataTypes.Address],
                        allocation.addressSlot.slot.data
                    )
                    if (decodedAddress === user.currentUser?.address) {
                        allocs.push(allocation)
                    }
                })
            }
        )
        setUserAllocations(allocs)
    }

    const listenIsRedeemed = async () => {
        if (ctf && user.currentUser) {
            const logs = await ctf.queryFilter(
                ctf.filters.PayoutRedemption(
                    user.currentUser?.address,
                    solverData.config.conditionBase.collateralToken,
                    currentCondition.parentCollectionId,
                    null,
                    null,
                    null
                )
            )

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
            }

            ctf.on(
                ctf.filters.PayoutRedemption(
                    user.currentUser?.address,
                    solverData.config.conditionBase.collateralToken,
                    currentCondition.parentCollectionId,
                    null,
                    null,
                    null
                ),
                (
                    redeemer,
                    collateralToken,
                    parentCollectionId,
                    conditionId,
                    indexSets,
                    payout
                ) => {
                    if (conditionId == currentCondition.conditionId) {
                        console.log('sdasd')
                        const amount = payout
                        setIsRedeemed(true)
                        setRedeemedAmount(amount)
                    }
                }
            )
        }
    }

    /**
     * Mimics calculation from ConditionalToken.sol
     * TODO, may not be calculating properly for multiple allocations to the same user from one OC
     */
    const getTotalPayoutPct = (allocations: AllocationModel[]) => {
        const payoutNumerators = currentCondition.payouts
        const indexSets = solverData.config.conditionBase.partition
        const outcomeSlotCount = solverData.config.conditionBase.outcomeSlots

        let den = currentCondition.payouts.reduce((total, next) => {
            return total + next
        })

        let payout = BigNumber.from(0)

        for (let i = 0; i < indexSets.length; i++) {
            const indexSet = indexSets[i]

            let payoutNumerator = 0

            for (let j = 0; j < outcomeSlotCount; j++) {
                if ((indexSet & (1 << j)) != 0) {
                    payoutNumerator = payoutNumerator + payoutNumerators[j]
                }
            }

            const payoutStake = allocations.find(
                (alloc) => proposedOutcome.indexSet === indexSet
            )?.amountPercentage

            if (payoutStake && BigNumber.from(payoutStake).gt(0)) {
                // payout = payout + (Number(payoutStake) * payoutNumerator) / den
                payout = payout
                    .add(BigNumber.from(payoutStake).mul(payoutNumerator))
                    .div(den)
            }
        }
        return payout
    }

    /**
     * Get collateralToken info for display next to totalPayout
     */
    const getCollateralToken = async () => {
        const token = await TokenAPI.getTokenInfo(
            solverData.config.conditionBase.collateralToken
        )
        setCollateralToken(token)
    }

    /**
     * Each condition must be redeemed independently
     * "Redeem Tokens" action may want to open a modal showing seperate redeemable value for each condition
     */
    const redeemCondition = async () => {
        if (ctf && currentCondition && solverData) {
            await ctf.redeemPositions(
                solverData.config.conditionBase.collateralToken,
                currentCondition.parentCollectionId,
                currentCondition.conditionId,
                solverData.config.conditionBase.partition
            )
        }
    }

    return (
        <Actionbar
            actions={
                isRedeemed
                    ? {
                          info: {
                              icon: <Handshake />,
                              label: `${
                                  (redeemedAmount !== undefined &&
                                      formatDecimals(
                                          collateralToken,
                                          redeemedAmount
                                      )) ||
                                  '?'
                              } ${
                                  collateralToken
                                      ? collateralToken.symbol ||
                                        collateralToken.name
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
                                            collateralToken,
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
                                      : 'Unknown'
                              } ${
                                  collateralToken
                                      ? collateralToken.symbol ||
                                        collateralToken.name
                                      : 'Tokens'
                              }`,
                              descLabel: 'You have earned',
                          },
                      }
            }
        />
    )
}

export default RedeemTokensActionbar
