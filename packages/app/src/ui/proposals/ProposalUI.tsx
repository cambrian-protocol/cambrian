import { Box, Stack } from 'grommet'
import { CaretDown, CaretUp, IconContext } from 'phosphor-react'
import { useEffect, useState } from 'react'

import BasicProfileInfo from '@cambrian/app/components/info/BasicProfileInfo'
import Custom404Page from 'packages/app/pages/404'
import FlexInputInfo from '../common/FlexInputInfo'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import Messenger from '@cambrian/app/components/messenger/Messenger'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import PriceInfo from '@cambrian/app/components/info/PriceInfo'
import ProposalContentInfo from './ProposalContentInfo'
import ProposalControlbar from './ProposalControlbar'
import ProposalHeader from '@cambrian/app/components/layout/header/ProposalHeader'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useProposal } from '@cambrian/app/hooks/useProposal'

const ProposalUI = () => {
    const { currentUser } = useCurrentUser()
    const { isLoaded, proposalStack, proposalStatus, proposalStreamID } =
        useProposal()
    const [collateralToken, setCollateralToken] = useState<TokenModel>()

    useEffect(() => {
        initCollateralToken()
    }, [currentUser, proposalStack])

    const initCollateralToken = async () => {
        if (proposalStack && currentUser) {
            const ct = await fetchTokenInfo(
                proposalStack.proposal.price.tokenAddress,
                currentUser.web3Provider
            )
            if (ct) setCollateralToken(ct)
        }
    }

    const initMessenger =
        (currentUser?.selfID.did.id === proposalStack?.template.author ||
            currentUser?.selfID.did.id === proposalStack?.proposal.author) &&
        proposalStatus !== ProposalStatus.Draft

    return (
        <>
            {!isLoaded ? (
                <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
            ) : proposalStack ? (
                <Stack anchor="bottom-right">
                    <PageLayout
                        contextTitle={proposalStack.proposal.title}
                        kind="narrow"
                    >
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
                                    proposal={proposalStack.proposal}
                                />
                                <PlainSectionDivider />
                                <PriceInfo
                                    amount={proposalStack.proposal.price.amount}
                                    label="Proposed Price"
                                    token={collateralToken}
                                />
                                <FlexInputInfo
                                    flexInputs={
                                        proposalStack.proposal.flexInputs
                                    }
                                />
                                <PlainSectionDivider />
                                <BasicProfileInfo
                                    did={proposalStack.proposal.author}
                                />
                                <ProposalControlbar />
                            </Box>
                        </Box>
                    </PageLayout>
                    {initMessenger && currentUser && (
                        <Messenger
                            chatID={proposalStreamID}
                            currentUser={currentUser}
                            chatType={
                                proposalStatus === ProposalStatus.Funding ||
                                proposalStatus === ProposalStatus.Executed
                                    ? 'Proposal'
                                    : 'Draft'
                            }
                            participantDIDs={
                                currentUser?.selfID.did.id ===
                                proposalStack.proposal.author
                                    ? [proposalStack.template.author]
                                    : [proposalStack.proposal.author]
                            }
                        />
                    )}
                </Stack>
            ) : (
                <Custom404Page />
            )}
        </>
    )
}

export default ProposalUI
