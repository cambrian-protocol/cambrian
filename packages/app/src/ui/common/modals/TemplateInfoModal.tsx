import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import BasicProfileInfo from '@cambrian/app/components/info/BasicProfileInfo'
import { Box } from 'grommet'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { File } from 'phosphor-react'
import FlexInputInfo from '../FlexInputInfo'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
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
            <Box height={{ min: 'auto' }}>
                <ModalHeader
                    title="Template Info"
                    description="Details about the template, the price, settings and the creator"
                    icon={<File />}
                />
                <Box border gap="medium" pad="medium" round="xsmall">
                    <BasicProfileInfo
                        did={ceramicTemplate.author}
                        size={'small'}
                        hideDetails
                    />
                    <PlainSectionDivider />
                    <TemplateContentInfo template={ceramicTemplate} />
                    <PlainSectionDivider />
                    <TemplatePricingInfo template={ceramicTemplate} />
                    <FlexInputInfo flexInputs={ceramicTemplate.flexInputs} />
                    <PlainSectionDivider />
                    <BasicProfileInfo did={ceramicTemplate.author} />
                </Box>
            </Box>
        </BaseLayerModal>
    )
}

export default TemplateInfoModal
