import {
    createSolutionBase,
    deployProposal,
    getSolutionSafeBaseId,
} from '@cambrian/app/utils/helpers/proposalHelper'
import { useEffect, useState } from 'react'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import BaseActionbar from '../BaseActionbar'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import IPFSSolutionsHub from '@cambrian/app/hubs/IPFSSolutionsHub'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { SolutionModel } from '@cambrian/app/models/SolutionModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
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
    const solutionsHub = new IPFSSolutionsHub(
        currentUser.signer,
        currentUser.chainId
    )
    const { stageStack } = useProposalContext()
    const [isInTransaction, setIsInTransaction] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [solutionBase, setSolutionBase] = useState<SolutionModel>()
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        fetchSolution()
    }, [isApproving])

    const onDeployProposal = async () => {
        setIsInTransaction(true)
        try {
            if (stageStack) {
                await deployProposal(currentUser, stageStack)
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
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
            setErrorMessage(await cpLogger.push(e))
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
                            title: `Proposal has been approved`,
                            subTitle: 'Start funding the Solver',
                            dropContent: (
                                <ActionbarItemDropContainer
                                    title="Proposal has been approved"
                                    description="Please hit the 'Start Funding'-Button in order to initiate the Solver and get it ready for funding."
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
                            title: `Proposal has been approved`,
                            subTitle: 'Solver setup',
                            dropContent: (
                                <ActionbarItemDropContainer
                                    title="Proposal has been approved"
                                    description="To set up the Solver correctly please hit the 'Continue'-Button."
                                />
                            ),
                        }}
                    />
                )
            ) : (
                <></>
            )}
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default ProposalApprovedActionbar
