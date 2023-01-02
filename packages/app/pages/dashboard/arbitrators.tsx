import { ArrowsClockwise, CircleDashed, Scales } from 'phosphor-react'
import { Box, Button, Heading, Tab, Tabs, Text } from 'grommet'
import {
    CAMBRIAN_LIB_NAME,
    ceramicInstance,
} from '@cambrian/app/services/ceramic/CeramicUtils'
import { useEffect, useState } from 'react'

import ArbitratorListItem from '@cambrian/app/components/list/ArbitratorListItem'
import CreateArbitratorModal from '@cambrian/app/ui/dashboard/modals/CreateArbitratorModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'

export default function ArbitratorsDashboardPage() {
    const { currentUser } = useCurrentUserContext()
    const { showAndLogError } = useErrorContext()
    const [arbitratorContracts, setArbitratorContracts] =
        useState<{ [address: string]: number }>()
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
        if (currentUser?.did) {
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
                showAndLogError(e)
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
        </>
    )
}
