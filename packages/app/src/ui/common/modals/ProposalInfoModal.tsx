import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import CambrianProfileInfo from '@cambrian/app/components/info/CambrianProfileInfo'
import { ClipboardText } from 'phosphor-react'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import FlexInputInfo from '../FlexInputInfo'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import PriceInfo from '@cambrian/app/components/info/PriceInfo'
import ProposalContentInfo from '../../proposals/ProposalContentInfo'
import { ProposalStackType } from '@cambrian/app/store/ProposalContext'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface ProposalInfoModalProps {
    onClose: () => void
    proposalStack: ProposalStackType
}

const ProposalInfoModal = ({
    onClose,
    proposalStack,
}: ProposalInfoModalProps) => {
    const { currentUser } = useCurrentUserContext()
    const [collateralToken, setCollateralToken] = useState<TokenModel>()
    const [proposerProfile] = useCambrianProfile(
        proposalStack.proposalDoc.content.author
    )

    useEffect(() => {
        initCollateralToken()
    }, [currentUser])

    const initCollateralToken = async () => {
        if (currentUser) {
            const ct = await fetchTokenInfo(
                proposalStack.proposalDoc.content.price.tokenAddress,
                currentUser.web3Provider
            )
            if (ct) setCollateralToken(ct)
        }
    }

    return (
        <BaseLayerModal onClose={onClose}>
            <Box height={{ min: 'auto' }}>
                <ModalHeader
                    title="Proposal Info"
                    description="Details about the proposal, the price, settings and the creator"
                    icon={<ClipboardText />}
                />
                <Box border gap="medium" pad="medium" round="xsmall">
                    <CambrianProfileInfo
                        cambrianProfile={proposerProfile}
                        size={'small'}
                        hideDetails
                    />
                    <PlainSectionDivider />
                    <ProposalContentInfo
                        proposal={proposalStack.proposalDoc.content}
                    />
                    <PlainSectionDivider />
                    <PriceInfo
                        amount={proposalStack.proposalDoc.content.price.amount}
                        label="Proposed Price"
                        token={collateralToken}
                    />
                    <FlexInputInfo
                        flexInputs={
                            proposalStack.proposalDoc.content.flexInputs
                        }
                        composition={proposalStack.compositionDoc.content}
                    />
                    <PlainSectionDivider />
                    <CambrianProfileInfo cambrianProfile={proposerProfile} />
                </Box>
            </Box>
        </BaseLayerModal>
    )
}

export default ProposalInfoModal
