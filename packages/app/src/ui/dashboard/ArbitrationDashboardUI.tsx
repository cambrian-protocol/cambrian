import { ArrowsClockwise, Scales } from 'phosphor-react'
import { Box, Button, Text } from 'grommet'
import {
    CAMBRIAN_LIB_NAME,
    ceramicInstance,
} from '@cambrian/app/services/ceramic/CeramicUtils'
import { useEffect, useState } from 'react'

import ArbitratorListItem from '@cambrian/app/components/list/ArbitratorListItem'
import CreateArbitratorModal from './modals/CreateArbitratorModal'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import ListSkeleton from '@cambrian/app/components/skeletons/ListSkeleton'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface ArbitrationDashboardUIProps {
    currentUser: UserType
}

const ArbitrationDashboardUI = ({
    currentUser,
}: ArbitrationDashboardUIProps) => {
    const [arbitratorContracts, setArbitratorContracts] =
        useState<{ [address: string]: number }>()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isFetching, setIsFetching] = useState(false)

    const [showCreateArbitrator, setShowCreateArbitrator] = useState(false)

    const toggleShowCreateArbitrator = () => {
        if (showCreateArbitrator) {
            fetchArbitratorContracts()
        }
        setShowCreateArbitrator(!showCreateArbitrator)
    }

    useEffect(() => {
        fetchArbitratorContracts()
    }, [currentUser])

    const fetchArbitratorContracts = async () => {
        setIsFetching(true)
        if (currentUser) {
            try {
                const arbitratorLib = (await TileDocument.deterministic(
                    ceramicInstance(currentUser),
                    {
                        controllers: [currentUser.did],
                        family: CAMBRIAN_LIB_NAME,
                        tags: ['arbitrators'],
                    },
                    { pin: true }
                )) as TileDocument<{ [address: string]: number }>
                if (arbitratorLib.content) {
                    setArbitratorContracts(arbitratorLib.content)
                }
            } catch (e) {
                setErrorMessage(await cpLogger.push(e))
            }
        }
        setIsFetching(false)
    }

    return (
        <>
            <Box fill pad={{ top: 'medium' }} gap="medium">
                <DashboardHeader
                    title="Arbitration Management"
                    description="Create and distribute your arbitrator contracts here"
                    controls={[
                        <Button
                            secondary
                            size="small"
                            label="New Arbitrator Contract"
                            icon={<Scales />}
                            onClick={toggleShowCreateArbitrator}
                        />,
                        <LoaderButton
                            secondary
                            isLoading={isFetching}
                            icon={<ArrowsClockwise />}
                            onClick={fetchArbitratorContracts}
                        />,
                    ]}
                />
                <Box fill>
                    <Text color={'dark-4'}>
                        Your arbitrator contracts (
                        {arbitratorContracts
                            ? Object.keys(arbitratorContracts).length
                            : 0}
                        )
                    </Text>
                    <Box pad={{ top: 'medium' }}>
                        {arbitratorContracts &&
                        Object.keys(arbitratorContracts).length > 0 ? (
                            <Box gap="small">
                                {Object.keys(arbitratorContracts).map(
                                    (arbitratorContract) => (
                                        <ArbitratorListItem
                                            key={arbitratorContract}
                                            address={arbitratorContract}
                                            fee={
                                                arbitratorContracts[
                                                    arbitratorContract
                                                ]
                                            }
                                        />
                                    )
                                )}
                            </Box>
                        ) : (
                            <ListSkeleton
                                isFetching={isFetching}
                                subject="arbitrator contracts"
                            />
                        )}
                    </Box>
                </Box>
                <Box pad="large" />
            </Box>
            {showCreateArbitrator && (
                <CreateArbitratorModal
                    currentUser={currentUser}
                    onClose={toggleShowCreateArbitrator}
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

export default ArbitrationDashboardUI