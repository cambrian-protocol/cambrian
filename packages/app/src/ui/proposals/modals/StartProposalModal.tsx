import React, { SetStateAction, useEffect, useState } from 'react'

import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import { Box } from 'grommet'
import ButtonDescriptionLayout from '@cambrian/app/components/layout/ButtonDescriptionLayout'
import { CircleWavyCheck } from 'phosphor-react'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'

interface IStartProposalModal {
    proposal: Proposal
    isCreatingSolution: boolean
    setIsCreatingSolution: React.Dispatch<SetStateAction<boolean>>
    isCreatingProposal: boolean
    setIsCreatingProposal: React.Dispatch<SetStateAction<boolean>>
    onClose: () => void
}

const StartProposalModal = ({
    isCreatingSolution,
    setIsCreatingSolution,
    isCreatingProposal,
    setIsCreatingProposal,
    onClose,
    proposal,
}: IStartProposalModal) => {
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isInitialized, setIsInitialized] = useState(false)
    const [hasSolution, setHasSolution] = useState(false)

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        setIsInitialized(false)
        setHasSolution(await proposal.hasSolution())
        setIsInitialized(true)
    }

    const onCreateSolutionBase = async () => {
        setIsCreatingSolution(true)
        try {
            await proposal.createSolutionBase()
            setHasSolution(await proposal.hasSolution())
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsCreatingSolution(false)
    }

    const onCreateProposal = async () => {
        setIsCreatingProposal(true)
        try {
            await proposal.createOnChainProposal()
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsCreatingProposal(false)
    }

    return (
        <>
            <BaseLayerModal onClose={onClose}>
                <ModalHeader
                    title="Start Proposal"
                    description="The terms of this interaction have been mutually agreed upon by both parties, allowing anyone to create a smart contract based on the agreement."
                />
                <Box gap="medium" height={{ min: 'auto' }}>
                    <ButtonDescriptionLayout
                        disabled={hasSolution || !isInitialized}
                        description={`This transaction creates an on-chain agreement and initiates the recipient addresses, along with their respective allocations for each possible outcome.`}
                        button={
                            <LoaderButton
                                primary
                                disabled={hasSolution}
                                isInitializing={!isInitialized}
                                isLoading={isCreatingSolution}
                                label={
                                    hasSolution ? 'Created' : 'Create Contract'
                                }
                                icon={
                                    hasSolution ? (
                                        <CircleWavyCheck />
                                    ) : undefined
                                }
                                onClick={onCreateSolutionBase}
                            />
                        }
                    />
                    <ButtonDescriptionLayout
                        disabled={!hasSolution || !isInitialized}
                        description={`In order to fund it, this transaction establishes the Proposal Escrow based on the agreement that has been created.`}
                        button={
                            <LoaderButton
                                primary
                                disabled={!hasSolution}
                                isInitializing={!isInitialized}
                                isLoading={isCreatingProposal}
                                label={'Create Escrow'}
                                onClick={onCreateProposal}
                            />
                        }
                    />
                </Box>
            </BaseLayerModal>
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default StartProposalModal
