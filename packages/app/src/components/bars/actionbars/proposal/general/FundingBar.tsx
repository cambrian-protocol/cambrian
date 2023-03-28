import { Button, Text } from 'grommet'
import React, { useState } from 'react'
import { Swap, UsersFour } from 'phosphor-react'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import BaseActionbar from '../../BaseActionbar'
import FundProposalModal from '@cambrian/app/ui/proposals/modals/FundProposalModal'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import Proposal from '@cambrian/app/classes/stages/Proposal'
import { ethers } from 'ethers'
import { useProposalFunding } from '@cambrian/app/hooks/useProposalFunding'

interface IFundingBar {
    proposal: Proposal
}

const FundingBar = ({ proposal }: IFundingBar) => {
    const { funding, fundingGoal, fundingPercentage } = useProposalFunding(
        proposal.onChainProposal?.id
    )
    const [isExecuting, setIsExecuting] = useState(false)
    const [showProposalFundingModal, setShowProposalFundingModal] =
        useState(false)
    const toggleShowProposalFundingModal = () =>
        setShowProposalFundingModal(!showProposalFundingModal)

    const onExecuteProposal = async () => {}

    return (
        <>
            <BaseActionbar
                primaryAction={
                    fundingPercentage === 100 ? (
                        <LoaderButton
                            isLoading={isExecuting}
                            primary
                            label="Execute"
                            onClick={onExecuteProposal}
                        />
                    ) : (
                        <Button
                            primary
                            label="Fund Proposal"
                            onClick={toggleShowProposalFundingModal}
                        />
                    )
                }
                secondaryAction={
                    fundingPercentage === 100 ? (
                        <Button
                            secondary
                            label="Defund Proposal"
                            onClick={toggleShowProposalFundingModal}
                        />
                    ) : undefined
                }
                info={{
                    title: `${fundingPercentage}% funded`,
                    subTitle: `${
                        funding &&
                        ethers.utils.formatUnits(
                            funding,
                            proposal.collateralToken.decimals
                        )
                    } ${proposal.collateralToken.symbol} pledged of ${
                        fundingGoal &&
                        ethers.utils.formatUnits(
                            fundingGoal,
                            proposal.collateralToken.decimals
                        )
                    } ${proposal.collateralToken.symbol}`,
                    dropContent: (
                        <ActionbarItemDropContainer
                            title="Proposal funding"
                            description="Back the Project with your funds"
                            list={[
                                {
                                    icon: <UsersFour />,
                                    label: 'Proposal can be funded by anyone',
                                    description: (
                                        <Text size="small" color="dark-4">
                                            Share it and collect funds from your
                                            community
                                        </Text>
                                    ),
                                },
                                {
                                    icon: <Swap />,
                                    label: 'Changed your mind?',
                                    description: (
                                        <Text size="small" color="dark-4">
                                            Funds can be withdrawn until the
                                            Proposal has been executed
                                        </Text>
                                    ),
                                },
                            ]}
                        />
                    ),
                }}
            />
            {showProposalFundingModal && (
                <FundProposalModal
                    onClose={toggleShowProposalFundingModal}
                    proposal={proposal}
                />
            )}
        </>
    )
}

export default FundingBar
