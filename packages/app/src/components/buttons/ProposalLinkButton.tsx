import { ArrowUpRight } from 'phosphor-react'
import React from 'react'
import ResponsiveButton from './ResponsiveButton'
import { cpTheme } from '@cambrian/app/theme/theme'

interface IProposalLinkButton {
    proposalStreamID: string
}

const ProposalLinkButton = ({ proposalStreamID }: IProposalLinkButton) => {
    return (
        <ResponsiveButton
            label="Open Proposal"
            icon={<ArrowUpRight color={cpTheme.global.colors['dark-4']} />}
            href={`/solver/${proposalStreamID}`}
        />
    )
}

export default ProposalLinkButton
