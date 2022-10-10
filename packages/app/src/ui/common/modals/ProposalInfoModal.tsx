import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import CambrianProfileInfo from '@cambrian/app/components/info/CambrianProfileInfo'
import { ClipboardText } from 'phosphor-react'
import FlexInputInfo from '../FlexInputInfo'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import PriceInfo from '@cambrian/app/components/info/PriceInfo'
import ProposalContentInfo from '../../proposals/ProposalContentInfo'
import { StageStackType } from '../../dashboard/ProposalsDashboardUI'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface ProposalInfoModalProps {
    onClose: () => void
    stageStack: StageStackType
}

const ProposalInfoModal = ({ onClose, stageStack }: ProposalInfoModalProps) => {
    const { currentUser } = useCurrentUserContext()
    const [collateralToken, setCollateralToken] = useState<TokenModel>()
    const [proposerProfile] = useCambrianProfile(stageStack.proposal.author)

    useEffect(() => {
        initCollateralToken()
    }, [currentUser])

    const initCollateralToken = async () => {
        if (currentUser) {
            const ct = await fetchTokenInfo(
                stageStack.proposal.price.tokenAddress,
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
                        cambrianProfileDoc={proposerProfile}
                        size={'small'}
                    />
                    <PlainSectionDivider />
                    <ProposalContentInfo proposal={stageStack.proposal} />
                    <PlainSectionDivider />
                    <PriceInfo
                        amount={stageStack.proposal.price.amount}
                        label="Proposed Price"
                        token={collateralToken}
                    />
                    <FlexInputInfo
                        flexInputs={stageStack.proposal.flexInputs}
                        composition={stageStack.composition}
                    />
                    <PlainSectionDivider />
                    <CambrianProfileInfo cambrianProfileDoc={proposerProfile} />
                </Box>
            </Box>
        </BaseLayerModal>
    )
}

export default ProposalInfoModal
