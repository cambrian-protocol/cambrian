import {
    AllocationType,
    SolverContractCondition,
    SolverDataModel,
} from '@cambrian/app/models/SolverModel'
import { useContext, useEffect, useState } from 'react'

import Actionbar from '@cambrian/app/ui/interaction/bars/Actionbar'
import { CTFContext } from '@cambrian/app/store/CTFContext'
import { Handshake } from 'phosphor-react'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserContext } from '@cambrian/app/store/UserContext'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import { formatDecimals } from '@cambrian/app/utils/helpers/tokens'

interface RedeemTokensActionbarProps {
    currentCondition: SolverContractCondition
    solverData: SolverDataModel
}

const RedeemTokensActionbar = ({
    currentCondition,
    solverData,
}: RedeemTokensActionbarProps) => {
    // TODO Fetch token and amount for signer
    // TODO Redeem token functionality
    const ctf = useContext(CTFContext)
    const user = useContext(UserContext)

    const [collateralToken, setCollateralToken] = useState<TokenModel>()
    const [userAllocations, setUserAllocations] = useState<AllocationType[]>()
    const [
        userPayoutPercentageForCondition,
        setUserPayoutPercentageForCondition,
    ] = useState<number>()
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
            getUserAllocs()
        } else {
            console.log(ctf, user.currentUser, solverData)
        }
    }, [ctf])

    useEffect(() => {
        if (userAllocations) {
            setUserPayoutPercentageForCondition(getTotalPayout(userAllocations))
        }
    }, [userAllocations])

    // address indexed redeemer,
    // IERC20 indexed collateralToken,
    // bytes32 indexed parentCollectionId,
    // bytes32 conditionId,
    // uint256[] indexSets,
    // uint256 payout

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
     * IMPORTANT: Amount in alloc is in basis points. Divide by 100 to get pct.
     */
    const getTotalPayout = (allocations: AllocationType[]) => {
        const payoutNumerators = currentCondition.payouts
        const indexSets = solverData.config.conditionBase.partition
        const outcomeSlotCount = solverData.config.conditionBase.outcomeSlots

        let den = currentCondition.payouts.reduce((total, next) => {
            return total + next
        })

        let payout = 0

        for (let i = 0; i < indexSets.length; i++) {
            const indexSet = indexSets[i]

            let payoutNumerator = 0

            for (let j = 0; j < outcomeSlotCount; j++) {
                if ((indexSet & (1 << j)) != 0) {
                    payoutNumerator = payoutNumerator + payoutNumerators[j]
                }
            }

            const payoutStake = allocations.find(
                (alloc) => alloc.outcomeCollectionIndexSet === indexSet
            )?.amount

            if (payoutStake && Number(payoutStake) > 0) {
                payout = payout + (Number(payoutStake) * payoutNumerator) / den
            }
        }

        return payout / 100 // Get percent from basis points
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

    const getUserAllocs = () => {
        const userAllocs = solverData.allocationsHistory[
            currentCondition.conditionId
        ].find(
            (alloc) =>
                decodeData(
                    [alloc.address.dataType],
                    alloc.address.slot.data
                ) === user.currentUser?.address
        )

        if (userAllocs !== undefined) {
            setUserAllocations(userAllocs.allocations)
        }
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
                                            userPayoutPercentageForCondition *
                                                solverData
                                                    .numMintedTokensByCondition[
                                                    currentCondition.conditionId
                                                ]
                                        ) / 100
                                      : `${
                                            solverData
                                                .numMintedTokensByCondition?.[
                                                currentCondition.conditionId
                                            ]
                                        }`
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
