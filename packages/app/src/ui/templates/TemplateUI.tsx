import BasicProfileInfo from '../../components/info/BasicProfileInfo'
import { Box } from 'grommet'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import CreateProposalCTA from './CreateProposalCTA'
import FlexInputInfo from '../common/FlexInputInfo'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import TemplateContentInfo from './TemplateContentInfo'
import TemplatePricingInfo from '@cambrian/app/ui/templates/TemplatePricingInfo'
import { UserType } from '@cambrian/app/store/UserContext'

interface TemplateUIProps {
    ceramicTemplate: CeramicTemplateModel
    currentUser: UserType
    templateStreamID: string
}

const TemplateUI = ({
    ceramicTemplate,
    currentUser,
    templateStreamID,
}: TemplateUIProps) => {
    return (
        <Box pad="large" height={{ min: '80vh' }} gap="medium">
            <TemplateContentInfo template={ceramicTemplate} />
            <PlainSectionDivider />
            <TemplatePricingInfo template={ceramicTemplate} />
            <FlexInputInfo flexInputs={ceramicTemplate.flexInputs} />
            <PlainSectionDivider />
            <BasicProfileInfo did={ceramicTemplate.author} />
            <CreateProposalCTA
                currentUser={currentUser}
                templateStreamID={templateStreamID}
            />
        </Box>
    )
}

export default TemplateUI
