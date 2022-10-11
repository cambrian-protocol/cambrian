import { Box, Heading, Text } from 'grommet'
import { useEffect, useState } from 'react'

import BaseHeader from '@cambrian/app/components/layout/header/BaseHeader'
import CambrianProfileAbout from '@cambrian/app/components/info/CambrianProfileAbout'
import CambrianProfileInfo from '@cambrian/app/components/info/CambrianProfileInfo'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplateSkeleton from '@cambrian/app/components/skeletons/TemplateSkeleton'
import { loadCommitWorkaround } from '@cambrian/app/services/ceramic/CeramicUtils'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface TemplatePreviewProps {
    template: TemplateModel
}

const TemplatePreview = ({ template }: TemplatePreviewProps) => {
    const [templaterProfile] = useCambrianProfile(template.author)
    const [composition, setComposition] = useState<CompositionModel>()

    useEffect(() => {
        fetchComposition()
    }, [])

    const fetchComposition = async () => {
        const _compositionDoc = await loadCommitWorkaround<CompositionModel>(
            template.composition.commitID
        )
        if (_compositionDoc.content && _compositionDoc.content.solvers) {
            setComposition(_compositionDoc.content)
        }
    }

    return (
        <>
            {composition ? (
                <Box gap="medium">
                    <BaseHeader
                        title={template.title}
                        metaTitle="Template"
                        authorProfileDoc={templaterProfile}
                    />
                    <Box gap="small">
                        <Heading level="3">Project details</Heading>
                        <Text style={{ whiteSpace: 'pre-line' }}>
                            {template.description}
                        </Text>
                    </Box>
                    {template.requirements.length > 0 && (
                        <Box gap="small">
                            <Heading level="4">Requirements</Heading>
                            <Text
                                color="dark-4"
                                style={{ whiteSpace: 'pre-line' }}
                            >
                                {template.requirements}
                            </Text>
                        </Box>
                    )}
                    <PlainSectionDivider />
                    {templaterProfile && (
                        <CambrianProfileAbout
                            cambrianProfile={templaterProfile}
                        />
                    )}
                </Box>
            ) : (
                <TemplateSkeleton />
            )}
        </>
    )
}

export default TemplatePreview
