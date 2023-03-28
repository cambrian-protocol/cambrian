import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import FundProposalForm from '../forms/FundProposalForm'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import React from 'react'

interface IFundProposalModal {
    proposal: Proposal
    onClose: () => void
}

const FundProposalModal = ({ onClose, proposal }: IFundProposalModal) => {
    return (
        <BaseLayerModal onBack={onClose}>
            <ModalHeader
                title="Proposal funding"
                description={
                    'Your funding can be withdrawn until the Proposal has been executed'
                }
            />
            <Box height={{ min: 'auto' }}>
                {proposal.auth && (
                    <FundProposalForm
                        proposal={proposal}
                        currentUser={proposal.auth}
                    />
                )}
            </Box>
        </BaseLayerModal>
    )
}

export default FundProposalModal
