import BaseSkeletonBox from '@cambrian/app/components/skeletons/BaseSkeletonBox'
import { Box } from 'grommet'
import InteractionLayout from '@cambrian/app/components/layout/InteractionLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import TemplateActionbar from '@cambrian/app/components/bars/actionbars/TemplateActionbar'
import TemplateBody from './TemplateBody'
import TemplateHeader from '@cambrian/app/components/layout/header/TemplateHeader'
import { useTemplateContext } from '@cambrian/app/hooks/useTemplateContext'

const TemplateUI = () => {
    const { template } = useTemplateContext()

    return (
        <>
            {template ? (
                <InteractionLayout
                    contextTitle={template.content.title}
                    actionBar={<TemplateActionbar template={template} />}
                >
                    <Box height={{ min: '80vh' }} gap="medium">
                        <TemplateHeader template={template} />
                        <TemplateBody
                            templateContent={template.content}
                            denominationToken={template.denominationToken}
                        />
                    </Box>
                </InteractionLayout>
            ) : (
                <InteractionLayout contextTitle={'Loading...'}>
                    <Box gap="medium">
                        <BaseSkeletonBox height={'xsmall'} width={'50%'} />
                        <BaseSkeletonBox height={'xxsmall'} width={'100%'} />
                        <PlainSectionDivider />
                        <BaseSkeletonBox height={'medium'} width={'100%'} />
                    </Box>
                </InteractionLayout>
            )}
        </>
    )
}

export default TemplateUI
