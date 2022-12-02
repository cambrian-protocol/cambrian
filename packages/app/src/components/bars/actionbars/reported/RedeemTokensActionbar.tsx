import BaseActionbar, {
    ActionbarInfoType,
} from '@cambrian/app/components/bars/actionbars/BaseActionbar'
import { Box, Button, Text } from 'grommet'
import { Coin, Info } from 'phosphor-react'
import {
    ReclaimablePositionType,
    ReclaimableTokensType,
    getReclaimableTokensFromSolver,
    truncateAmount,
} from '@cambrian/app/utils/helpers/redeemHelper'
import { useEffect, useState } from 'react'

import ActionbarItemDropContainer from '../../../containers/ActionbarItemDropContainer'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '../../../modals/ErrorPopupModal'
import LoaderButton from '../../../buttons/LoaderButton'
import ReclaimTokensModal from '@cambrian/app/ui/common/modals/ReclaimTokensModal'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { ethers } from 'ethers'
import useRedeem from '@cambrian/app/hooks/useRedeem'

interface RedeemTokensActionbarProps {
    solverAddress: string
    currentUser: UserType
    currentCondition: SolverContractCondition
    solverData: SolverModel
    messenger?: JSX.Element
}

const RedeemTokensActionbar = ({
    solverAddress,
    currentCondition,
    solverData,
    currentUser,
    messenger,
}: RedeemTokensActionbarProps) => {
    const { payoutInfo, redeemedAmount, ctfContract, isLoaded } = useRedeem(
        currentUser,
        solverData,
        currentCondition
    )
    const [isRedeeming, setIsRedeeming] = useState(false)
    const [errMsg, setErrMsg] = useState<ErrorMessageType>()
    const [reclaimableTokens, setReclaimableTokens] =
        useState<ReclaimableTokensType>()
    const [showReclaimTokenModal, setShowReclaimTokenModal] = useState(false)
    const toggleShowReclaimTokenModal = () =>
        setShowReclaimTokenModal(!showReclaimTokenModal)
    const [reclaimablePosition, setReclaimablePosition] =
        useState<ReclaimablePositionType>()

    useEffect(() => {
        initReclaimableTokens()
    }, [currentUser])

    const initReclaimableTokens = async () => {
        const _reclaimableTokens = await getReclaimableTokensFromSolver(
            solverAddress,
            currentCondition.conditionId,
            currentUser
        )

        setReclaimableTokens(_reclaimableTokens)
        setReclaimablePosition(
            _reclaimableTokens?.reclaimableSolvers[solverAddress].find(
                (position) =>
                    position.conditionId === currentCondition.conditionId
            )
        )
    }

    /**
     * Each condition must be redeemed independently
     * TODO "Redeem Tokens" action may want to open a modal showing seperate redeemable value for each condition
     */
    const redeemCondition = async () => {
        setIsRedeeming(true)
        try {
            await ctfContract.redeemPositions(
                solverData.config.conditionBase.collateralToken,
                currentCondition.parentCollectionId,
                currentCondition.conditionId,
                solverData.config.conditionBase.partition
            )
        } catch (e) {
            setErrMsg(await cpLogger.push(e))
            setIsRedeeming(false)
        }
    }

    let actionbarInfo: ActionbarInfoType

    if (redeemedAmount) {
        actionbarInfo = {
            title: 'Tokens redeemed',
            subTitle: 'You have sucessfully redeemed your token.',
            dropContent: (
                <ActionbarItemDropContainer
                    title="Tokens redeemed"
                    description="You have sucessfully redeemed your token. There is nothing more to do here."
                    list={[
                        {
                            icon: <Info />,
                            label: "If you can't see the token in your wallet, try to import the token manually",
                        },
                        {
                            icon: <Coin />,
                            label: `Token address: ${solverData.collateralToken.address}`,
                        },
                    ]}
                />
            ),
        }
    } else {
        actionbarInfo = {
            title: 'Redeem tokens',
            subTitle: `You are eglible to redeem ${
                payoutInfo &&
                truncateAmount(
                    ethers.utils.formatUnits(
                        payoutInfo.amount.add(
                            reclaimablePosition?.funderReclaimableAmount || 0
                        ),
                        solverData.collateralToken.decimals
                    )
                )
            } ${
                solverData.collateralToken
                    ? solverData.collateralToken.symbol
                    : 'Tokens'
            }`,
            dropContent: (
                <ActionbarItemDropContainer
                    title="Redeem tokens"
                    description='Hit the "Redeem Tokens"-Button and confirm the transaction to receive your share.'
                />
            ),
        }
    }

    const reclaimInfo = {
        title: 'Reclaim tokens',
        subTitle: 'You have tokens to reclaim',
        dropContent: (
            <ActionbarItemDropContainer
                title="Reclaim tokens"
                description='Hit the "Reclaim Tokens"-Button, reclaim and redeem your invested fundings.'
                list={[]}
            />
        ),
    }

    return (
        <>
            {isLoaded ? (
                redeemedAmount ? (
                    <BaseActionbar
                        messenger={messenger}
                        info={actionbarInfo}
                        primaryAction={
                            <Box>
                                <Text size="small" color="dark-4">
                                    Succesfully redeemed
                                </Text>
                                <Text textAlign="end">{`${truncateAmount(
                                    ethers.utils.formatUnits(
                                        redeemedAmount,
                                        solverData.collateralToken.decimals
                                    )
                                )} ${
                                    solverData.collateralToken
                                        ? solverData.collateralToken.symbol ||
                                          solverData.collateralToken.name
                                        : 'Tokens'
                                }`}</Text>
                            </Box>
                        }
                    />
                ) : payoutInfo?.amount.gt(0) ? (
                    <BaseActionbar
                        messenger={messenger}
                        info={actionbarInfo}
                        primaryAction={
                            reclaimableTokens &&
                            reclaimablePosition?.funderReclaimed.eq(0) ? (
                                <Button
                                    label="Claim Refund"
                                    primary
                                    size="small"
                                    onClick={toggleShowReclaimTokenModal}
                                />
                            ) : (
                                <LoaderButton
                                    primary
                                    isLoading={isRedeeming}
                                    onClick={redeemCondition}
                                    label={`Redeem ${truncateAmount(
                                        ethers.utils.formatUnits(
                                            payoutInfo.amount.add(
                                                reclaimablePosition?.funderReclaimableAmount ||
                                                    0
                                            )
                                        )
                                    )}
                                 ${
                                     solverData.collateralToken
                                         ? solverData.collateralToken.symbol ||
                                           solverData.collateralToken.name
                                         : 'Tokens'
                                 }`}
                                />
                            )
                        }
                    />
                ) : (
                    <BaseActionbar
                        messenger={messenger}
                        info={reclaimableTokens ? reclaimInfo : undefined}
                        primaryAction={
                            reclaimableTokens ? (
                                <Button
                                    label="Claim Refund"
                                    primary
                                    size="small"
                                    onClick={toggleShowReclaimTokenModal}
                                />
                            ) : undefined
                        }
                    />
                )
            ) : (
                <></>
            )}
            {showReclaimTokenModal &&
                reclaimableTokens &&
                reclaimablePosition?.funderReclaimed.eq(0) && (
                    <ReclaimTokensModal
                        currentUser={currentUser}
                        recipientPayout={payoutInfo}
                        onClose={toggleShowReclaimTokenModal}
                        reclaimableTokens={reclaimableTokens}
                        updateReclaimableTokens={initReclaimableTokens}
                    />
                )}
            {errMsg && (
                <ErrorPopupModal
                    onClose={() => setErrMsg(undefined)}
                    errorMessage={errMsg}
                />
            )}
        </>
    )
}

export default RedeemTokensActionbar
