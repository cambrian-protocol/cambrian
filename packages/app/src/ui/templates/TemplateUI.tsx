import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import CambrianProfileInfo from '../../components/info/CambrianProfileInfo'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import CreateProposalCTA from './CreateProposalCTA'
import FlexInputInfo from '../common/FlexInputInfo'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import TemplateContentInfo from './TemplateContentInfo'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplatePricingInfo from '@cambrian/app/ui/templates/TemplatePricingInfo'
import TemplateSkeleton from '@cambrian/app/components/skeletons/TemplateSkeleton'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { loadCommitWorkaround } from '@cambrian/app/services/ceramic/CeramicUtils'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'

interface TemplateUIProps {
    templateStreamDoc: TileDocument<TemplateModel>
    currentUser: UserType
}

const TemplateUI = ({ templateStreamDoc, currentUser }: TemplateUIProps) => {
    const [templaterProfile] = useCambrianProfile(
        templateStreamDoc.content.author
    )
    const [composition, setComposition] = useState<CompositionModel>()

    useEffect(() => {
        fetchComposition()
    }, [])

    const fetchComposition = async () => {
        const _compositionDoc = await loadCommitWorkaround<CompositionModel>(
            currentUser,
            templateStreamDoc.content.composition.commitID
        )
        if (_compositionDoc.content && _compositionDoc.content.solvers) {
            setComposition(_compositionDoc.content)
        }
    }
    return (
        <PageLayout
            contextTitle={templateStreamDoc.content.title || 'Template'}
            kind="narrow"
        >
            <Box pad="large">
                <Box pad="large" height={{ min: '80vh' }} border round="xsmall">
                    {composition ? (
                        <Box justify="between" fill>
                            <Box gap="medium">
                                <CambrianProfileInfo
                                    cambrianProfileDoc={templaterProfile}
                                    hideDetails
                                    size="small"
                                />
                                <PlainSectionDivider />
                                <TemplateContentInfo
                                    template={templateStreamDoc.content}
                                />
                                <PlainSectionDivider />
                                <TemplatePricingInfo
                                    template={templateStreamDoc.content}
                                />
                                <FlexInputInfo
                                    composition={composition}
                                    flexInputs={
                                        templateStreamDoc.content.flexInputs
                                    }
                                />
                                <PlainSectionDivider />
                                <CambrianProfileInfo
                                    cambrianProfileDoc={templaterProfile}
                                />
                                <PlainSectionDivider />
                            </Box>
                            {templateStreamDoc.content.isActive && (
                                <CreateProposalCTA
                                    templateStreamID={templateStreamDoc.id.toString()}
                                />
                            )}
                        </Box>
                    ) : (
                        <TemplateSkeleton />
                    )}
                </Box>
            </Box>
        </PageLayout>
    )
}

export default TemplateUI
