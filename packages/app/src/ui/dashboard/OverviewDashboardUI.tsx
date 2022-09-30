import { Box, Text } from 'grommet'

import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import RecentSolverTile from './tiles/RecentSolverTile'
import RedeemableTokenListWidget from './widgets/RedeemableTokenListWidget'
import { UserType } from '@cambrian/app/store/UserContext'
import { useState } from 'react'

interface OverviewDashboardUIProps {
    currentUser: UserType
    recents?: string[]
}

const OverviewDashboardUI = ({
    currentUser,
    recents,
}: OverviewDashboardUIProps) => {
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    return (
        <>
            <Box fill gap="medium" pad={{ top: 'medium' }}>
                <Box pad={{ top: 'medium' }} gap="small">
                    <Text size="small" color="dark-4">
                        Recently viewed solvers
                    </Text>
                    <Box direction="row" overflow={{ horizontal: 'auto' }}>
                        {recents && recents.length > 0 ? (
                            recents
                                .reverse()
                                .slice(0, 10)
                                .map((recent) => (
                                    <RecentSolverTile
                                        key={recent}
                                        id={recent}
                                        currentUser={currentUser}
                                    />
                                ))
                        ) : (
                            <></>
                        )}
                    </Box>
                </Box>
                <PlainSectionDivider />
                <Box gap="small">
                    <Text size="small" color="dark-4">
                        Token to redeem
                    </Text>
                    <RedeemableTokenListWidget
                        address={currentUser.address}
                        chainId={currentUser.chainId}
                        signerOrProvider={currentUser.signer}
                    />
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
