import { useEffect, useState } from 'react'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import BaseActionbar from '../BaseActionbar'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import Messenger from '@cambrian/app/components/messenger/Messenger'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import { Users } from 'phosphor-react'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface ProposalApprovedActionbarProps {
    proposal: Proposal
    isApproving: boolean
    setIsApproving: React.Dispatch<React.SetStateAction<boolean>>
}

const ProposalApprovedActionbar = ({
    proposal,
    isApproving,
    setIsApproving,
}: ProposalApprovedActionbarProps) => {
    const [isInTransaction, setIsInTransaction] = useState(false)
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isLoaded, setIsLoaded] = useState(false)
    const [hasSolution, setHasSolution] = useState(false)

    useEffect(() => {
        init()
    }, [isApproving])

    const init = async () => {
        setIsLoaded(false)
        const _hasSolution = await proposal.hasSolution()
        setHasSolution(_hasSolution)
        setIsLoaded(true)
    }

    const onDeployProposal = async () => {
        setIsInTransaction(true)
        try {
            await proposal.create()
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
            setIsInTransaction(false)
        }
    }

    const onCreateSolutionBase = async () => {
        setIsApproving(true)
        try {
            await proposal.createSolutionBase()
            await init()
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
            setIsApproving(false)
        }
    }

    return (
        <>
            {isLoaded ? (
                hasSolution ? (
                    <BaseActionbar
                        messenger={
                            <Messenger
                                chatID={proposal.doc.streamID}
                                currentUser={proposal.auth!}
                                participantDIDs={[
                                    proposal.content.author,
                                    proposal.template.content.author,
                                ]}
                            />
                        }
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
                        messenger={
                            <Messenger
                                chatID={proposal.doc.streamID}
                                currentUser={proposal.auth!}
                                participantDIDs={[
                                    proposal.content.author,
                                    proposal.template.content.author,
                                ]}
                            />
                        }
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
