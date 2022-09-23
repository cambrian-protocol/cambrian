import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import CambrianProfileInfo from '@cambrian/app/components/info/CambrianProfileInfo'
import { File } from 'phosphor-react'
import FlexInputInfo from '../FlexInputInfo'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { StageStackType } from '../../dashboard/ProposalsDashboardUI'
import TemplateContentInfo from '../../templates/TemplateContentInfo'
import TemplatePricingInfo from '@cambrian/app/ui/templates/TemplatePricingInfo'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface TemplateInfoModalProps {
    stageStack: StageStackType
    onClose: () => void
}

const TemplateInfoModal = ({ stageStack, onClose }: TemplateInfoModalProps) => {
    const [templaterProfile] = useCambrianProfile(stageStack.template.author)
    return (
        <BaseLayerModal onClose={onClose}>
            <Box height={{ min: 'auto' }}>
                <ModalHeader
                    title="Template Info"
                    description="Details about the template, the price, settings and the creator"
                    icon={<File />}
                />
                <Box border gap="medium" pad="medium" round="xsmall">
                    <CambrianProfileInfo
                        cambrianProfileDoc={templaterProfile}
                        size={'small'}
                        hideDetails
                    />
                    <PlainSectionDivider />
                    <TemplateContentInfo template={stageStack.template} />
                    <PlainSectionDivider />
                    <TemplatePricingInfo template={stageStack.template} />
                    <FlexInputInfo
                        flexInputs={stageStack.template.flexInputs}
                        composition={stageStack.composition}
                    />
                    <PlainSectionDivider />
                    <CambrianProfileInfo
                        cambrianProfileDoc={templaterProfile}
                    />
                </Box>
            </Box>
        </BaseLayerModal>
    )
}

export default TemplateInfoModal
