import BaseActionbar, {
    ActionbarInfoType,
} from '@cambrian/app/components/bars/actionbars/BaseActionbar'
import { BigNumber, ethers } from 'ethers'
import { Box, Button, Text } from 'grommet'
import { Coin, Confetti, Info } from 'phosphor-react'
import {
    ReclaimableTokensType,
    getReclaimableTokensFromSolver,
} from '@cambrian/app/utils/helpers/redeemHelper'
import {
    calculateCollectionId,
    calculatePositionId,
} from '@cambrian/app/utils/helpers/solverHelpers'
import { useEffect, useState } from 'react'

import ActionbarItemDropContainer from '../../../containers/ActionbarItemDropContainer'
import { AllocationModel } from '@cambrian/app/models/AllocationModel'
import CTFContract from '@cambrian/app/contracts/CTFContract'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../../../modals/ErrorPopupModal'
import LoaderButton from '../../../buttons/LoaderButton'
import ReclaimTokensModal from '@cambrian/app/ui/common/modals/ReclaimTokensModal'
import { SolidityDataTypes } from '@cambrian/app/models/SolidityDataTypes'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { decodeData } from '@cambrian/app/utils/helpers/decodeData'
import { getIndexSetFromBinaryArray } from '@cambrian/app/utils/transformers/ComposerTransformer'

interface RedeemTokensActionbarProps {
    solverAddress: string
    currentUser: UserType
    currentCondition: SolverContractCondition
    solverData: SolverModel
    messenger?: JSX.Element
}

