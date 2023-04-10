import React, { useState } from 'react'

import { ClipboardText } from 'phosphor-react'
import { DocumentModel } from '@cambrian/app/services/api/cambrian.api'
import ProposalInfoModal from '@cambrian/app/ui/common/modals/ProposalInfoModal'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import ResponsiveButton from './ResponsiveButton'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { cpTheme } from '@cambrian/app/theme/theme'

interface IProposalInfoButton {
    collateralToken: TokenModel
    proposalDoc: DocumentModel<ProposalModel>
}

const ProposalInfoButton = ({
    collateralToken,
    proposalDoc,
}: IProposalInfoButton) => {
    const [showProposalInfoModal, setShowProposalInfoModal] = useState(false)
    const toggleShowProposalInfoModal = () =>
        setShowProposalInfoModal(!showProposalInfoModal)

    return (
        <>
            <ResponsiveButton
                label="Proposal Details"
                icon={<ClipboardText color={cpTheme.global.colors['dark-4']} />}
                onClick={toggleShowProposalInfoModal}
            />
            {showProposalInfoModal && (
                <ProposalInfoModal
                    collateralToken={collateralToken}
                    proposalDoc={proposalDoc}
                    onClose={toggleShowProposalInfoModal}
                />
            )}
        </>
    )
}

export default ProposalInfoButton
