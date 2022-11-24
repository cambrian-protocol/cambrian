import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { PriceModel } from '@cambrian/app/components/bars/actionbars/proposal/ProposalReviewActionbar'
import ReclaimableTokenCard from '@cambrian/app/components/cards/ReclaimableTokenCard'
import { ReclaimableTokensType } from '@cambrian/app/utils/helpers/redeemHelper'

interface ReclaimTokensModalProps {
    reclaimableTokens: ReclaimableTokensType
    proposalPriceInfo: PriceModel
    onClose: () => void
    updateReclaimableTokens: () => Promise<void>
}

const ReclaimTokensModal = ({
    onClose,
    reclaimableTokens,
    proposalPriceInfo,
    updateReclaimableTokens,
}: ReclaimTokensModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <ModalHeader
                title="You have tokens to reclaim"
                description="Hit the reclaim button to receive your ERC1155 Tokens with which you can redeem your tokens."
            />
            <Box height={{ min: 'auto' }}>
                {Object.keys(reclaimableTokens.reclaimableSolvers).map(
                    (solverAddress) => (
                        <ReclaimableTokenCard
                            proposalPriceInfo={proposalPriceInfo}
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
