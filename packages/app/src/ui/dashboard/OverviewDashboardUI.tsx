import { Box, Text } from 'grommet'
import { useEffect, useState } from 'react'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import ListSkeleton from '@cambrian/app/components/skeletons/ListSkeleton'
import { ProposalModel } from '@cambrian/app/models/ProposalModel'
import RedeemableTokenListWidget from './widgets/RedeemableTokenListWidget'
import { TemplateModel } from '@cambrian/app/models/TemplateModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface OverviewDashboardUIProps {
    currentUser: UserType
    recents?: string[]
}

const OverviewDashboardUI = ({
    currentUser,
    recents,
}: OverviewDashboardUIProps) => {
    const [recentStages, setRecentStages] = useState<
        TileDocument<TemplateModel | ProposalModel | CompositionModel>[]
    >([])
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isFetching, setIsFetching] = useState(false)

    useEffect(() => {
        fetchRecentStages()
    }, [recents])

    const fetchRecentStages = async () => {
        try {
            setIsFetching(true)
            if (recents) {
            } else {
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsFetching(false)
    }

    return (
        <>
            <Box fill gap="medium" pad={{ top: 'medium' }} direction="row">
                {/*  <Box width={'large'}>
                    <Box pad={{ top: 'medium' }}>
                        <Text>Recents</Text>
                        {recents && recents.length > 0 ? (
                            recents.map((recent) => (
                                <Box key={recent}>{recent}</Box>
                            ))
                        ) : (
                            <ListSkeleton
                                isFetching={isFetching}
                                subject="recents"
                            />
                        )}
                    </Box>
                </Box> */}
                <Box width={'large'}>
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
