import { Box } from 'grommet'
import InteractionLayout from '@cambrian/app/components/layout/InteractionLayout'
import TemplateActionbar from '@cambrian/app/components/bars/actionbars/TemplateActionbar'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplatePreview from './TemplatePreview'
import { TileDocument } from '@ceramicnetwork/stream-tile'

interface TemplateUIProps {
    templateStreamDoc: TileDocument<TemplateModel>
}

const TemplateUI = ({ templateStreamDoc }: TemplateUIProps) => (
    <InteractionLayout
        contextTitle={templateStreamDoc.content.title}
        actionBar={
            <TemplateActionbar
                isActive={templateStreamDoc.content.isActive || false}
                price={templateStreamDoc.content.price}
                templateStreamID={templateStreamDoc.id.toString()}
            />
        }
    >
        <Box height={{ min: '80vh' }}>
            <TemplatePreview
                template={templateStreamDoc.content}
                showConfiguration
            />
        </Box>
    </InteractionLayout>
)

export default TemplateUI
