import { Box, Button, Text } from 'grommet'
import {
    RedeemablePosition,
    RedeemablePositionsHash,
    getAllRedeemablePositions,
} from '@cambrian/app/utils/helpers/redeemHelper'
import { useEffect, useState } from 'react'

import CTFContract from '@cambrian/app/contracts/CTFContract'
import Link from 'next/link'
import ListSkeleton from '@cambrian/app/components/skeletons/ListSkeleton'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { useErrorContext } from '@cambrian/app/hooks/useErrorContext'

interface RedeemableTokensWidgetProps {
    currentUser: UserType
}

const RedeemableTokenListWidget = ({
    currentUser,
}: RedeemableTokensWidgetProps) => {
    const { setAndLogError } = useErrorContext()
    const [redeemablePositions, setRedeemablePositions] =
        useState<RedeemablePositionsHash>()
    const [isLoading, setIsLoading] = useState(true)
    const [isRedeeming, setIsRedeeming] = useState<string>()

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        try {
            const redeemablePositions = await getAllRedeemablePositions(
                currentUser
            )
            setRedeemablePositions(redeemablePositions)
        } catch (e) {
            setAndLogError(e)
        }
        setIsLoading(false)
    }

    const onRedeem = async (redeemablePosition: RedeemablePosition) => {
        try {
            setIsRedeeming(redeemablePosition.positionId)
            const ctfContract = new CTFContract(
                currentUser.signer,
                currentUser.chainId
            )
            const tx: ethers.ContractTransaction =
                await ctfContract.contract.redeemPositions(
                    redeemablePosition.collateralToken.address,
                    redeemablePosition.parentCollectionId,
                    redeemablePosition.conditionId,
                    redeemablePosition.partition
                )
            await tx.wait()
            await init()
        } catch (e) {
            setAndLogError(e)
        }
        setIsRedeeming(undefined)
    }

    return (
        <>
            {redeemablePositions &&
            Object.keys(redeemablePositions).length > 0 ? (
                <Box gap="small">
                    {Object.keys(redeemablePositions).map((positionId) => {
                        const redeemablePosition =
                            redeemablePositions[positionId]
                        const formattedAmount = ethers.utils.formatUnits(
                            redeemablePositions[positionId].amount,
                            redeemablePosition.collateralToken.decimals
                        )
                        return (
                            <Box
                                key={positionId}
                                pad={{
                                    horizontal: 'medium',
                                    vertical: 'small',
                                }}
                                border
                                round="xsmall"
                                direction="row"
                            >
                                <Box flex>
                                    <Link
                                        href={`/solver/${redeemablePosition.solverAddress}`}
                                        passHref
                                    >
                                        <Button>
                                            <Box
                                                focusIndicator={false}
                                                direction="row"
                                                justify="between"
                                                pad={{
                                                    right: 'medium',
                                                }}
                                                align="center"
                                            >
                                                <Box>
                                                    <Text
                                                        size="small"
                                                        color="dark-4"
                                                    >
                                                        Solver
                                                    </Text>
                                                    <Text>
                                                        {redeemablePosition
                                                            .solverMetadata
                                                            ?.solverTag.title ||
                                                            'Unnamed'}
                                                    </Text>
                                                </Box>
                                                <Text>
                                                    {formattedAmount}{' '}
                                                    {
                                                        redeemablePosition
                                                            .collateralToken
                                                            .symbol
                                                    }
                                                </Text>
                                            </Box>
                                        </Button>
                                    </Link>
                                </Box>
                                <Box justify="center">
                                    <LoaderButton
                                        primary
                                        onClick={() =>
                                            onRedeem(redeemablePosition)
                                        }
                                        isLoading={
                                            isRedeeming ===
                                            redeemablePosition.positionId
                                        }
                                        label="Redeem"
                                    />
                                </Box>
                            </Box>
                        )
                    })}
                </Box>
            ) : (
                <ListSkeleton
                    isFetching={isLoading}
                    subject="redeemable tokens"
                />
            )}
        </>
    )
}

export default RedeemableTokenListWidget
