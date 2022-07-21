import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import BasicProfileInfo from '@cambrian/app/components/info/BasicProfileInfo'
import { Box } from 'grommet'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import FlexInputInfo from '../FlexInputInfo'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import TemplateContentInfo from '../../templates/TemplateContentInfo'
import TemplatePricingInfo from '@cambrian/app/ui/templates/TemplatePricingInfo'

interface TemplateInfoModalProps {
    ceramicTemplate: CeramicTemplateModel
    onClose: () => void
}

const TemplateInfoModal = ({
    ceramicTemplate,
    onClose,
}: TemplateInfoModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <Box height={{ min: 'auto' }} gap="medium">
                <TemplateContentInfo template={ceramicTemplate} />
                <PlainSectionDivider />
                <TemplatePricingInfo template={ceramicTemplate} />
                <FlexInputInfo flexInputs={ceramicTemplate.flexInputs} />
                <PlainSectionDivider />
                <BasicProfileInfo did={ceramicTemplate.author} />
            </Box>
        </BaseLayerModal>
    )
}

export default TemplateInfoModal
