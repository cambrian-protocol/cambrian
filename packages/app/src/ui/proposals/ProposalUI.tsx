import { Box, Stack } from 'grommet'
import { useEffect, useState } from 'react'

import CambrianProfileInfo from '@cambrian/app/components/info/CambrianProfileInfo'
import Custom404Page from 'packages/app/pages/404'
import FlexInputInfo from '../common/FlexInputInfo'
import Messenger from '@cambrian/app/components/messenger/Messenger'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import PriceInfo from '@cambrian/app/components/info/PriceInfo'
import ProposalContentInfo from './ProposalContentInfo'
import ProposalControlbar from './control/ProposalControlbar'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import ProposalSkeleton from '@cambrian/app/components/skeletons/ProposalSkeleton'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import useCambrianProfile from '@cambrian/app/hooks/useCambrianProfile'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

interface ProposalUIProps {
    currentUser: UserType
}

const ProposalUI = ({ currentUser }: ProposalUIProps) => {
    const { isLoaded, stageStack, proposalStatus } = useProposalContext()
    const [collateralToken, setCollateralToken] = useState<TokenModel>()
    const [proposerProfile] = useCambrianProfile(stageStack?.proposal.author)

    useEffect(() => {
        initCollateralToken()
    }, [currentUser, stageStack])

    const initCollateralToken = async () => {
        if (stageStack && currentUser) {
            const ct = await fetchTokenInfo(
                stageStack.proposal.price.tokenAddress,
                currentUser.web3Provider
            )
            if (ct) setCollateralToken(ct)
        }
    }

    const initMessenger =
        (currentUser.did === stageStack?.template.author ||
            currentUser.did === stageStack?.proposal.author) &&
        proposalStatus !== ProposalStatus.Draft

    return (
        <>
            {isLoaded && stageStack === undefined ? (
                <Custom404Page />
            ) : (
                <Stack anchor="bottom-right">
                    <PageLayout
                        contextTitle={stageStack?.proposal.title || 'Proposal'}
                        kind="narrow"
                    >
                        {stageStack ? (
                            <Box pad="large">
                                <ProposalHeader
                                    stageStack={stageStack}
                                    proposalStatus={proposalStatus}
                                />
                                <Box
                                    height={{ min: 'auto' }}
                                    pad={{ top: 'large' }}
                                    gap="medium"
                                >
                                    <ProposalContentInfo
                                        hideTitle
                                        proposal={stageStack.proposal}
                                    />
                                    <PlainSectionDivider />
                                    <PriceInfo
                                        amount={
                                            stageStack.proposal.price.amount
                                        }
                                        label="Proposed Price"
                                        token={collateralToken}
                                    />
                                    <FlexInputInfo
                                        composition={stageStack.composition}
                                        flexInputs={
                                            stageStack.proposal.flexInputs
                                        }
                                    />
                                    <PlainSectionDivider />
                                    <CambrianProfileInfo
                                        cambrianProfileDoc={proposerProfile}
                                    />
                                    <ProposalControlbar />
                                </Box>
                            </Box>
                        ) : (
                            <ProposalSkeleton />
                        )}
                    </PageLayout>
                    {initMessenger && stageStack && (
                        <Messenger
                            chatID={stageStack.proposalStreamID}
                            currentUser={currentUser}
                            chatType={'Proposal'}
                            participantDIDs={[
                                stageStack.template.author,
                                stageStack.proposal.author,
                            ]}
                        />
                    )}
                </Stack>
            )}
        </>
    )
}

export default ProposalUI
