import { Box, Text } from 'grommet'

import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import ListSkeleton from '@cambrian/app/components/skeletons/ListSkeleton'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import RecentSolverTile from './tiles/RecentSolverTile'
import RedeemableTokenListWidget from './widgets/RedeemableTokenListWidget'
import { UserType } from '@cambrian/app/store/UserContext'
import { useState } from 'react'

interface OverviewDashboardUIProps {
    currentUser: UserType
    recents?: string[]
    onDeleteRecent: (streamId: string) => Promise<void>
}

const OverviewDashboardUI = ({
    currentUser,
    recents,
    onDeleteRecent,
}: OverviewDashboardUIProps) => {
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    const recentSolvers = recents ? recents.slice(0, 10).reverse() : undefined

    return (
        <>
            <Box fill gap="medium" pad={{ top: 'medium' }}>
                <Box pad={{ top: 'medium' }} gap="small">
                    <Text size="small" color="dark-4">
                        Recently viewed
                    </Text>
                    {recentSolvers && recentSolvers.length > 0 ? (
                        <Box direction="row" overflow={{ horizontal: 'auto' }}>
                            {recentSolvers.map((recent) => (
                                <RecentSolverTile
                                    key={recent}
                                    id={recent}
                                    currentUser={currentUser}
                                    onDeleteRecent={onDeleteRecent}
                                />
                            ))}
                        </Box>
                    ) : (
                        <ListSkeleton
                            isFetching={false}
                            subject="recently viewed"
                        />
                    )}
                </Box>
                <PlainSectionDivider />
                <Box gap="small">
                    <Text size="small" color="dark-4">
                        Token to redeem
                    </Text>
                    <RedeemableTokenListWidget currentUser={currentUser} />
                </Box>
                <Box pad="large" />
            </Box>
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default OverviewDashboardUI
