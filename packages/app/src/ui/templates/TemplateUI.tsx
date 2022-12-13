import { Box, Text } from 'grommet'
import { FilmScript, ListNumbers } from 'phosphor-react'
import { useEffect, useState } from 'react'

import BaseHeader from '@cambrian/app/components/layout/header/BaseHeader'
import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import DropButtonListItem from '@cambrian/app/components/list/DropButtonListItem'
import InteractionLayout from '@cambrian/app/components/layout/InteractionLayout'
import { ResponsiveButtonProps } from '@cambrian/app/components/buttons/ResponsiveButton'
import SolverInfoModal from '../common/modals/SolverInfoModal'
import TemplateActionbar from '@cambrian/app/components/bars/actionbars/TemplateActionbar'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import TemplatePreview from './TemplatePreview'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { TokenAPI } from '@cambrian/app/services/api/Token.api'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpTheme } from '@cambrian/app/theme/theme'
import { loadCommitWorkaround } from '@cambrian/app/services/ceramic/CeramicUtils'
import { mergeFlexIntoComposition } from '@cambrian/app/utils/helpers/flexInputHelpers'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface TemplateUIProps {
    templateStreamDoc: TileDocument<TemplateModel>
}

const TemplateUI = ({ templateStreamDoc }: TemplateUIProps) => {
    const { currentUser } = useCurrentUserContext()
    const [headerItems, setHeaderItems] = useState<ResponsiveButtonProps[]>()
    const [templaterProfile] = useCambrianProfile(
        templateStreamDoc.content.author
    )
    const [composition, setComposition] = useState<CompositionModel>()
    const [collateralToken, setCollateralToken] = useState<TokenModel>()
    const [showSolverConfigModal, setShowSolverConfigModal] = useState<number>() // Solver Index

    useEffect(() => {
        if (currentUser) init(currentUser)
    }, [currentUser])

    const init = async (currentUser: UserType) => {
        let items: ResponsiveButtonProps[] = []
        const _compositionDoc = await loadCommitWorkaround<CompositionModel>(
            templateStreamDoc.content.composition.commitID
        )
        if (_compositionDoc.content && _compositionDoc.content.solvers) {
            const mergedComposition = mergeFlexIntoComposition(
                _compositionDoc.content,
                templateStreamDoc.content.flexInputs
            )

            items.push({
                label: 'Solver Configurations',
                dropContent: (
                    <Box>
                        {mergedComposition?.solvers.map((solver, idx) => (
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

        setHeaderItems(items)

        setCollateralToken(
            await TokenAPI.getTokenInfo(
                templateStreamDoc.content.price.denominationTokenAddress,
                currentUser.web3Provider,
                currentUser.chainId
            )
        )
    }
    return (
        <>
            <InteractionLayout
                contextTitle={templateStreamDoc.content.title}
                header={
                    <BaseHeader
                        title={templateStreamDoc.content.title}
                        metaTitle="Template Solver"
                        authorProfileDoc={templaterProfile}
                        items={headerItems}
                    />
                }
                actionBar={
                    <TemplateActionbar
                        collateralToken={collateralToken}
                        isActive={templateStreamDoc.content.isActive || false}
                        price={templateStreamDoc.content.price}
                        templateStreamID={templateStreamDoc.id.toString()}
                    />
                }
            >
                <Box height={{ min: '80vh' }}>
                    <TemplatePreview
                        template={templateStreamDoc.content}
                        collateralToken={collateralToken}
                        templaterProfile={templaterProfile}
                    />
                </Box>
            </InteractionLayout>
            {showSolverConfigModal !== undefined && composition && (
                <SolverInfoModal
                    onClose={() => setShowSolverConfigModal(undefined)}
                    composition={composition}
                    composerSolver={composition.solvers[showSolverConfigModal]}
                    price={{
                        amount: templateStreamDoc.content.price.amount,
                        token: collateralToken,
                    }}
                />
            )}
        </>
    )
}

export default TemplateUI
