import {
    PayoutInfo,
    ReclaimableTokensType,
} from '@cambrian/app/utils/helpers/redeemHelper'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import ClaimItem from '@cambrian/app/components/list/ClaimItem'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import ReclaimTokenCard from '@cambrian/app/components/cards/ReclaimTokenCard'
import { UserType } from '@cambrian/app/store/UserContext'

export interface ReclaimTokensModalProps {
    reclaimableTokens: ReclaimableTokensType
    onClose: () => void
    updateReclaimableTokens: () => Promise<void>
    currentUser: UserType
    recipientPayout?: PayoutInfo
}

const ReclaimTokensModal = ({
    onClose,
    reclaimableTokens,
    updateReclaimableTokens,
    recipientPayout,
    currentUser,
}: ReclaimTokensModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <ModalHeader
                title="Refunds"
                description="Claim your escrow tokens to redeem them for payment."
            />
            <Box height={{ min: 'auto' }} gap="medium">
                <ClaimItem
                    amount={reclaimableTokens.totalFunding}
                    collateralToken={reclaimableTokens.collateralToken}
                    descriptions={[`This Proposal has been funded with: `]}
                    title="Total funds to distribute"
                />
                {Object.keys(reclaimableTokens.reclaimableSolvers).map(
                    (solverAddress) => (
                        <ReclaimTokenCard
                            key={solverAddress}
                            fundingGoal={reclaimableTokens.totalFunding}
                            currentUser={currentUser}
                            recipientPayout={recipientPayout}
                            collateralToken={reclaimableTokens.collateralToken}
                            proposalId={reclaimableTokens.proposalId}
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
