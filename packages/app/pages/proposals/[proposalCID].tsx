import { Box, Button } from 'grommet'
import Stagehand, { StageNames } from '@cambrian/app/classes/Stagehand'
import { useContext, useEffect, useState } from 'react'

import { BaseLayout } from '@cambrian/app/components/layout/BaseLayout'
import { BigNumber, ethers, EventFilter } from 'ethers'
import FundProposalUI from '@cambrian/app/ui/proposals/FundProposalUI'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import InvalidCIDUI from '@cambrian/app/ui/general/InvalidCIDUI'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ParticipantAvatar from '@cambrian/app/src/components/avatars/AvatarWithTitle'
import { ProposalModel } from '@cambrian/app/src/models/ProposalModel'
import { SolutionModel } from '@cambrian/app/models/SolutionModel'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useProposalsHub } from '@cambrian/app/hooks/useProposalsHub'
import { useRouter } from 'next/dist/client/router'
import { IPFSSolutionsHubContext } from '@cambrian/app/store/IPFSSolutionsHubContext'

const fundProposalPageTitle = 'Fund Proposal'

export default function ProposalPage() {
    const [stagehand] = useState(new Stagehand())
    const { currentUser, login } = useCurrentUser()
    const ipfsSolutionsHub = useContext(IPFSSolutionsHubContext).contract
    const [currentProposal, setCurrentProposal] = useState<ProposalModel>()
    const [currentSolution, setCurrentSolution] = useState<SolutionModel>()
    const [currentFunding, setCurrentFunding] = useState<BigNumber>(
        BigNumber.from(0)
    )
    const [showError, setShowError] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isInTransaction, setIsInTransaction] = useState(false)
    const router = useRouter()
    const { proposalCID } = router.query
    const { contract, executeProposal, getProposalFunding, getProposal } =
        useProposalsHub()

    useEffect(() => {
        if (currentProposal && ipfsSolutionsHub) {
            getSolution()
        }
    }, [currentProposal, ipfsSolutionsHub])

    const getSolution = async () => {
        if (ipfsSolutionsHub && currentProposal) {
            console.log('Getting solution')
            const proposal = await getProposal(currentProposal.id)
            if (proposal) {
                const solvers = await ipfsSolutionsHub.getSolvers(
                    proposal.solutionId
                )
                console.log(solvers)

                if (solvers && solvers.length) {
                    router.push(`/solvers/${solvers[0]}`)
                }
            }
        }
    }

    useEffect(() => {
        if (contract) {
            contract.on(
                contract.filters.FundProposal(null, null, null),
                async (proposalId, amount, from) => {
                    console.log('Funded: ', proposalId, amount, from)
                    const proposalFunding = await getProposalFunding(proposalId)
                    if (proposalFunding) setCurrentFunding(proposalFunding)
                    setIsInTransaction(false)
                }
            )

            contract.on(
                contract.filters.DefundProposal(null, null, null),
                async (proposalId, amount, from) => {
                    console.log('Defunded: ', proposalId, amount, from)
                    const proposalFunding = await getProposalFunding(proposalId)
                    if (proposalFunding) setCurrentFunding(proposalFunding)
                    setIsInTransaction(false)
                }
            )

            contract.on(
                contract.filters.ExecuteProposal(null),
                async (proposalId) => {
                    console.log('Executed Proposal: ', proposalId)
                    if (ipfsSolutionsHub) {
                        const proposal = await getProposal(proposalId)
                        if (proposal) {
                            const solvers = await ipfsSolutionsHub.getSolvers(
                                proposal.solutionId
                            )
                            console.log(solvers)
                            if (solvers && solvers.length) {
                                router.push(`/solvers/${solvers[0]}`)
                            }
                        }
                    }
                    setIsInTransaction(false)
                }
            )
        }
    }, [contract])

    useEffect(() => {
        if (!currentUser) {
            getLogin()
        }
    }, [currentUser])

    const getLogin = async () => {
        await login()
    }

    useEffect(() => {
        setShowError(false)
        if (!router.isReady) return
        if (proposalCID !== undefined && typeof proposalCID === 'string') {
            fetchProposal(proposalCID)
        } else {
            setShowError(true)
        }
    }, [router, currentUser, contract])

    const fetchProposal = async (proposalCID: string) => {
        try {
            const proposal = (await stagehand.loadStage(
                proposalCID,
                StageNames.proposal
            )) as ProposalModel

            const solution = stagehand.solution as SolutionModel

            if (proposal && solution && currentUser) {
                setCurrentProposal(proposal)
                setCurrentSolution(solution)
                const proposalFunding = await getProposalFunding(proposal.id)
                if (proposalFunding) setCurrentFunding(proposalFunding)
            }
        } catch {
            console.warn('Cannot fetch proposal')
        }
        setIsLoading(false)
    }

    const onExecuteProposal = async () => {
        if (
            currentProposal &&
            currentSolution &&
            currentUser &&
            ipfsSolutionsHub
        ) {
            setIsInTransaction(true)
            await executeProposal(
                currentProposal.id,
                currentSolution.solverConfigs,
                currentUser
            )
            const finalStagesCID = stagehand.executeProposal()

            console.log('Final stages CID: ', finalStagesCID)
        }
    }

    return (
        <>
            {currentProposal && currentSolution ? (
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
                                title={currentSolution.seller.name!!}
                                pfpPath={currentSolution.seller.pfp}
                                role="Seller"
                            />
                            <ParticipantAvatar
                                title={currentProposal.buyer.name!!}
                                pfpPath={currentProposal.buyer.pfp}
                                role="Buyer"
                            />
                        </Box>
                        <Box fill>
                            {currentSolution.isExecuted ? (
                                <>
                                    <HeaderTextSection title="This proposal has been funded and is executed." />
                                    <Button
                                        label="Interact with it"
                                        primary
                                        href={`/solvers/${currentSolution.solverAddresses[0]}`}
                                    />
                                </>
                            ) : currentFunding.lt(currentProposal.amount) ? (
                                <FundProposalUI
                                    currentFunding={currentFunding}
                                    solution={currentSolution}
                                    proposal={currentProposal}
                                />
                            ) : (
                                <>
                                    <HeaderTextSection
                                        title="Execute this proposal"
                                        subTitle="Proposal funding description"
                                        paragraph={
                                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis.'
                                        }
                                    />
                                    <Box fill>
                                        <Button
                                            primary
                                            label="Execute Proposal"
                                            onClick={() => onExecuteProposal()}
                                        />
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Box>
                </BaseLayout>
            ) : (
                <InvalidCIDUI
                    contextTitle={fundProposalPageTitle}
                    stageName={StageNames.template}
                />
            )}
            {isLoading && <LoadingScreen context="Loading Proposal" />}
            {isInTransaction && (
                <LoadingScreen context="Please confirm this transaction" />
            )}
        </>
    )
}
