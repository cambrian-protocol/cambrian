import { ArrowUpRight, FilmScript, ListNumbers } from 'phosphor-react'
import { Box, Heading, Text } from 'grommet'
import { useEffect, useState } from 'react'

import API from '@cambrian/app/services/api/cambrian.api'
import BaseHeader from '@cambrian/app/components/layout/header/BaseHeader'
import CambrianProfileAbout from '@cambrian/app/components/info/CambrianProfileAbout'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import DropButtonListItem from '@cambrian/app/components/list/DropButtonListItem'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import PriceInfo from '@cambrian/app/components/info/PriceInfo'
import { ResponsiveButtonProps } from '@cambrian/app/components/buttons/ResponsiveButton'
import SolverInfoModal from '../common/modals/SolverInfoModal'
import Template from '@cambrian/app/classes/stages/Template'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpTheme } from '@cambrian/app/theme/theme'
import { mergeFlexIntoComposition } from '@cambrian/app/utils/helpers/flexInputHelpers'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface TemplatePreviewProps {
    template: Template
    showLinkToTemplate?: boolean
    showConfiguration?: boolean
}

const TemplatePreview = ({
    template,
    showLinkToTemplate,
    showConfiguration,
}: TemplatePreviewProps) => {
    const { currentUser } = useCurrentUserContext()
    const [templaterProfile] = useCambrianProfile(template?.content.author)
    const [composition, setComposition] = useState<CompositionModel>()
    const [showSolverConfigModal, setShowSolverConfigModal] = useState<number>() // Solver Index
    const [headerItems, setHeaderItems] = useState<ResponsiveButtonProps[]>()

    useEffect(() => {
        if (currentUser) init(currentUser)
    }, [currentUser])

    const init = async (currentUser: UserType) => {
        let items: ResponsiveButtonProps[] = []
        if (showConfiguration) {
            const _compositionDoc = await API.doc.readCommit<CompositionModel>(
                template.content.composition.streamID,
                template.content.composition.commitID
            )

            if (!_compositionDoc) throw new Error('Failed to load Composition')

            const mergedComposition = mergeFlexIntoComposition(
                _compositionDoc.content,
                template.content.flexInputs
            )

            items.push({
                label: 'Solver Configurations',
                dropContent: (
                    <Box>
                        {mergedComposition.solvers.map((solver, idx) => (
                            <DropButtonListItem
                                key={idx}
                                label={
                                    <Box width="medium">
                                        <Text>{solver.solverTag.title}</Text>
                                        <Text
                                            size="xsmall"
                                            color="dark-4"
                                            truncate
                                        >
                                            {solver.solverTag.description}
                                        </Text>
                                    </Box>
                                }
                                icon={<FilmScript />}
                                onClick={() => setShowSolverConfigModal(idx)}
                            />
                        ))}
                    </Box>
                ),
                dropAlign: {
                    top: 'bottom',
                    right: 'right',
                },
                dropProps: {
                    round: {
                        corner: 'bottom',
                        size: 'xsmall',
                    },
                },
                icon: <ListNumbers color={cpTheme.global.colors['dark-4']} />,
            })
            setComposition(mergedComposition)
        }

        if (showLinkToTemplate) {
            items.push({
                label: 'Open Template',
                icon: <ArrowUpRight color={cpTheme.global.colors['dark-4']} />,
                href: `/solver/${template.doc.streamID}`,
            })
        }

        setHeaderItems(items)
    }

    return (
        <>
            <Box gap="medium">
                <BaseHeader
                    title={template.content.title}
                    metaTitle="Template Solver"
                    authorProfileDoc={templaterProfile}
                    items={headerItems}
                />
                <Box gap="small">
                    <Heading level="3">Project details</Heading>
                    <Text style={{ whiteSpace: 'pre-line' }}>
                        {template.content.description}
                    </Text>
                </Box>
                {template.content.requirements.length > 0 && (
                    <Box gap="small">
                        <Heading level="4">Requirements</Heading>
                        <Text color="dark-4" style={{ whiteSpace: 'pre-line' }}>
                            {template.content.requirements}
                        </Text>
                    </Box>
                )}
                <PlainSectionDivider />
                <PriceInfo
                    label="Price"
                    amount={template.content.price.amount || 0}
                    token={template.denominationToken}
                    allowAnyPaymentToken={
                        template.content.price.allowAnyPaymentToken
                    }
                    preferredTokens={template.content.price.preferredTokens}
                />
                <PlainSectionDivider />
                {templaterProfile && (
                    <Box gap="small">
                        <Heading level="4">About the author</Heading>
                        <CambrianProfileAbout
                            cambrianProfile={templaterProfile}
                        />
                    </Box>
                )}
            </Box>
            {showSolverConfigModal !== undefined && composition && (
                <SolverInfoModal
                    onClose={() => setShowSolverConfigModal(undefined)}
                    composition={composition}
                    composerSolver={composition.solvers[showSolverConfigModal]}
                    price={{
                        amount: template.content.price.amount,
                        token: template.denominationToken,
                    }}
                />
            )}
        </>
    )
}

export default TemplatePreview
