import { ArrowsClockwise, CircleDashed, Scales } from 'phosphor-react'
import { Box, Button, Heading, Tab, Tabs, Text } from 'grommet'
import { useEffect, useState } from 'react'

import ArbitratorListItem from '@cambrian/app/components/list/ArbitratorListItem'
import { CAMBRIAN_LIB_NAME } from '@cambrian/app/classes/CeramicStagehand'
import CreateArbitratorModal from '@cambrian/app/ui/dashboard/modals/CreateArbitratorModal'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

export default function ArbitratorsDashboardPage() {
    const { currentUser } = useCurrentUserContext()
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
                    currentUser.ceramic,
                    {
                        controllers: [
                            currentUser.ceramic.did?.id.toString() || '',
                        ],
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
            <PageLayout contextTitle="Arbitrators" kind="narrow">
                <Box fill pad={{ top: 'large' }}>
                    <Box
                        height={{ min: 'auto' }}
                        direction="row"
                        justify="between"
                        align="center"
                        pad="large"
                        wrap
                    >
                        <Box>
                            <Heading level="2">Arbitrators Management</Heading>
                            <Text color="dark-4">
                                Create and distribute your arbitrator contracts
                                here
                            </Text>
                        </Box>
                        <Box
                            direction="row"
                            gap="small"
                            pad={{ vertical: 'small' }}
                        >
                            <Button
                                secondary
                                size="small"
                                label="New Arbitrator Contract"
                                icon={<Scales />}
                                onClick={toggleShowCreateArbitrator}
                            />
                            <LoaderButton
                                secondary
                                isLoading={isFetching}
                                icon={<ArrowsClockwise />}
                                onClick={fetchArbitratorContracts}
                            />
                        </Box>
                    </Box>
                    <Box fill pad={'large'}>
                        <Tabs alignControls="start">
                            <Tab
                                title={`Your Arbitrator Contracts (${
                                    arbitratorContracts
                                        ? Object.keys(arbitratorContracts)
                                              .length
                                        : 0
                                })`}
                            >
                                <Box pad={{ top: 'medium' }}>
                                    {arbitratorContracts &&
                                    Object.keys(arbitratorContracts).length >
                                        0 ? (
                                        <Box gap="small">
                                            {Object.keys(
                                                arbitratorContracts
                                            ).map((arbitratorContract) => (
                                                <ArbitratorListItem
                                                    key={arbitratorContract}
                                                    address={arbitratorContract}
                                                    fee={
                                                        arbitratorContracts[
                                                            arbitratorContract
                                                        ]
                                                    }
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box
                                            border
                                            fill
                                            justify="center"
                                            align="center"
                                            gap="medium"
                                            pad="large"
                                            round="xsmall"
                                        >
                                            <CircleDashed size="32" />
                                            <Text size="small" color="dark-4">
                                                You don't have any arbitrator
                                                contracts yet
                                            </Text>
                                        </Box>
                                    )}
                                </Box>
                            </Tab>
                        </Tabs>
                    </Box>
                    <Box pad="large" />
                </Box>
            </PageLayout>
            {showCreateArbitrator && currentUser && (
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
