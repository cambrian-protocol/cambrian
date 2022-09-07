import { Box } from 'grommet'
import CambrianProfileInfo from '../../components/info/CambrianProfileInfo'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateProposalCTA from './CreateProposalCTA'
import FlexInputInfo from '../common/FlexInputInfo'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import TemplateContentInfo from './TemplateContentInfo'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplatePricingInfo from '@cambrian/app/ui/templates/TemplatePricingInfo'
import TemplateSkeleton from '@cambrian/app/components/skeletons/TemplateSkeleton'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface TemplateUIProps {
    ceramicTemplate?: TemplateModel
    templateStreamID: string
    composition?: CompositionModel
}

const TemplateUI = ({
    ceramicTemplate,
    templateStreamID,
    composition,
}: TemplateUIProps) => {
    const [templaterProfile] = useCambrianProfile(ceramicTemplate?.author)
    return (
        <Box pad="large">
            <Box pad="large" height={{ min: '80vh' }} border round="xsmall">
                {ceramicTemplate && composition ? (
                    <Box justify="between" fill>
                        <Box gap="medium">
                            <CambrianProfileInfo
                                cambrianProfileDoc={templaterProfile}
                                hideDetails
                                size="small"
                            />
                            <PlainSectionDivider />
                            <TemplateContentInfo template={ceramicTemplate} />
                            <PlainSectionDivider />
                            <TemplatePricingInfo template={ceramicTemplate} />
                            <FlexInputInfo
                                composition={composition}
                                flexInputs={ceramicTemplate.flexInputs}
                            />
                            <PlainSectionDivider />
                            <CambrianProfileInfo
                                cambrianProfileDoc={templaterProfile}
                            />
                            <PlainSectionDivider />
                        </Box>
                        {ceramicTemplate?.isActive && (
                            <CreateProposalCTA
                                templateStreamID={templateStreamID}
                            />
                        )}
                    </Box>
                ) : (
                    <TemplateSkeleton />
                )}
            </Box>
        </Box>
    )
}

export default TemplateUI
