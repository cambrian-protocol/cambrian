import { Box, Heading, Text } from 'grommet'
import { useEffect, useState } from 'react'

import BaseHeader from '@cambrian/app/components/layout/header/BaseHeader'
import CambrianProfileAbout from '@cambrian/app/components/info/CambrianProfileAbout'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import PriceInfo from '@cambrian/app/components/info/PriceInfo'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplateSkeleton from '@cambrian/app/components/skeletons/TemplateSkeleton'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { loadCommitWorkaround } from '@cambrian/app/services/ceramic/CeramicUtils'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface TemplatePreviewProps {
    template: TemplateModel
}

const TemplatePreview = ({ template }: TemplatePreviewProps) => {
    const { currentUser } = useCurrentUserContext()
    const [templaterProfile] = useCambrianProfile(template.author)
    const [composition, setComposition] = useState<CompositionModel>()
    const [denominationToken, setDenominationToken] = useState<TokenModel>()
    useEffect(() => {
        if (currentUser) init(currentUser)
    }, [currentUser])

    const init = async (currentUser: UserType) => {
        const _compositionDoc = await loadCommitWorkaround<CompositionModel>(
            template.composition.commitID
        )
        if (_compositionDoc.content && _compositionDoc.content.solvers) {
            setComposition(_compositionDoc.content)
        }

        setDenominationToken(
            await fetchTokenInfo(
                template.price.denominationTokenAddress,
                currentUser.signer
            )
        )
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
                    <PriceInfo
                        label="Price"
                        amount={template.price.amount}
                        token={denominationToken}
                    />
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
