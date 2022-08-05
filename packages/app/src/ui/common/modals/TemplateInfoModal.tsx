import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import CambrianProfileInfo from '@cambrian/app/components/info/CambrianProfileInfo'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { File } from 'phosphor-react'
import FlexInputInfo from '../FlexInputInfo'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import TemplateContentInfo from '../../templates/TemplateContentInfo'
import TemplatePricingInfo from '@cambrian/app/ui/templates/TemplatePricingInfo'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface TemplateInfoModalProps {
    ceramicTemplate: CeramicTemplateModel
    onClose: () => void
}

const TemplateInfoModal = ({
    ceramicTemplate,
    onClose,
}: TemplateInfoModalProps) => {
    const [templaterProfile] = useCambrianProfile(ceramicTemplate.author)

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
                        cambrianProfile={templaterProfile}
                        size={'small'}
                        hideDetails
                    />
                    <PlainSectionDivider />
                    <TemplateContentInfo template={ceramicTemplate} />
                    <PlainSectionDivider />
                    <TemplatePricingInfo template={ceramicTemplate} />
                    <FlexInputInfo flexInputs={ceramicTemplate.flexInputs} />
                    <PlainSectionDivider />
                    <CambrianProfileInfo cambrianProfile={templaterProfile} />
                </Box>
            </Box>
        </BaseLayerModal>
    )
}

export default TemplateInfoModal
