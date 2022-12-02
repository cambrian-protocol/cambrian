import {
    PayoutInfo,
    ReclaimablePositionType,
} from '@cambrian/app/utils/helpers/redeemHelper'

import { BigNumber } from 'ethers'
import { Box } from 'grommet'
import ReclaimablePositionItem from './ReclaimablePositionItem'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'

export interface ReclaimTokenCardProps {
    proposalId: string
    collateralToken: TokenModel
    reclaimablePositions: ReclaimablePositionType[]
    updateReclaimableTokens: () => Promise<void>
    currentUser: UserType
    recipientPayout?: PayoutInfo
    fundingGoal: BigNumber
}

const ReclaimTokenCard = ({
    proposalId,
    reclaimablePositions,
    collateralToken,
    updateReclaimableTokens,
    currentUser,
    recipientPayout,
    fundingGoal,
}: ReclaimTokenCardProps) => {
    return (
        <Box
            border
            background={'background-contrast'}
            pad="small"
            round="xsmall"
        >
            {reclaimablePositions.map((reclaimablePosition) => {
                return (
                    <ReclaimablePositionItem
                        fundingGoal={fundingGoal}
                        recipientPayout={recipientPayout}
                        key={reclaimablePosition.positionId}
                        proposalId={proposalId}
                        collateralToken={collateralToken}
                        currentUser={currentUser}
                        reclaimablePosition={reclaimablePosition}
                        updateReclaimableTokens={updateReclaimableTokens}
                    />
                )
            })}
        </Box>
    )
}

export default ReclaimTokenCard
