import {
    ArrowSquareIn,
    ArrowsClockwise,
    CircleDashed,
    Plus,
    TreeStructure,
} from 'phosphor-react'
import { Box, Heading, Text } from 'grommet'
import { useEffect, useState } from 'react'

import CeramicCompositionAPI from '@cambrian/app/services/ceramic/CeramicCompositionAPI'
import CompositionDashboardTile from './tiles/CompositionDashboardTile'
import CreateCompositionModal from './modals/CreateCompositionModal'
import DashboardUtilityButton from '@cambrian/app/components/buttons/DashboardUtilityButton'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import ImportCompositionModal from './modals/ImportCompositionModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface CompositionsDashboardUIProps {
    currentUser: UserType
}

const CompositionsDashboardUI = ({
    currentUser,
}: CompositionsDashboardUIProps) => {
    const ceramicCompositionAPI = new CeramicCompositionAPI(currentUser)

    const [compositions, setCompositions] = useState<StringHashmap>({})
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [showLoadCompositionModal, setShowLoadCompositionModal] =
        useState(false)
    const [showCreateCompositionModal, setShowCreateCompositionModal] =
        useState(false)
    const [isFetching, setIsFetching] = useState(false)

    const toggleShowLoadCompositionModal = () =>
        setShowLoadCompositionModal(!showLoadCompositionModal)
    const toggleShowCreateCompositionModal = () =>
        setShowCreateCompositionModal(!showCreateCompositionModal)

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        setIsFetching(true)
        try {
            const compositionLib =
                await ceramicCompositionAPI.loadCompositionLib()

            if (compositionLib.content && compositionLib.content.lib) {
                setCompositions(compositionLib.content.lib)
            } else {
                setCompositions({})
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsFetching(false)
    }

    const onDeleteComposition = async (compositionID: string) => {
        try {
            if (await ceramicCompositionAPI.archiveComposition(compositionID)) {
                const updatedCompositions = { ...compositions }
                delete updatedCompositions[compositionID]
                setCompositions(updatedCompositions)
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
    }

    return (
        <>
            <PageLayout kind="narrow" contextTitle="Compositions">
                <Box fill>
                    <Box height={{ min: 'auto' }}>
                        <Box pad="large">
                            <Heading level="2">Composition Management</Heading>
                            <Text color="dark-4">
                                Create, Import or Work on your compositions here
                            </Text>
                        </Box>
                        <Box
                            direction="row"
                            height={{ min: 'auto' }}
                            wrap
                            pad={{ horizontal: 'large' }}
                        >
                            <DashboardUtilityButton
                                label="New Composition"
                                primaryIcon={<TreeStructure />}
                                secondaryIcon={<Plus />}
                                onClick={toggleShowCreateCompositionModal}
                            />
                            <DashboardUtilityButton
                                label="Import composition"
                                primaryIcon={<ArrowSquareIn />}
                                onClick={toggleShowLoadCompositionModal}
                            />
                        </Box>
                        <Box pad={'large'} gap="small">
                            <Box
                                direction="row"
                                align="center"
                                justify="between"
                            >
                                <Heading level="4">Your Compositions</Heading>
                                <LoaderButton
                                    isLoading={isFetching}
                                    icon={<ArrowsClockwise />}
                                    onClick={() => {
                                        init()
                                    }}
                                />
                            </Box>
                            <PlainSectionDivider />
                        </Box>
                    </Box>
                    {compositions ? (
                        Object.keys(compositions).length > 0 ? (
                            <Box
                                direction="row"
                                wrap
                                height={{ min: 'auto' }}
                                pad={{ horizontal: 'medium' }}
                            >
                                {Object.keys(compositions).map((tag) => {
                                    const streamID = compositions[tag]
                                    return (
                                        <CompositionDashboardTile
                                            key={tag}
                                            compositionTag={tag}
                                            compositionStreamID={streamID}
                                            onDelete={() =>
                                                onDeleteComposition(tag)
                                            }
                                        />
                                    )
                                })}
                            </Box>
                        ) : (
                            <Box
                                fill
                                justify="center"
                                align="center"
                                gap="medium"
                            >
                                <CircleDashed size="32" />
                                <Text size="small" color="dark-4">
                                    You don't have any compositions yet
                                </Text>
                            </Box>
                        )
                    ) : (
                        <></>
                    )}
                    <Box pad="large" />
                </Box>
            </PageLayout>
            {showCreateCompositionModal && (
                <CreateCompositionModal
                    ceramicCompositionAPI={ceramicCompositionAPI}
                    onClose={toggleShowCreateCompositionModal}
                />
            )}
            {showLoadCompositionModal && (
                <ImportCompositionModal
                    ceramicCompositionAPI={ceramicCompositionAPI}
                    onClose={toggleShowLoadCompositionModal}
                />
            )}
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default CompositionsDashboardUI
