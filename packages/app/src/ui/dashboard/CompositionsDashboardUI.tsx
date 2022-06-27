import { ArrowSquareIn, Plus, TreeStructure } from 'phosphor-react'
import { Box, Heading, Spinner, Text } from 'grommet'
import CeramicStagehand, {
    StageNames,
} from '@cambrian/app/classes/CeramicStagehand'
import { useEffect, useState } from 'react'

import CompositionDashboardTile from './tiles/CompositionDashboardTile'
import CreateCompositionModal from './modals/CreateCompositionModal'
import DashboardLayout from '@cambrian/app/components/layout/DashboardLayout'
import DashboardUtilityButton from '@cambrian/app/components/buttons/DashboardUtilityButton'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import ImportCompositionModal from './modals/ImportCompositionModal'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

// TODO Catch Error on Load and display Retry Button
const CompositionsDashboardUI = () => {
    const { currentUser } = useCurrentUser()
    const [compositions, setCompositions] = useState<StringHashmap>()
    const [ceramicStagehand, setCeramicStagehand] = useState<CeramicStagehand>()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [showLoadCompositionModal, setShowLoadCompositionModal] =
        useState(false)
    const [showCreateCompositionModal, setShowCreateCompositionModal] =
        useState(false)

    const toggleShowLoadCompositionModal = () =>
        setShowLoadCompositionModal(!showLoadCompositionModal)
    const toggleShowCreateCompositionModal = () =>
        setShowCreateCompositionModal(!showCreateCompositionModal)

    useEffect(() => {
        if (currentUser) {
            const ceramicStagehandInstance = new CeramicStagehand(
                currentUser.selfID
            )
            setCeramicStagehand(ceramicStagehandInstance)
            fetchCompositions(ceramicStagehandInstance)
        }
    }, [currentUser])

    const fetchCompositions = async (cs: CeramicStagehand) => {
        try {
            const compositionStreams = (await cs.loadStages(
                StageNames.composition
            )) as StringHashmap
            setCompositions(compositionStreams)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
    }

    const onDeleteComposition = async (compositionID: string) => {
        if (ceramicStagehand) {
            try {
                await ceramicStagehand.deleteStream(
                    compositionID,
                    StageNames.composition
                )
                const updatedCompositions = { ...compositions }
                delete updatedCompositions[compositionID]
                setCompositions(updatedCompositions)
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        }
    }

    return (
        <>
            <DashboardLayout contextTitle="Dashboard">
                <Box fill pad={{ top: 'medium' }}>
                    <Box height={{ min: 'auto' }}>
                        <Box pad="medium">
                            <Heading level="2">Composition Management</Heading>
                        </Box>
                        <Box direction="row" height={{ min: 'auto' }} wrap>
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
                        <Box
                            pad={{
                                left: 'medium',
                                right: 'large',
                                vertical: 'medium',
                            }}
                            gap="medium"
                        >
                            <Heading level="4">Recently viewed</Heading>
                            <PlainSectionDivider />
                        </Box>
                    </Box>
                    {compositions && ceramicStagehand ? (
                        <Box direction="row" wrap height={{ min: 'auto' }}>
                            {Object.keys(compositions).map((compositionID) => {
                                const streamID = compositions[compositionID]
                                return (
                                    <CompositionDashboardTile
                                        ceramicStagehand={ceramicStagehand}
                                        key={compositionID}
                                        compositionKey={compositionID}
                                        streamID={streamID}
                                        onDelete={() =>
                                            onDeleteComposition(compositionID)
                                        }
                                    />
                                )
                            })}
                        </Box>
                    ) : (
                        <Box fill justify="center" align="center" gap="medium">
                            <Spinner size="medium" />
                            <Text size="small" color="dark-4">
                                Loading Compositions...
                            </Text>
                        </Box>
                    )}
                    <Box pad="large" />
                </Box>
            </DashboardLayout>
            {showCreateCompositionModal && ceramicStagehand && (
                <CreateCompositionModal
                    ceramicStagehand={ceramicStagehand}
                    onClose={toggleShowCreateCompositionModal}
                />
            )}
            {showLoadCompositionModal && ceramicStagehand && (
                <ImportCompositionModal
                    ceramicStagehand={ceramicStagehand}
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
