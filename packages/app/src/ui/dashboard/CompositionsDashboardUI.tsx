import { ArrowSquareIn, ArrowsClockwise, Plus } from 'phosphor-react'
import { Box, Button, Text } from 'grommet'
import { useEffect, useState } from 'react'

import CeramicCompositionAPI from '@cambrian/app/services/ceramic/CeramicCompositionAPI'
import CompositionDashboardTile from './tiles/CompositionDashboardTile'
import CreateCompositionModal from './modals/CreateCompositionModal'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import ImportCompositionModal from './modals/ImportCompositionModal'
import ListSkeleton from '@cambrian/app/components/skeletons/ListSkeleton'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { StringHashmap } from '@cambrian/app/models/UtilityModels'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { loadStagesLib } from '@cambrian/app/services/ceramic/CeramicUtils'

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
            const stagesLib = await loadStagesLib(currentUser)
            if (stagesLib.content && stagesLib.content.compositions) {
                setCompositions(stagesLib.content.compositions.lib)
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
            <Box fill gap="medium" pad={{ top: 'medium' }}>
                <DashboardHeader
                    title="Composition Management"
                    description="Create, import or work on your compositions here"
                    controls={[
                        <Button
                            secondary
                            size="small"
                            label="New Composition"
                            icon={<Plus />}
                            onClick={toggleShowCreateCompositionModal}
                        />,
                        <Button
                            secondary
                            size="small"
                            label="Import Composition"
                            icon={<ArrowSquareIn />}
                            onClick={toggleShowLoadCompositionModal}
                        />,
                        <LoaderButton
                            secondary
                            isLoading={isFetching}
                            icon={<ArrowsClockwise />}
                            onClick={() => {
                                init()
                            }}
                        />,
                    ]}
                />
                <Box fill>
                    <Text color={'dark-4'}>
                        Your Compositions ({Object.keys(compositions).length})
                    </Text>
                    <Box pad={{ top: 'medium' }}>
                        {compositions &&
                        Object.keys(compositions).length > 0 ? (
                            <Box direction="row" wrap>
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
                            <ListSkeleton
                                isFetching={isFetching}
                                subject="compositions"
                            />
                        )}
                    </Box>
                </Box>
                <Box pad="large" />
            </Box>
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
