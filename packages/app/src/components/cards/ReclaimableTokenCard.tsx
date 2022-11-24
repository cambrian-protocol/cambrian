import { Box } from 'grommet'
import { PriceModel } from '../bars/actionbars/proposal/ProposalReviewActionbar'
import ReclaimablePositionItem from './ReclaimablePositionItem'
import { ReclaimablePositionType } from '@cambrian/app/utils/helpers/redeemHelper'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface ReclaimableTokenCardProps {
    proposalId: string
    solverAddress: string
    proposalPriceInfo: PriceModel
    reclaimablePositions: ReclaimablePositionType[]
    updateReclaimableTokens: () => Promise<void>
}

const ReclaimableTokenCard = ({
    proposalId,
    reclaimablePositions,
    proposalPriceInfo,
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
                            currentUser={currentUser}
                            reclaimablePosition={reclaimablePosition}
                            proposalPriceInfo={proposalPriceInfo}
                            updateReclaimableTokens={updateReclaimableTokens}
                        />
                    )
                })}
        </Box>
    )
}

export default ReclaimableTokenCard
