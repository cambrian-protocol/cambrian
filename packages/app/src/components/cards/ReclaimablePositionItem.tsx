import { BigNumber, ethers } from 'ethers'
import {
    PayoutInfo,
    ReclaimablePositionType,
    truncateAmount,
} from '@cambrian/app/utils/helpers/redeemHelper'
import { PropsWithChildren, useState } from 'react'

import { Box } from 'grommet'
import ClaimItem from '../list/ClaimItem'
import LoaderButton from '../buttons/LoaderButton'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { UserType } from '@cambrian/app/store/UserContext'

interface ReclaimablePositionItemProps {
    proposalId: string
    collateralToken: TokenModel
    reclaimablePosition: ReclaimablePositionType
    currentUser: UserType
    updateReclaimableTokens: () => Promise<void>
    fundingGoal: BigNumber
    recipientPayout?: PayoutInfo
}

const ReclaimablePositionItem = ({
    reclaimablePosition,
    proposalId,
    currentUser,
    collateralToken,
    updateReclaimableTokens,
    children,
    recipientPayout,
    fundingGoal,
}: ReclaimablePositionItemProps & PropsWithChildren<{}>) => {
    const proposalsHub = new ProposalsHub(
        currentUser.signer,
        currentUser.chainId
    )
    const [isReclaiming, setIsReclaiming] = useState<string>()

    const reclaimERC1155Tokens = async (
        proposalId: string,
        positionId: string
    ) => {
        setIsReclaiming(positionId)
        try {
            const tx: ethers.ContractTransaction =
                await proposalsHub.contract.reclaimTokens(
                    proposalId,
                    positionId
                )
            await tx.wait()
            await updateReclaimableTokens()
        } catch {}
        setIsReclaiming(undefined)
    }

    return (
        <Box gap="small">
            {recipientPayout && (
                <Box gap="medium">
                    <ClaimItem
                        amount={recipientPayout.amount}
                        collateralToken={collateralToken}
                        descriptions={[
                            `Percentage: ${Number(
                                recipientPayout.percentage
                            )}%`,
                        ]}
                        note={`${Number(
                            recipientPayout.percentage
                        )}% of ${ethers.utils.formatUnits(fundingGoal)} ${
                            collateralToken.name
                        }`}
                        title="Recipient share"
                    />
                    <PlainSectionDivider />
                </Box>
            )}
            <Box gap="small">
                <ClaimItem
                    amount={reclaimablePosition.funderReclaimableAmount}
                    collateralToken={collateralToken}
                    descriptions={[
                        `Total refund: ${ethers.utils.formatUnits(
                            reclaimablePosition.totalReclaimable
                        )} ${collateralToken.name}`,
                        `Your invested funds: 
                                ${ethers.utils.formatUnits(
                                    reclaimablePosition.funderAmount
                                )} ${collateralToken.name} (${
                            reclaimablePosition.percentage
                        }%)`,
                    ]}
                    note={`${
                        reclaimablePosition.percentage
                    }% of ${ethers.utils.formatUnits(
                        reclaimablePosition.totalReclaimable
                    )} ${collateralToken.name}`}
                    title={
                        reclaimablePosition.funderReclaimed.eq(0)
                            ? 'Claimable refunds'
                            : 'Claimed refunds'
                    }
                />
            </Box>
            <Box gap="small">
                {reclaimablePosition.funderReclaimed.eq(0) && (
                    <LoaderButton
                        isLoading={
                            isReclaiming === reclaimablePosition.positionId
                        }
                        primary
                        label={`Claim ${truncateAmount(
                            ethers.utils.formatUnits(
                                reclaimablePosition.funderReclaimableAmount,
                                collateralToken.decimals
                            )
                        )} ${collateralToken.symbol}`}
                        onClick={() => {
                            reclaimERC1155Tokens(
                                proposalId,
                                reclaimablePosition.positionId
                            )
                        }}
                    />
                )}
                {children}
            </Box>
        </Box>
    )
}

export default ReclaimablePositionItem
