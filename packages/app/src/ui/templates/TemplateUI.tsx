import BasicProfileInfo from '../../components/info/BasicProfileInfo'
import { Box } from 'grommet'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import CreateProposalCTA from './CreateProposalCTA'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import TemplateContentInfo from './TemplateContentInfo'
import TemplateFlexInputInfo from './TemplateInfo'
import TemplatePricingInfo from '@cambrian/app/components/info/TemplatePricingInfo'
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
        <Box pad="large" height={{ min: '80vh' }} direction="row" wrap>
            <Box
                basis="1/3"
                pad={'large'}
                justify="center"
                height={{ max: '80vh' }}
                width={{ min: 'medium' }}
                gap="medium"
            >
                <BasicProfileInfo did={ceramicTemplate.author} />
                <CreateProposalCTA
                    currentUser={currentUser}
                    templateStreamID={templateStreamID}
                />
            </Box>
            <Box
                pad={{ left: 'large' }}
                basis="2/3"
                gap="medium"
                border={{ side: 'left' }}
            >
                <Box direction="row" align="start" wrap>
                    <TemplateContentInfo template={ceramicTemplate} />
                </Box>
                <PlainSectionDivider />
                <TemplatePricingInfo template={ceramicTemplate} />
                <TemplateFlexInputInfo template={ceramicTemplate} />
            </Box>
        </Box>
    )
}

export default TemplateUI
