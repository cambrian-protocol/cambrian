import { Box, Heading, Text } from 'grommet'
import { useEffect, useState } from 'react'

import { BASE_SOLVER_IFACE } from 'packages/app/config/ContractInterfaces'
import BaseTokenItem from '../token/BaseTokenItem'
import CTFContract from '@cambrian/app/contracts/CTFContract'
import { CheckCircle } from 'phosphor-react'
import LoaderButton from '../buttons/LoaderButton'
import { PriceModel } from '../bars/actionbars/proposal/ProposalReviewActionbar'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { ReclaimablePositionType } from '@cambrian/app/utils/helpers/redeemHelper'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'

interface ReclaimablePositionItemProps {
    proposalId: string
    reclaimablePosition: ReclaimablePositionType
    proposalPriceInfo: PriceModel
    solverAddress: string
    currentUser: UserType
    updateReclaimableTokens: () => Promise<void>
}

const ReclaimablePositionItem = ({
    reclaimablePosition,
    proposalPriceInfo,
    proposalId,
    solverAddress,
    currentUser,
    updateReclaimableTokens,
}: ReclaimablePositionItemProps) => {
    const proposalsHub = new ProposalsHub(
        currentUser.signer,
        currentUser.chainId
    )
    const ctf = new CTFContract(currentUser.signer, currentUser.chainId)
    const hasReclaimed = !reclaimablePosition.funderReclaimed.eq(0)
    const funderPercentage = proposalPriceInfo.amount
        ? (Number(ethers.utils.formatUnits(reclaimablePosition.funderAmount)) *
              100) /
          proposalPriceInfo.amount
        : 0

    const [isReclaiming, setIsReclaiming] = useState<string>()
    const [hasRedeemed, setHasRedeemed] = useState(false)

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        const solverContract = new ethers.Contract(
            solverAddress,
            BASE_SOLVER_IFACE,
            currentUser.signer
        )
        const conditions: SolverContractCondition[] =
            await solverContract.getConditions()
        if (conditions && conditions.length > 0) {
            const condition = conditions.find(
                (c) => c.conditionId === reclaimablePosition.conditionId
            )
            if (condition) {
                const payoutRedemptionFilter =
                    ctf.contract.filters.PayoutRedemption(
                        currentUser.address,
                        proposalPriceInfo.token?.address,
                        null,
                        null,
                        null
                    )

                const logs = await ctf.contract.queryFilter(
                    payoutRedemptionFilter
                )
                const conditionLogs = logs.filter(
                    (l) => l.args?.conditionId == condition.conditionId
                )
                if (conditionLogs.length > 0) {
                    setHasRedeemed(true)
                }
            }
        }
    }

    const redeemTokens = async (conditionId: string) => {
        setIsReclaiming(solverAddress)
        try {
            const solverContract = new ethers.Contract(
                solverAddress,
                BASE_SOLVER_IFACE,
                currentUser.signer
            )
            const conditions: SolverContractCondition[] =
                await solverContract.getConditions()
            if (conditions && conditions.length > 0) {
                const condition = conditions.find(
                    (c) => c.conditionId === conditionId
                )
                if (condition) {
                    const solverConfig = await solverContract.getConfig()
                    const tx: ethers.ContractTransaction =
                        await ctf.contract.redeemPositions(
                            proposalPriceInfo.token?.address,
                            condition.parentCollectionId,
                            conditionId,
                            solverConfig.conditionBase.partition
                        )

                    const rc = await tx.wait()
                    if (
                        rc.events?.find(
                            (event) => event.event === 'PayoutRedemption'
                        )
                    ) {
                        setHasRedeemed(true)
                    }
                }
            }
        } catch {}
        setIsReclaiming(undefined)
    }

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
        <Box gap="medium">
            <Box direction="row">
                <Box flex gap="small">
                    <Heading level="4">Reclaimable funds</Heading>
                    <Box direction="row" align="end">
                        <Box flex gap="xsmall">
                            <Text color="dark-4" size="small">
                                Total funding: {proposalPriceInfo.amount}{' '}
                                {proposalPriceInfo.token?.name}
                            </Text>
                            <Text color="dark-4" size="small">
                                Total reclaimable:{' '}
                                {ethers.utils.formatUnits(
                                    reclaimablePosition.totalReclaimable
                                )}{' '}
                                {proposalPriceInfo.token?.name}
                            </Text>
                            <Text color="dark-4" size="small">
                                Your invested funds:{' '}
                                {ethers.utils.formatUnits(
                                    reclaimablePosition.funderAmount
                                )}{' '}
                                {proposalPriceInfo.token?.name} (
                                {funderPercentage}%)
                            </Text>
                        </Box>
                        <Box>
                            <Text size="xsmall" color="dark-4">
                                {funderPercentage}% of{' '}
                                {ethers.utils.formatUnits(
                                    reclaimablePosition.totalReclaimable
                                )}{' '}
                                {proposalPriceInfo.token?.symbol}
                            </Text>
                            <Box direction="row" gap="small" align="center">
                                <Box width={{ min: 'xsmall' }}>
                                    <Text weight={'bold'} size="xlarge">
                                        {ethers.utils.formatUnits(
                                            reclaimablePosition.funderReclaimableAmount
                                        )}
                                    </Text>
                                </Box>
                                <BaseTokenItem
                                    tokenAddress={
                                        proposalPriceInfo.token?.address
                                    }
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box flex gap="small">
                <LoaderButton
                    isLoading={isReclaiming === reclaimablePosition.positionId}
                    disabled={hasReclaimed}
                    secondary
                    label={
                        hasReclaimed
                            ? 'Reclaimed your ERC1155 Tokens'
                            : 'Reclaim your ERC1155 Tokens'
                    }
                    icon={hasReclaimed ? <CheckCircle /> : undefined}
                    onClick={() => {
                        reclaimERC1155Tokens(
                            proposalId,
                            reclaimablePosition.positionId
                        )
                    }}
                />
                <LoaderButton
                    isLoading={isReclaiming === solverAddress}
                    disabled={
                        reclaimablePosition.funderReclaimed.eq(0) || hasRedeemed
                    }
                    primary
                    label={`${
                        hasRedeemed
                            ? 'Succesfully redeemed your'
                            : 'Redeem your'
                    } ${proposalPriceInfo.token?.symbol}`}
                    onClick={() => {
                        redeemTokens(reclaimablePosition.conditionId)
                    }}
                />
            </Box>
        </Box>
    )
}

export default ReclaimablePositionItem
