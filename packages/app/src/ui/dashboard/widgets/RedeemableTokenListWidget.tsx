import { Box, Button, Text } from 'grommet'
import {
    RedeemablePosition,
    RedeemablePositionsHash,
    getRedeemablePositions,
} from '@cambrian/app/utils/helpers/redeemHelper'
import { useEffect, useState } from 'react'

import CTFContract from '@cambrian/app/contracts/CTFContract'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import Link from 'next/link'
import ListSkeleton from '@cambrian/app/components/skeletons/ListSkeleton'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'

interface RedeemableTokensWidgetProps {
    currentUser: UserType
}

const RedeemableTokenListWidget = ({
    currentUser,
}: RedeemableTokensWidgetProps) => {
    const [redeemablePositions, setRedeemablePositions] =
        useState<RedeemablePositionsHash>()
    const [isLoading, setIsLoading] = useState(false)
    const [isRedeeming, setIsRedeeming] = useState<string>()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        try {
            setRedeemablePositions(await getRedeemablePositions(currentUser))
        } catch (e) {}
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
            setErrorMessage(await cpLogger.push(e))
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
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default RedeemableTokenListWidget
