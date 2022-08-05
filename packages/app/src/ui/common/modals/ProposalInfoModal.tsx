import { useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import BasicProfileInfo from '@cambrian/app/components/info/BasicProfileInfo'
import { Box } from 'grommet'
import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { ClipboardText } from 'phosphor-react'
import FlexInputInfo from '../FlexInputInfo'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import PriceInfo from '@cambrian/app/components/info/PriceInfo'
import ProposalContentInfo from '../../proposals/ProposalContentInfo'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface ProposalInfoModalProps {
    onClose: () => void
    ceramicProposal: CeramicProposalModel
}

const ProposalInfoModal = ({
    onClose,
    ceramicProposal,
}: ProposalInfoModalProps) => {
    const { currentUser } = useCurrentUserContext()
    const [collateralToken, setCollateralToken] = useState<TokenModel>()

    useEffect(() => {
        initCollateralToken()
    }, [currentUser])

    const initCollateralToken = async () => {
        if (currentUser) {
            const ct = await fetchTokenInfo(
                ceramicProposal.price.tokenAddress,
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
                    <BasicProfileInfo
                        did={ceramicProposal.author}
                        size={'small'}
                        hideDetails
                    />
                    <PlainSectionDivider />
                    <ProposalContentInfo proposal={ceramicProposal} />
                    <PlainSectionDivider />
                    <PriceInfo
                        amount={ceramicProposal.price.amount}
                        label="Proposed Price"
                        token={collateralToken}
                    />
                    <FlexInputInfo flexInputs={ceramicProposal.flexInputs} />
                    <PlainSectionDivider />
                    <BasicProfileInfo did={ceramicProposal.author} />
                </Box>
            </Box>
        </BaseLayerModal>
    )
}

export default ProposalInfoModal
