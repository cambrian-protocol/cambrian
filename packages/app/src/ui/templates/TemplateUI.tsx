import { Box } from 'grommet'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import CreateProposalCTA from './CreateProposalCTA'
import TemplateInfo from './TemplateInfo'
import { UserType } from '@cambrian/app/store/UserContext'
import { usePublicRecord } from '@self.id/framework'

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
    const sellerBasicProfile = usePublicRecord(
        'basicProfile',
        ceramicTemplate.author
    )

    return (
        <Box
            pad="large"
            height={{ min: '90vh' }}
            justify="center"
            direction="row"
        >
            <TemplateInfo template={ceramicTemplate} />
            <Box pad={{ left: 'medium' }}>
                <Box border round="xsmall" pad="medium">
                    <CreateProposalCTA
                        currentUser={currentUser}
                        ceramicTemplate={ceramicTemplate}
                        templateStreamID={templateStreamID}
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default TemplateUI
