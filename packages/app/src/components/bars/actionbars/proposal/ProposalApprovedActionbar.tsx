import {
    createSolutionBase,
    deployProposal,
    getSolutionSafeBaseId,
} from '@cambrian/app/utils/helpers/proposalHelper'
import { useEffect, useState } from 'react'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import BaseActionbar from '../BaseActionbar'
import IPFSSolutionsHub from '@cambrian/app/hubs/IPFSSolutionsHub'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { SolutionModel } from '@cambrian/app/models/SolutionModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { Users } from 'phosphor-react'
import { ethers } from 'ethers'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'
import { useProposalContext } from '@cambrian/app/hooks/useProposalContext'

interface ProposalApprovedActionbarProps {
    currentUser: UserType
    isApproving: boolean
    setIsApproving: React.Dispatch<React.SetStateAction<boolean>>
    messenger?: JSX.Element
}

const ProposalApprovedActionbar = ({
    currentUser,
    isApproving,
    setIsApproving,
    messenger,
}: ProposalApprovedActionbarProps) => {
    const { setAndLogError } = useErrorContext()
    const solutionsHub = new IPFSSolutionsHub(
        currentUser.signer,
        currentUser.chainId
    )
    const { stageStack } = useProposalContext()
    const [isInTransaction, setIsInTransaction] = useState(false)
    const [solutionBase, setSolutionBase] = useState<SolutionModel>()
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        fetchSolution()
    }, [isApproving, stageStack])

    const onDeployProposal = async () => {
        setIsInTransaction(true)
        try {
            if (stageStack) {
                await deployProposal(currentUser, stageStack)
            }
        } catch (e) {
            setAndLogError(e)
            setIsInTransaction(false)
        }
    }

    const onCreateSolutionBase = async () => {
        setIsApproving(true)
        try {
            if (stageStack) {
                await createSolutionBase(currentUser, stageStack)
                await fetchSolution()
            }
        } catch (e) {
            setAndLogError(e)
            setIsApproving(false)
        }
    }

    const fetchSolution = async () => {
        if (stageStack) {
            const baseId = getSolutionSafeBaseId(
                stageStack.proposalCommitID,
                stageStack.proposal.template.commitID
            )
            const solution = await solutionsHub.contract.bases(baseId)
            if (solution?.id !== ethers.constants.HashZero) {
                setSolutionBase(solution)
            }
            setIsLoaded(true)
        }
    }

    return (
        <>
            {isLoaded ? (
                solutionBase ? (
                    <BaseActionbar
                        messenger={messenger}
                        primaryAction={
                            <LoaderButton
                                isLoading={isInTransaction}
                                primary
                                size="small"
                                onClick={onDeployProposal}
                                label={'Start Funding'}
                            />
                        }
                        info={{
                            title: `Approved Proposal`,
                            subTitle: 'Start funding the Solver',
                            dropContent: (
                                <ActionbarItemDropContainer
                                    title="Secure financial resources"
                                    description="This transaction initiates the Solver to secure funding."
                                    list={[
                                        {
                                            icon: <Users />,
                                            label: 'This can be done by anyone',
                                        },
                                    ]}
                                />
                            ),
                        }}
                    />
                ) : (
                    <BaseActionbar
                        messenger={messenger}
                        primaryAction={
                            <LoaderButton
                                isLoading={isApproving}
                                primary
                                size="small"
                                onClick={onCreateSolutionBase}
                                label={'Continue'}
                            />
                        }
                        info={{
                            title: `Approved Proposal`,
                            subTitle: 'Solver setup',
                            dropContent: (
                                <ActionbarItemDropContainer
                                    title="Start solving"
                                    description="This transaction will initialize the approved Proposal and anchors it to the Blockchain."
                                    list={[
                                        {
                                            icon: <Users />,
                                            label: 'This can be done by anyone',
                                        },
                                    ]}
                                />
                            ),
                        }}
                    />
                )
            ) : (
                <></>
            )}
        </>
    )
}

export default ProposalApprovedActionbar
