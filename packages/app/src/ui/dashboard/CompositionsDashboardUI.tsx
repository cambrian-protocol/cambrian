import { ArrowSquareIn, Plus } from 'phosphor-react'
import { Box, Button, Text } from 'grommet'

import { BaseStageLibType } from '@cambrian/app/classes/stageLibs/BaseStageLib'
import CeramicCompositionAPI from '@cambrian/app/services/ceramic/CeramicCompositionAPI'
import CompositionDashboardTile from './tiles/CompositionDashboardTile'
import CreateCompositionModal from './modals/CreateCompositionModal'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import ImportCompositionModal from './modals/ImportCompositionModal'
import ListSkeleton from '@cambrian/app/components/skeletons/ListSkeleton'
import { UserType } from '@cambrian/app/store/UserContext'
import { useState } from 'react'

interface CompositionsDashboardUIProps {
    currentUser: UserType
    compositionsLib?: BaseStageLibType
    isFetching: boolean
}

const CompositionsDashboardUI = ({
    currentUser,
    compositionsLib,
    isFetching,
}: CompositionsDashboardUIProps) => {
    const ceramicCompositionAPI = new CeramicCompositionAPI(currentUser)

    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [showLoadCompositionModal, setShowLoadCompositionModal] =
        useState(false)
    const [showCreateCompositionModal, setShowCreateCompositionModal] =
        useState(false)

    const toggleShowLoadCompositionModal = () =>
        setShowLoadCompositionModal(!showLoadCompositionModal)
    const toggleShowCreateCompositionModal = () =>
        setShowCreateCompositionModal(!showCreateCompositionModal)

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
                    ]}
                />
                <Box fill>
                    <Text color={'dark-4'}>
                        Your Compositions (
                        {compositionsLib
                            ? Object.keys(compositionsLib.lib).length
                            : 0}
                        )
                    </Text>
                    <Box pad={{ top: 'medium' }}>
                        {compositionsLib?.lib &&
                        Object.keys(compositionsLib.lib).length > 0 ? (
                            <Box direction="row" wrap>
                                {Object.keys(compositionsLib.lib).map(
                                    (streamID) => {
                                        const title =
                                            compositionsLib.lib[streamID]
                                        return (
                                            <CompositionDashboardTile
                                                key={streamID}
                                                compositionTag={title}
                                                compositionStreamID={streamID}
                                                ceramicCompositionAPI={
                                                    ceramicCompositionAPI
                                                }
                                            />
                                        )
                                    }
                                )}
                            </Box>
                        ) : (
                            <ListSkeleton
                                isFetching={isFetching}
                                subject="Solver Compositions"
                            />
                        )}
                    </Box>
                </Box>
                <Box pad="large" />
            </Box>
            {showCreateCompositionModal && (
                <CreateCompositionModal
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
