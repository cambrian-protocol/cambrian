import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import ClaimItem from '@cambrian/app/components/list/ClaimItem'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import ReclaimAndRedeemTokenCard from '@cambrian/app/components/cards/ReclaimAndRedeemTokenCard'
import { ReclaimableTokensType } from '@cambrian/app/utils/helpers/redeemHelper'
import { SolverInfoType } from '@cambrian/app/components/bars/actionbars/proposal/general/ExecutedBar'
import { UserType } from '@cambrian/app/store/UserContext'

interface ReclaimAndRedeemTokensModalProps {
    reclaimableTokens: ReclaimableTokensType
    onClose: () => void
    updateReclaimableTokens: () => Promise<void>
    currentUser: UserType
    solverInfos: SolverInfoType[]
}

const ReclaimAndRedeemTokensModal = ({
    solverInfos,
    currentUser,
    updateReclaimableTokens,
    onClose,
    reclaimableTokens,
}: ReclaimAndRedeemTokensModalProps) => {
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
                    (solverAddress) => {
                        const solverData = solverInfos.find(
                            (info) => info.address === solverAddress
                        )

                        if (solverData) {
                            return (
                                <ReclaimAndRedeemTokenCard
                                    key={solverAddress}
                                    currentUser={currentUser}
                                    fundingGoal={reclaimableTokens.totalFunding}
                                    collateralToken={
                                        reclaimableTokens.collateralToken
                                    }
                                    proposalId={reclaimableTokens.proposalId}
                                    reclaimablePositions={
                                        reclaimableTokens.reclaimableSolvers[
                                            solverAddress
                                        ]
                                    }
                                    updateReclaimableTokens={
                                        updateReclaimableTokens
                                    }
                                    solverData={solverData.data}
                                />
                            )
                        }
                    }
                )}
            </Box>
        </BaseLayerModal>
    )
}

export default ReclaimAndRedeemTokensModal
