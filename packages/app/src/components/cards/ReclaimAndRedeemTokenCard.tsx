import { Box } from 'grommet'
import ReclaimAndRedeemPositionItem from './ReclaimAndRedeemPositionItem'
import { ReclaimTokenCardProps } from './ReclaimTokenCard'
import { SolverModel } from '@cambrian/app/models/SolverModel'

interface ReclaimAndRedeemTokenCardProps extends ReclaimTokenCardProps {
    solverData: SolverModel
}

const ReclaimAndRedeemTokenCard = ({
    proposalId,
    reclaimablePositions,
    collateralToken,
    fundingGoal,
    updateReclaimableTokens,
    solverData,
    currentUser,
}: ReclaimAndRedeemTokenCardProps) => {
    return (
        <>
            <Box
                border
                background={'background-contrast'}
                pad="small"
                round="xsmall"
            >
                {reclaimablePositions.map((reclaimablePosition) => {
                    const currentCondition = solverData.conditions.find(
                        (condition) =>
                            condition.conditionId ===
                            reclaimablePosition.conditionId
                    )
                    if (currentCondition) {
                        return (
                            <ReclaimAndRedeemPositionItem
                                key={reclaimablePosition.positionId}
                                proposalId={proposalId}
                                fundingGoal={fundingGoal}
                                collateralToken={collateralToken}
                                currentUser={currentUser}
                                reclaimablePosition={reclaimablePosition}
                                updateReclaimableTokens={
                                    updateReclaimableTokens
                                }
                                solverData={solverData}
                                currentCondition={currentCondition}
                            />
                        )
                    }
                })}
            </Box>
        </>
    )
}

export default ReclaimAndRedeemTokenCard
