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
    const { isLoaded, proposalStack, proposalStatus } = useProposalContext()
    const [collateralToken, setCollateralToken] = useState<TokenModel>()
    const [proposerProfile] = useCambrianProfile(
        proposalStack?.proposalDoc.content.author
    )

    useEffect(() => {
        initCollateralToken()
    }, [currentUser, proposalStack])

    const initCollateralToken = async () => {
        if (proposalStack && currentUser) {
            const ct = await fetchTokenInfo(
                proposalStack.proposalDoc.content.price.tokenAddress,
                currentUser.web3Provider
            )
            if (ct) setCollateralToken(ct)
        }
    }

    const initMessenger =
        (currentUser.selfID.did.id ===
            proposalStack?.templateDoc.content.author ||
            currentUser.selfID.did.id ===
                proposalStack?.proposalDoc.content.author) &&
        proposalStatus !== ProposalStatus.Draft

    return (
        <>
            {isLoaded && proposalStack === undefined ? (
                <Custom404Page />
            ) : (
                <Stack anchor="bottom-right">
                    <PageLayout
                        contextTitle={
                            proposalStack?.proposalDoc.content.title ||
                            'Proposal'
                        }
                        kind="narrow"
                    >
                        {proposalStack ? (
                            <Box pad="large">
                                <ProposalHeader
                                    proposalStack={proposalStack}
                                    proposalStatus={proposalStatus}
                                />
                                <Box
                                    height={{ min: 'auto' }}
                                    pad={{ top: 'large' }}
                                    gap="medium"
                                >
                                    <ProposalContentInfo
                                        hideTitle
                                        proposal={
                                            proposalStack.proposalDoc.content
                                        }
                                    />
                                    <PlainSectionDivider />
                                    <PriceInfo
                                        amount={
                                            proposalStack.proposalDoc.content
                                                .price.amount
                                        }
                                        label="Proposed Price"
                                        token={collateralToken}
                                    />
                                    <FlexInputInfo
                                        flexInputs={
                                            proposalStack.proposalDoc.content
                                                .flexInputs
                                        }
                                    />
                                    <PlainSectionDivider />
                                    <CambrianProfileInfo
                                        cambrianProfile={proposerProfile}
                                    />
                                    <ProposalControlbar />
                                </Box>
                            </Box>
                        ) : (
                            <ProposalSkeleton />
                        )}
                    </PageLayout>
                    {initMessenger && proposalStack && (
                        <Messenger
                            chatID={proposalStack.proposalDoc.id.toString()}
                            currentUser={currentUser}
                            chatType={'Proposal'}
                            participantDIDs={[
                                proposalStack.templateDoc.content.author,
                                proposalStack.proposalDoc.content.author,
                            ]}
                        />
                    )}
                </Stack>
            )}
        </>
    )
}

export default ProposalUI
