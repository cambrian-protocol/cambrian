import { BigNumber, ethers } from 'ethers'
import { Box, Text } from 'grommet'
import {
    ReclaimablePositionType,
    truncateAmount,
} from '@cambrian/app/utils/helpers/redeemHelper'

import BaseSkeletonBox from '../skeletons/BaseSkeletonBox'
import ClaimItem from '../list/ClaimItem'
import LoaderButton from '../buttons/LoaderButton'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import ReclaimablePositionItem from './ReclaimablePositionItem'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'
import useRedeem from '@cambrian/app/hooks/useRedeem'
import { useState } from 'react'

interface ReclaimablePositionItemProps {
    proposalId: string
    collateralToken: TokenModel
    fundingGoal: BigNumber
    reclaimablePosition: ReclaimablePositionType
    currentUser: UserType
    updateReclaimableTokens: () => Promise<void>
    solverData: SolverModel
    currentCondition: SolverContractCondition
}

const ReclaimAndRedeemPositionItem = ({
    reclaimablePosition,
    proposalId,
    currentUser,
    collateralToken,
    fundingGoal,
    currentCondition,
    solverData,
    updateReclaimableTokens,
}: ReclaimablePositionItemProps) => {
    const { setAndLogError } = useErrorContext()
    const { payoutInfo, redeemedAmount, ctfContract, isLoaded } = useRedeem(
        currentUser,
        solverData,
        currentCondition
    )
    const [isRedeeming, setIsRedeeming] = useState(false)

    const redeemCondition = async () => {
        setIsRedeeming(true)
        try {
            await ctfContract.redeemPositions(
                solverData.config.conditionBase.collateralToken,
                currentCondition.parentCollectionId,
                currentCondition.conditionId,
                solverData.config.conditionBase.partition
            )
        } catch (e) {
            setAndLogError(e)
            setIsRedeeming(false)
        }
    }

    return (
        <Box gap="small">
            {isLoaded ? (
                <ReclaimablePositionItem
                    key={reclaimablePosition.positionId}
                    proposalId={proposalId}
                    collateralToken={collateralToken}
                    currentUser={currentUser}
                    reclaimablePosition={reclaimablePosition}
                    updateReclaimableTokens={updateReclaimableTokens}
                    fundingGoal={fundingGoal}
                    recipientPayout={payoutInfo}
                >
                    {redeemedAmount ? (
                        <Box gap="medium">
                            <PlainSectionDivider />
                            <ClaimItem
                                title="Sucessfully redeemed"
                                amount={redeemedAmount}
                                collateralToken={solverData.collateralToken}
                            />
                        </Box>
                    ) : (
                        <Box gap="small">
                            <PlainSectionDivider />
                            {reclaimablePosition.funderReclaimed.eq(0) && (
                                <Text size="small" color="dark-4">
                                    Please claim all your refunds before
                                    redeeming your tokens
                                </Text>
                            )}
                            <LoaderButton
                                isLoading={isRedeeming}
                                disabled={reclaimablePosition.funderReclaimed.eq(
                                    0
                                )}
                                primary
                                label={`Redeem ${
                                    payoutInfo &&
                                    truncateAmount(
                                        ethers.utils.formatUnits(
                                            payoutInfo.amount.add(
                                                reclaimablePosition.funderReclaimableAmount
                                            ),
                                            collateralToken.decimals
                                        )
                                    )
                                } ${collateralToken.symbol}`}
                                onClick={redeemCondition}
                            />
                        </Box>
                    )}
                </ReclaimablePositionItem>
            ) : (
                <Box gap="small">
                    <BaseSkeletonBox height={'xsmall'} />
                    <BaseSkeletonBox height={'xsmall'} />
                </Box>
            )}
        </Box>
    )
}

export default ReclaimAndRedeemPositionItem
