import { useEffect, useState } from 'react'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import ConnectWalletSection from '@cambrian/app/components/sections/ConnectWalletSection'
import Custom404Page from '../404'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import { ProposalStatus } from '@cambrian/app/models/ProposalStatus'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import ViewProposalUI from '@cambrian/app/ui/proposals/ViewProposalUI'
import { ethers } from 'ethers'
import { initProposalStatus } from '@cambrian/app/utils/helpers/proposalStatusHelper'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useRouter } from 'next/router'

export default function ViewProposalPage() {
    const { currentUser, isUserLoaded } = useCurrentUser()
    const router = useRouter()
    const { proposalStreamID } = router.query
    const [show404NotFound, setShow404NotFound] = useState(false)
    const [ceramicProposal, setCeramicProposal] =
        useState<CeramicProposalModel>()
    const [ceramicTemplate, setCeramicTemplate] =
        useState<CeramicTemplateModel>()
    const [proposalStatus, setProposalStatus] = useState<ProposalStatus>(
        ProposalStatus.Unknown
    )

    const [proposalContract, setProposalContract] = useState<ethers.Contract>()
    const [isProposalExecuted, setIsProposalExecuted] = useState(false)
    const [proposalsHub, setProposalsHub] = useState<ProposalsHub>()

    useEffect(() => {
        if (router.isReady) fetchProposal()
    }, [router, currentUser])

    /* 
        Tries to fetch Ceramic and on-chain Proposal. At least one of it must exist, otherwise 404 will be set to true.
    */
    const fetchProposal = async () => {
        if (currentUser) {
            if (
                proposalStreamID !== undefined &&
                typeof proposalStreamID === 'string'
            ) {
                let hasCeramicData = false
                try {
                    const cs = new CeramicStagehand(currentUser.selfID)
                    const res = await cs.loadAndReceiveProposal(
                        proposalStreamID
                    )

                    if (res?.proposalContent) {
                        const _templateCommit = (await (
                            await cs.loadStream(
                                res.proposalContent.template.commitID
                            )
                        ).content) as CeramicTemplateModel

                        if (_templateCommit) {
                            // To check state of proposal
                            const _templateStream = (await (
                                await cs.loadStream(
                                    res.proposalContent.template.streamID
                                )
                            ).content) as CeramicTemplateModel

                            setProposalStatus(
                                initProposalStatus(
                                    _templateStream.receivedProposals[
                                        proposalStreamID
                                    ],
                                    res.proposalCommitID,
                                    res.proposalContent
                                )
                            )

                            hasCeramicData = true

                            setCeramicProposal(res.proposalContent)
                            setCeramicTemplate(_templateCommit)
                        }
                    }
                } catch {}

                /*  // Init Chain Data
                try {
                    const proposalsHub = new ProposalsHub(
                        currentUser.signer,
                        currentUser.chainId
                    )
                    setProposalsHub(proposalsHub)
                    const onChainProposal = await proposalsHub.getProposal(
                        proposalStreamID
                    )
                    if (onChainProposal) {
                        setIsProposalExecuted(await onChainProposal.isExecuted)

                        if (await onChainProposal.isExecuted) {
                            setProposalStatus(ProposalStatus.Executed)
                        } else {
                            setProposalStatus(ProposalStatus.Funding)
                        }
                        return setProposalContract(onChainProposal)
                    }
                } catch (e) {} */

                if (hasCeramicData) return
            }
            setShow404NotFound(true)
        }
    }

    return (
        <>
            {isUserLoaded ? (
                currentUser ? (
                    show404NotFound ? (
                        <Custom404Page />
                    ) : ceramicProposal || proposalContract ? (
                        <ViewProposalUI
                            updateProposal={fetchProposal}
                            proposalStreamID={proposalStreamID as string}
                            proposalStatus={proposalStatus}
                            currentUser={currentUser}
                            ceramicProposal={ceramicProposal}
                            proposalContract={proposalContract}
                            ceramicTemplate={ceramicTemplate}
                        />
                    ) : (
                        <LoadingScreen context={LOADING_MESSAGE['PROPOSAL']} />
                    )
                ) : (
                    <PageLayout contextTitle="Connect your Wallet">
                        <ConnectWalletSection />
                    </PageLayout>
                )
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['WALLET']} />
            )}
        </>
    )
}
