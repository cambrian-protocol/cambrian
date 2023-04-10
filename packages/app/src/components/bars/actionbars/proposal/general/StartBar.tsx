import { Handshake, Vault } from 'phosphor-react'
import React, { useState } from 'react'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import BaseActionbar from '../../BaseActionbar'
import { Button } from 'grommet'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import StartProposalModal from '@cambrian/app/ui/proposals/modals/StartProposalModal'

interface IApprovedBar {
    proposal: Proposal
}

const StartBar = ({ proposal }: IApprovedBar) => {
    const [isCreatingSolution, setIsCreatingSolution] = useState(false)
    const [isCreatingProposal, setIsCreatingProposal] = useState(false)

    const [showStartProposalModal, setShowStartProposalModal] = useState(false)
    const toggleShowStartProposalModal = () =>
        setShowStartProposalModal(!showStartProposalModal)
    return (
        <>
            <BaseActionbar
                primaryAction={
                    <Button
                        primary
                        label={'Start Proposal'}
                        onClick={toggleShowStartProposalModal}
                    />
                }
                info={{
                    title: `Contract Creation`,
                    subTitle: 'Finalizing Agreement Process',
                    dropContent: (
                        <ActionbarItemDropContainer
                            title="Proposal starting"
                            description="The agreement between the buyer and seller has been finalized. The next step is to create the corresponding on-chain contracts."
                            list={[
                                {
                                    icon: <Handshake />,
                                    label: 'Creates the smart contract based on the agreement',
                                },
                                {
                                    icon: <Vault />,
                                    label: 'Creates the Proposal escrow which stores and distributes the funds',
                                },
                            ]}
                        />
                    ),
                }}
            />
            {showStartProposalModal && (
                <StartProposalModal
                    onClose={toggleShowStartProposalModal}
                    proposal={proposal}
                    isCreatingSolution={isCreatingSolution}
                    setIsCreatingSolution={setIsCreatingSolution}
                    isCreatingProposal={isCreatingProposal}
                    setIsCreatingProposal={setIsCreatingProposal}
                />
            )}
        </>
    )
}

export default StartBar
