import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'
import { useContext, useEffect, useState } from 'react'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { Box } from 'grommet'
import FundProposalUI from '@cambrian/app/ui/proposals/FundProposalUI'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import { IPFSSolutionsHubContext } from '@cambrian/app/store/IPFSSolutionsHubContext'
import InvalidCIDUI from '@cambrian/app/ui/general/InvalidCIDUI'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ParticipantAvatar from '@cambrian/app/src/components/avatars/AvatarWithTitle'
import { ProposalModel } from '@cambrian/app/src/models/ProposalModel'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/dist/client/router'

const fundProposalPageTitle = 'Fund Proposal'

export default function ProposalPage() {
    const [stagehand] = useState(new Stagehand())

    const { currentUser, login } = useCurrentUser()
    const router = useRouter()
    const { proposalCID } = router.query

    const ipfsSolutionsHub = useContext(IPFSSolutionsHubContext).contract
    const [currentProposal, setCurrentProposal] = useState<ProposalModel>()
    const [currentProposalCID, setCurrentProposalCID] = useState<string>()

    const [isLoading, setIsLoading] = useState(true)
    const [showError, setShowError] = useState(false)

    useEffect(() => {
        if (!currentUser) {
            getLogin()
        }
    }, [currentUser])

    const getLogin = async () => {
        await login()
    }

    useEffect(() => {
        if (!router.isReady) return
        if (proposalCID !== undefined && typeof proposalCID === 'string') {
            setCurrentProposalCID(proposalCID)
            init(proposalCID)
        }
    }, [router, ipfsSolutionsHub])

    const init = async (proposalCID: string) => {
        if (ipfsSolutionsHub) {
            // Fetch IPFS Stage
            const proposal = (await stagehand.loadStage(
                proposalCID,
                StageNames.proposal
            )) as ProposalModel

            if (proposal) {
                // Fetch solvers
                const solvers = await ipfsSolutionsHub.getSolvers(
                    proposal.solution.id
                )
                setCurrentProposal(proposal)
                if (solvers && solvers.length) {
                    // Solution is executed and has deployed Solvers
                    router.push(
                        `/proposals/${proposalCID}/solvers/${solvers[0]}`
                    )
                }
            } else {
                setShowError(true)
            }
            setIsLoading(false)
        }
    }

    return (
        <>
            {currentProposal && currentProposalCID && (
                <BaseLayout contextTitle={fundProposalPageTitle}>
                    <Box>
                        <HeaderTextSection
                            title={currentProposal.title}
                            subTitle="Project Overview"
                            paragraph={currentProposal.description}
                        />
                        <Box
                            direction="row"
                            height={{ min: 'auto' }}
                            justify="around"
                            align="start"
                        >
                            <ParticipantAvatar
                                title={currentProposal.solution.seller.name!!}
                                pfpPath={currentProposal.solution.seller.pfp}
                                role="Seller"
                            />
                            <ParticipantAvatar
                                title={currentProposal.buyer.name!!}
                                pfpPath={currentProposal.buyer.pfp}
                                role="Buyer"
                            />
                        </Box>
                        <Box fill>
                            <FundProposalUI
                                proposalCID={currentProposalCID}
                                proposal={currentProposal}
                            />
                        </Box>
                    </Box>
                </BaseLayout>
            )}
            {showError && (
                <InvalidCIDUI
                    contextTitle={fundProposalPageTitle}
                    stageName={StageNames.template}
                />
            )}
            {isLoading && <LoadingScreen context="Loading Proposal" />}
        </>
    )
}
