import { Box, Button, Text } from 'grommet'
import {
    ErrorMessageType,
    GENERAL_ERROR,
} from '@cambrian/app/constants/ErrorMessages'
import { Swap, UsersFour } from 'phosphor-react'

import ActionbarItemDropContainer from '@cambrian/app/components/containers/ActionbarItemDropContainer'
import BaseActionbar from '../BaseActionbar'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import FundProposalForm from '@cambrian/app/ui/proposals/forms/FundProposalForm'
import IPFSSolutionsHub from '@cambrian/app/hubs/IPFSSolutionsHub'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { SolverConfigModel } from '@cambrian/app/models/SolverConfigModel'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { ceramicInstance } from '@cambrian/app/services/ceramic/CeramicUtils'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
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
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [isExecuting, setIsExecuting] = useState(false)

    const toggleShowProposalFundingModal = () =>
        setShowProposalFundingModal(!showProposalFundingModal)

    const onExecuteProposal = async () => {
        setIsExecuting(true)
        try {
            // Retrieving SolverConfigs from Solution
            const solutionsHub = new IPFSSolutionsHub(
                currentUser.signer,
                currentUser.chainId
            )
            const solution = await solutionsHub.getSolution(
                proposalContract.solutionId
            )

            if (!solution) throw GENERAL_ERROR['SOLUTION_FETCH_ERROR']

            if (solution.solverConfigsURI) {
                const solverConfigDoc = (await TileDocument.load(
                    ceramicInstance(currentUser),
                    solution.solverConfigsURI
                )) as TileDocument<{ solverConfigs: SolverConfigModel[] }>

                if (
                    solverConfigDoc.content !== null &&
                    typeof solverConfigDoc.content === 'object'
                ) {
                    const proposalsHub = new ProposalsHub(
                        currentUser.signer,
                        currentUser.chainId
                    )
                    await proposalsHub.executeProposal(
                        proposalContract.id,
                        solverConfigDoc.content.solverConfigs
                    )
                }
            }
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
            setIsExecuting(false)
        }
    }

    return (
        <>
            {funding && fundingGoal && collateralToken && (
                <BaseActionbar
                    messenger={messenger}
                    primaryAction={
                        fundingPercentage === 100 ? (
                            <LoaderButton
                                isLoading={isExecuting}
                                onClick={onExecuteProposal}
                                label="Execute"
                                size="small"
                                primary
                            />
                        ) : (
                            <Button
                                onClick={toggleShowProposalFundingModal}
                                label="Fund Proposal"
                                size="small"
                                primary
                            />
                        )
                    }
                    secondaryAction={
                        fundingPercentage === 100 ? (
                            <Button
                                onClick={toggleShowProposalFundingModal}
                                label="Defund"
                                size="small"
                                secondary
                            />
                        ) : undefined
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
                                description="Invest in this Project and back it with your funds."
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
            {showProposalFundingModal && collateralToken && (
                <BaseLayerModal onBack={toggleShowProposalFundingModal}>
                    <ModalHeader
                        title="Proposal funding"
                        description={
                            'Your funding can be withdrawn until the Proposal has been executed'
                        }
                    />
                    <Box height={{ min: 'auto' }}>
                        <FundProposalForm
                            collateralToken={collateralToken}
                            currentUser={currentUser}
                            proposalContract={proposalContract}
                        />
                    </Box>
                </BaseLayerModal>
            )}
            {errorMessage && (
                <ErrorPopupModal
                    onClose={() => setErrorMessage(undefined)}
                    errorMessage={errorMessage}
                />
            )}
        </>
    )
}

export default ProposalFundingActionbar
