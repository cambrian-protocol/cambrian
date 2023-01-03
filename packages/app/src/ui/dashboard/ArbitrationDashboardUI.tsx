import { Box, Button, Text } from 'grommet'
import { useEffect, useState } from 'react'

import ArbitratorListItem from '@cambrian/app/components/list/ArbitratorListItem'
import CeramicArbitratorAPI from '@cambrian/app/services/ceramic/CeramicArbitratorAPI'
import CreateArbitratorModal from './modals/CreateArbitratorModal'
import DashboardHeader from '@cambrian/app/components/layout/header/DashboardHeader'
import ListSkeleton from '@cambrian/app/components/skeletons/ListSkeleton'
import { Scales } from 'phosphor-react'
import { UserType } from '@cambrian/app/store/UserContext'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'

interface ArbitrationDashboardUIProps {
    currentUser: UserType
}

const ArbitrationDashboardUI = ({
    currentUser,
}: ArbitrationDashboardUIProps) => {
    const { setAndLogError } = useErrorContext()

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
        if (currentUser) {
            try {
                const arbitratorAPI = new CeramicArbitratorAPI(currentUser)
                setArbitratorContracts(
                    await arbitratorAPI.getArbitratorContracts()
                )
            } catch (e) {
                setAndLogError(e)
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
        </>
    )
}

export default ArbitrationDashboardUI
