import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import ReclaimableTokenCard from '@cambrian/app/components/cards/ReclaimableTokenCard'
import { ReclaimableTokensType } from '@cambrian/app/utils/helpers/redeemHelper'

interface ReclaimTokensModalProps {
    reclaimableTokens: ReclaimableTokensType
    onClose: () => void
    updateReclaimableTokens: () => Promise<void>
}

const ReclaimTokensModal = ({
    onClose,
    reclaimableTokens,
    updateReclaimableTokens,
}: ReclaimTokensModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <ModalHeader
                title="You have tokens to reclaim"
                description="Claim your escrow tokens to redeem them for payment."
            />
            <Box height={{ min: 'auto' }}>
                {Object.keys(reclaimableTokens.reclaimableSolvers).map(
                    (solverAddress) => (
                        <ReclaimableTokenCard
                            key={solverAddress}
                            fundingGoal={reclaimableTokens.totalFunding}
                            collateralToken={reclaimableTokens.collateralToken}
                            proposalId={reclaimableTokens.proposalId}
                            solverAddress={solverAddress}
                            reclaimablePositions={
                                reclaimableTokens.reclaimableSolvers[
                                    solverAddress
                                ]
                            }
                            updateReclaimableTokens={updateReclaimableTokens}
                        />
                    )
                )}
            </Box>
        </BaseLayerModal>
    )
}

export default ReclaimTokensModal
