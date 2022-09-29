import { Box, Text } from 'grommet'
import {
    RedeemablePosition,
    RedeemablePositionsHash,
    getRedeemablePositions,
} from '@cambrian/app/utils/helpers/redeemHelper'
import { useEffect, useState } from 'react'

import CTFContract from '@cambrian/app/contracts/CTFContract'
import ListSkeleton from '@cambrian/app/components/skeletons/ListSkeleton'
import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import { ethers } from 'ethers'

interface RedeemableTokensWidgetProps {
    address: string
    signerOrProvider: ethers.Signer | ethers.providers.Provider
    chainId: number
}

const RedeemableTokenListWidget = ({
    address,
    signerOrProvider,
    chainId,
}: RedeemableTokensWidgetProps) => {
    const [redeemablePositions, setRedeemablePositions] =
        useState<RedeemablePositionsHash>()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        try {
            setIsLoading(true)
            setRedeemablePositions(
                await getRedeemablePositions(address, signerOrProvider, chainId)
            )
        } catch (e) {}
        setIsLoading(false)
    }

    const onRedeem = async (redeemablePosition: RedeemablePosition) => {
        try {
            const ctfContract = new CTFContract(signerOrProvider, chainId)
            await ctfContract.contract.redeemPositions(
                redeemablePosition.collateralToken.address,
                redeemablePosition.parentCollectionId,
                redeemablePosition.conditionId,
                redeemablePosition.partition
            )
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            {redeemablePositions &&
            Object.keys(redeemablePositions).length > 0 ? (
                <Box gap="small">
                    {Object.keys(redeemablePositions).map((positionId, idx) => {
                        const redeemablePosition =
                            redeemablePositions[positionId]
                        const formattedAmount = ethers.utils.formatUnits(
                            redeemablePositions[positionId].amount,
                            redeemablePosition.collateralToken.decimals
                        )
                        return (
                            <Box
                                key={positionId}
                                pad="small"
                                border
                                round="xsmall"
                                direction="row"
                            >
                                <Box
                                    flex
                                    direction="row"
                                    justify="between"
                                    pad={{
                                        left: 'small',
                                        right: 'medium',
                                        vertical: 'small',
                                    }}
                                    align="center"
                                >
                                    <Box>
                                        <Text>
                                            {redeemablePosition.solverMetadata
                                                ?.solverTag.title || 'Solver'}
                                        </Text>
                                        <Text color={'dark-4'} size="small">
                                            {
                                                redeemablePositions[positionId]
                                                    .solverAddress
                                            }
                                        </Text>
                                    </Box>
                                    <Text>
                                        {formattedAmount}{' '}
                                        {
                                            redeemablePosition.collateralToken
                                                .symbol
                                        }
                                    </Text>
                                </Box>
                                <Box justify="center">
                                    <LoaderButton
                                        primary
                                        onClick={() =>
                                            onRedeem(redeemablePosition)
                                        }
                                        isLoading={false}
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
