import { BigNumber } from 'ethers'
import { Box } from 'grommet'
import ReclaimablePositionItem from './ReclaimablePositionItem'
import { ReclaimablePositionType } from '@cambrian/app/utils/helpers/redeemHelper'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface ReclaimableTokenCardProps {
    proposalId: string
    solverAddress: string
    collateralToken: TokenModel
    fundingGoal: BigNumber
    reclaimablePositions: ReclaimablePositionType[]
    updateReclaimableTokens: () => Promise<void>
}

const ReclaimableTokenCard = ({
    proposalId,
    reclaimablePositions,
    collateralToken,
    fundingGoal,
    solverAddress,
    updateReclaimableTokens,
}: ReclaimableTokenCardProps) => {
    const { currentUser } = useCurrentUserContext()

    return (
        <Box
            border
            background={'background-contrast'}
            pad="small"
            round="xsmall"
        >
            {currentUser &&
                reclaimablePositions.map((reclaimablePosition) => {
                    return (
                        <ReclaimablePositionItem
                            proposalId={proposalId}
                            solverAddress={solverAddress}
                            fundingGoal={fundingGoal}
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

export default ReclaimableTokenCard
