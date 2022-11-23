import { ArrowFatRight, CheckCircle } from 'phosphor-react'
import { Box, Text } from 'grommet'

import { BASE_SOLVER_IFACE } from 'packages/app/config/ContractInterfaces'
import BaseLayerModal from '@cambrian/app/components/modals/BaseLayerModal'
import BaseTokenItem from '@cambrian/app/components/token/BaseTokenItem'
import CTFContract from '@cambrian/app/contracts/CTFContract'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import ModalHeader from '@cambrian/app/components/layout/header/ModalHeader'
import ProposalsHub from '@cambrian/app/hubs/ProposalsHub'
import { ReclaimableTokensType } from '@cambrian/app/utils/helpers/redeemHelper'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { useState } from 'react'

interface ReclaimTokensModalProps {
    reclaimableTokens: ReclaimableTokensType
    collateralTokenAddress: string
    currentUser: UserType
    onClose: () => void
    initReclaimableTokens: () => Promise<void>
}

const ReclaimTokensModal = ({
    onClose,
    reclaimableTokens,
    collateralTokenAddress,
    currentUser,
    initReclaimableTokens,
}: ReclaimTokensModalProps) => {
    const ctf = new CTFContract(currentUser.signer, currentUser.chainId)
    const proposalsHub = new ProposalsHub(
        currentUser.signer,
        currentUser.chainId
    )
    const [isReclaiming, setIsReclaiming] = useState<string>()

    // TODO Multiple conditions
    const redeemTokens = async (solverAddress: string) => {
        setIsReclaiming(solverAddress)
        try {
            const solverContract = new ethers.Contract(
                solverAddress,
                BASE_SOLVER_IFACE,
                currentUser.signer
            )
            const solverConfig = await solverContract.getConfig()
            const conditions = await solverContract.getConditions()
            if (conditions.length > 0) {
                const tx: ethers.ContractTransaction =
                    await ctf.contract.redeemPositions(
                        solverConfig.conditionBase.collateralToken,
                        conditions[conditions.length - 1].parentCollectionId,
                        conditions[conditions.length - 1].conditionId,
                        solverConfig.conditionBase.partition
                    )

                await tx.wait()
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
            await initReclaimableTokens()
        } catch {}
        setIsReclaiming(undefined)
    }

    return (
        <BaseLayerModal onClose={onClose}>
            <ModalHeader
                title="You have tokens to reclaim"
                description="Hit the reclaim button to receive your ERC1155 Tokens with which you can redeem your tokens."
            />
            <Box height={{ min: 'auto' }}>
                {Object.keys(reclaimableTokens.reclaimableSolvers).map(
                    (solverAddress) => (
                        <Box
                            border
                            background={'background-front'}
                            pad="small"
                            round="xsmall"
                        >
                            {reclaimableTokens.reclaimableSolvers[
                                solverAddress
                            ].map((reclaimablePosition) => {
                                const hasReclaimed =
                                    !reclaimablePosition.funderReclaimed.eq(0)
                                return (
                                    <Box gap="small">
                                        <Box direction="row">
                                            <Box>
                                                <Text
                                                    size="small"
                                                    color="dark-4"
                                                >
                                                    Reclaimable
                                                </Text>
                                                <Box
                                                    direction="row"
                                                    gap="small"
                                                    align="center"
                                                >
                                                    <Text
                                                        weight={'bold'}
                                                        size="large"
                                                    >
                                                        {ethers.utils.formatUnits(
                                                            reclaimablePosition.funderReclaimableAmount
                                                        )}
                                                    </Text>
                                                    <BaseTokenItem
                                                        tokenAddress={
                                                            collateralTokenAddress
                                                        }
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box
                                            direction="row"
                                            gap="small"
                                            justify="end"
                                            align="center"
                                        >
                                            <LoaderButton
                                                isLoading={
                                                    isReclaiming ===
                                                    reclaimablePosition.positionId
                                                }
                                                disabled={hasReclaimed}
                                                secondary
                                                label={
                                                    hasReclaimed
                                                        ? 'Reclaimed'
                                                        : 'Reclaim'
                                                }
                                                icon={
                                                    hasReclaimed ? (
                                                        <CheckCircle />
                                                    ) : undefined
                                                }
                                                onClick={() => {
                                                    reclaimERC1155Tokens(
                                                        reclaimableTokens.proposalId,
                                                        reclaimablePosition.positionId
                                                    )
                                                }}
                                            />
                                            <ArrowFatRight size="18" />
                                            <LoaderButton
                                                isLoading={
                                                    isReclaiming ===
                                                    solverAddress
                                                }
                                                disabled={reclaimablePosition.funderReclaimed.eq(
                                                    0
                                                )}
                                                primary
                                                label={'Redeem'}
                                                onClick={() => {
                                                    redeemTokens(solverAddress)
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                )
                            })}
                        </Box>
                    )
                )}
            </Box>
        </BaseLayerModal>
    )
}

export default ReclaimTokensModal