const RedeemTokensActionbar = ({
    solverAddress,
    currentCondition,
    solverData,
    currentUser,
    messenger,
}: RedeemTokensActionbarProps) => {
    // Note: Can just be here if a permission was set, permission can just be set on a user with signer and chainId
    const ctf = new CTFContract(currentUser.signer!!, currentUser.chainId!!)

    const [payoutAmount, setPayoutAmount] = useState<number>()
    const [redeemedAmount, setRedeemedAmount] = useState<number>()
    const [isRedeeming, setIsRedeeming] = useState(false)
    const [errMsg, setErrMsg] = useState<ErrorMessageType>()
    const [reclaimableTokens, setReclaimableTokens] =
        useState<ReclaimableTokensType>()
    const [showReclaimTokenModal, setShowReclaimTokenModal] = useState(false)
    const toggleShowReclaimTokenModal = () =>
        setShowReclaimTokenModal(!showReclaimTokenModal)

    const payoutRedemptionFilter = ctf.contract.filters.PayoutRedemption(
        currentUser.address,
        solverData.config.conditionBase.collateralToken,
        currentCondition.parentCollectionId,
        null,
        null,
        null
    )

    useEffect(() => {
        init()
        initReclaimableTokens()
        return () => {
            ctf.contract.removeListener(
                payoutRedemptionFilter,
                redeemedListener
            )
        }
    }, [currentUser])

    const initReclaimableTokens = async () => {
        setReclaimableTokens(
            await getReclaimableTokensFromSolver(
                solverAddress,
                currentCondition.conditionId,
                currentUser
            )
        )
    }

    const init = async () => {
        try {
            const logs = await ctf.contract.queryFilter(payoutRedemptionFilter)
            const conditionLogs = logs.filter(
                (l) => l.args?.conditionId == currentCondition.conditionId
            )
            ctf.contract.on(payoutRedemptionFilter, redeemedListener)

            if (conditionLogs.length > 0) {
                const amount = conditionLogs
                    .map((l) => l.args?.payout)
                    .filter(Boolean)
                    .reduce((x, y) => {
                        return x + y
                    }, 0)
                const formattedRedeemed = ethers.utils.formatUnits(
                    BigNumber.from(amount),
                    solverData.collateralToken.decimals
                )
                setRedeemedAmount(Number(formattedRedeemed))
            } else {
                const allocs: AllocationModel[] = []
                solverData.outcomeCollections[
                    currentCondition.conditionId
                ].forEach((oc) => {
                    oc.allocations.forEach((allocation) => {
                        const decodedAddress = decodeData(
                            [SolidityDataTypes.Address],
                            allocation.addressSlot.slot.data
                        )
                        if (decodedAddress === currentUser.address) {
                            allocs.push(allocation)
                        }
                    })
                })

                const conditionResolutionLogs = await ctf.contract.queryFilter(
                    ctf.contract.filters.ConditionResolution(
                        currentCondition.conditionId
                    )
                )

                const ctfPayoutNumeratorsBN: BigNumber[] =
                    conditionResolutionLogs[0].args?.payoutNumerators

                const ctfPayoutNumerators = ctfPayoutNumeratorsBN.map(
                    (numberator) => numberator.toNumber()
                )

                const payoutPercentage = getTotalPayoutPct(
                    allocs,
                    ctfPayoutNumerators
                )
                if (
                    payoutPercentage &&
                    solverData.numMintedTokensByCondition?.[
                        currentCondition.conditionId
                    ]
                ) {
                    const amountWei = payoutPercentage.mul(
                        solverData.numMintedTokensByCondition[
                            currentCondition.conditionId
                        ]
                    )
                    const amount = ethers.utils.formatUnits(
                        amountWei,
                        solverData.collateralToken.decimals
                    )
                    setPayoutAmount(Number(amount) / 100)
                }
            }
        } catch (e) {
            setErrMsg(await cpLogger.push(e))
        }
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
            const payoutBigNumber = BigNumber.from(payout)
            const formattedPayout = ethers.utils.formatUnits(
                BigNumber.from(payoutBigNumber),
                solverData.collateralToken.decimals
            )
            setRedeemedAmount(Number(formattedPayout))
            setIsRedeeming(false)
        }
    }

    /**
     * Mostly mimics calculation from ConditionalToken.sol
     */
    const getTotalPayoutPct = (
        allocations: AllocationModel[],
        payoutNumerators: number[]
    ) => {
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
        setIsRedeeming(true)
        try {
            await ctf.contract.redeemPositions(
                solverData.config.conditionBase.collateralToken,
                currentCondition.parentCollectionId,
                currentCondition.conditionId,
                solverData.config.conditionBase.partition
            )
        } catch (e) {
            setErrMsg(await cpLogger.push(e))
            setIsRedeeming(false)
        }
    }

    let actionbarInfo: ActionbarInfoType

    if (redeemedAmount) {
        actionbarInfo = {
            title: 'Tokens redeemed',
            subTitle: 'You have sucessfully redeemed your token.',
            dropContent: (
                <ActionbarItemDropContainer
                    title="Tokens redeemed"
                    description="You have sucessfully redeemed your token. There is nothing more to do here."
                    list={[
                        {
                            icon: <Info />,
                            label: "If you can't see the token in your wallet, try to import the token manually",
                        },
                        {
                            icon: <Coin />,
                            label: `Token address: ${solverData.collateralToken.address}`,
                        },
                    ]}
                />
            ),
        }
    } else {
        actionbarInfo = {
            title: 'Redeem tokens',
            subTitle: `You have earned ${payoutAmount} ${
                solverData.collateralToken
                    ? solverData.collateralToken.symbol ||
                      solverData.collateralToken.name
                    : 'Tokens'
            }`,
            dropContent: (
                <ActionbarItemDropContainer
                    title="Redeem tokens"
                    description='Hit the "Redeem Tokens"-Button and confirm the transaction to receive your share.'
                    list={[
                        {
                            icon: <Confetti />,
                            label: `You have earned ${payoutAmount} ${
                                solverData.collateralToken
                                    ? solverData.collateralToken.symbol ||
                                      solverData.collateralToken.name
                                    : 'Tokens'
                            }`,
                        },
                    ]}
                />
            ),
        }
    }

    const reclaimInfo = {
        title: 'Reclaim tokens',
        subTitle: 'You have tokens to reclaim',
        dropContent: (
            <ActionbarItemDropContainer
                title="Reclaim tokens"
                description='Hit the "Reclaim Tokens"-Button, reclaim and redeem your invested fundings.'
                list={[]}
            />
        ),
    }

    return (
        <>
            {redeemedAmount ? (
                <BaseActionbar
                    messenger={messenger}
                    info={actionbarInfo}
                    primaryAction={
                        <Box>
                            <Text size="small" color="dark-4">
                                Succesfully redeemed
                            </Text>
                            <Text textAlign="end">{`${redeemedAmount} ${
                                solverData.collateralToken
                                    ? solverData.collateralToken.symbol ||
                                      solverData.collateralToken.name
                                    : 'Tokens'
                            }`}</Text>
                        </Box>
                    }
                    secondaryAction={
                        reclaimableTokens ? (
                            <Button
                                label="Claim Refund"
                                secondary
                                size="small"
                                onClick={toggleShowReclaimTokenModal}
                            />
                        ) : undefined
                    }
                />
            ) : payoutAmount ? (
                <BaseActionbar
                    messenger={messenger}
                    info={actionbarInfo}
                    primaryAction={
                        <LoaderButton
                            primary
                            isLoading={isRedeeming}
                            onClick={redeemCondition}
                            label={`Redeem ${payoutAmount.toFixed(2)}${
                                payoutAmount.toString().length > 4 ? '...' : ''
                            } ${
                                solverData.collateralToken
                                    ? solverData.collateralToken.symbol ||
                                      solverData.collateralToken.name
                                    : 'Tokens'
                            }`}
                        />
                    }
                    secondaryAction={
                        reclaimableTokens ? (
                            <Button
                                label="Claim Refund"
                                secondary
                                size="small"
                                onClick={toggleShowReclaimTokenModal}
                            />
                        ) : undefined
                    }
                />
            ) : (
                <BaseActionbar
                    messenger={messenger}
                    info={reclaimableTokens ? reclaimInfo : undefined}
                    primaryAction={
                        reclaimableTokens ? (
                            <Button
                                label="Reclaim"
                                primary
                                size="small"
                                onClick={toggleShowReclaimTokenModal}
                            />
                        ) : undefined
                    }
                />
            )}
            {showReclaimTokenModal && reclaimableTokens && (
                <ReclaimTokensModal
                    onClose={toggleShowReclaimTokenModal}
                    reclaimableTokens={reclaimableTokens}
                    updateReclaimableTokens={initReclaimableTokens}
                />
            )}
            {errMsg && (
                <ErrorPopupModal
                    onClose={() => setErrMsg(undefined)}
                    errorMessage={errMsg}
                />
            )}
        </>
    )
}

export default RedeemTokensActionbar
