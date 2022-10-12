import { Box, Button, Text } from 'grommet'
import { Coins, Swap, UsersFour } from 'phosphor-react'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import BaseActionbar from '../BaseActionbar'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import FundProposalForm from '@cambrian/app/ui/proposals/forms/FundProposalForm'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { useProposalFunding } from '@cambrian/app/hooks/useProposalFunding'
import { useState } from 'react'

interface ProposalFundingActionbarProps {
    messenger?: JSX.Element
    proposalContract: ethers.Contract
    currentUser: UserType
}

const ProposalFundingActionbar = ({
    messenger,
    currentUser,
    proposalContract,
}: ProposalFundingActionbarProps) => {
    const { funding, fundingGoal, collateralToken, fundingPercentage } =
        useProposalFunding(proposalContract.id)
    const [showProposalFundingModal, setShowProposalFundingModal] =
        useState(false)

    const toggleShowProposalFundingModal = () =>
        setShowProposalFundingModal(!showProposalFundingModal)

    return (
        <>
            {funding && fundingGoal && collateralToken && (
                <BaseActionbar
                    messenger={messenger}
                    primaryAction={
                        <Button
                            onClick={toggleShowProposalFundingModal}
                            label="Fund Proposal"
                            size="small"
                            primary
                        />
                    }
                    info={{
                        title: `${fundingPercentage}% funded`,
                        subTitle: `${ethers.utils.formatUnits(
                            funding,
                            collateralToken.decimals
                        )} ${
                            collateralToken.symbol
                        } pledged of ${ethers.utils.formatUnits(
                            fundingGoal,
                            collateralToken.decimals
                        )} ${collateralToken.symbol}`,
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
                                                Share it and collect funds from
                                                your community
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
            )}
            {showProposalFundingModal && (
                <BaseLayerModal onBack={toggleShowProposalFundingModal}>
                    <ModalHeader
                        title="Fund this Proposal"
                        icon={<Coins />}
                        description={
                            'Invested funds can be withdrawn until the Proposal has been executed'
                        }
                    />
                    <Box height={{ min: 'auto' }}>
                        <FundProposalForm
                            currentUser={currentUser}
                            proposalContract={proposalContract}
                        />
                    </Box>
                </BaseLayerModal>
            )}
        </>
    )
}

export default ProposalFundingActionbar
