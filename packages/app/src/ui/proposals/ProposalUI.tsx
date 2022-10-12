import { Box, Heading, Text } from 'grommet'
import { useEffect, useState } from 'react'

import CambrianProfileAbout from '@cambrian/app/components/info/CambrianProfileAbout'
import Custom404Page from 'packages/app/pages/404'
import InteractionLayout from '@cambrian/app/components/layout/InteractionLayout'
import Messenger from '@cambrian/app/components/messenger/Messenger'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import PriceInfo from '@cambrian/app/components/info/PriceInfo'
import ProposalActionbar from '@cambrian/app/components/bars/actionbars/proposal/ProposalActionbar'
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
                <InteractionLayout
                    contextTitle={stageStack?.proposal.title || 'Proposal'}
                    actionBar={
                        <ProposalActionbar
                            proposedPrice={{
                                amount: stageStack?.proposal.price.amount,
                                token: collateralToken,
                            }}
                            messenger={
                                initMessenger && stageStack ? (
                                    <Messenger
                                        chatID={stageStack.proposalStreamID}
                                        currentUser={currentUser}
                                        participantDIDs={
                                            currentUser.did ===
                                            stageStack.template.author
                                                ? [stageStack.proposal.author]
                                                : [stageStack.template.author]
                                        }
                                    />
                                ) : undefined
                            }
                        />
                    }
                >
                    {stageStack ? (
                        <Box gap="medium">
                            <ProposalHeader
                                stageStack={stageStack}
                                proposalStatus={proposalStatus}
                            />
                            <Box gap="small">
                                <Heading level="3">Project details</Heading>
                                <Text style={{ whiteSpace: 'pre-line' }}>
                                    {stageStack.proposal.description}
                                </Text>
                            </Box>
                            <PlainSectionDivider />
                            <PriceInfo
                                label={
                                    proposalStatus === ProposalStatus.Funding
                                        ? 'Goal'
                                        : proposalStatus ===
                                          ProposalStatus.Executed
                                        ? 'Price'
                                        : 'Proposed Price'
                                }
                                amount={stageStack.proposal.price.amount}
                                token={collateralToken}
                            />
                            <PlainSectionDivider />
                            {proposerProfile && (
                                <CambrianProfileAbout
                                    cambrianProfile={proposerProfile}
                                />
                            )}
                            <ProposalControlbar />
                        </Box>
                    ) : (
                        <ProposalSkeleton />
                    )}
                </InteractionLayout>
            )}
        </>
    )
}

export default ProposalUI
