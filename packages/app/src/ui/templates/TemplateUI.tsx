import BasicProfileInfo from '../../components/info/BasicProfileInfo'
import { Box } from 'grommet'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import CreateProposalCTA from './CreateProposalCTA'
import FlexInputInfo from '../common/FlexInputInfo'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import TemplateContentInfo from './TemplateContentInfo'
import TemplatePricingInfo from '@cambrian/app/ui/templates/TemplatePricingInfo'
import TemplateSkeleton from '@cambrian/app/components/skeletons/TemplateSkeleton'

interface TemplateUIProps {
    ceramicTemplate?: CeramicTemplateModel
    templateStreamID: string
}

const TemplateUI = ({ ceramicTemplate, templateStreamID }: TemplateUIProps) => (
    <Box pad="large">
        <Box pad="large" height={{ min: '80vh' }} border round="xsmall">
            {ceramicTemplate ? (
                <Box justify="between" fill>
                    <Box gap="medium">
                        <BasicProfileInfo
                            did={ceramicTemplate.author}
                            hideDetails
                            size="small"
                        />
                        <PlainSectionDivider />
                        <TemplateContentInfo template={ceramicTemplate} />
                        <PlainSectionDivider />
                        <TemplatePricingInfo template={ceramicTemplate} />
                        <FlexInputInfo
                            flexInputs={ceramicTemplate.flexInputs}
                        />
                        <PlainSectionDivider />
                        <BasicProfileInfo did={ceramicTemplate.author} />
                    </Box>
                    <CreateProposalCTA templateStreamID={templateStreamID} />
                </Box>
            ) : (
                <TemplateSkeleton />
            )}
        </Box>
    </Box>
)

export default TemplateUI
