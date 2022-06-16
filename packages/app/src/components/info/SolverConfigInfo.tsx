import {
    ShieldCheck,
    Scales,
    Timer,
    TreeStructure,
    UsersThree,
    Vault,
    Faders,
} from 'phosphor-react'
import { BigNumber, ethers } from 'ethers'
import React, { useEffect, useState } from 'react'
import { getSolverRecipientSlots } from '@cambrian/app/components/solver/SolverHelpers'

import BaseListItemButton from '../buttons/BaseListItemButton'
import { Box } from 'grommet'
import CTFContract from '@cambrian/app/contracts/CTFContract'
import { ConditionStatus } from '@cambrian/app/models/ConditionStatus'
import KeeperInputsModal from '@cambrian/app/ui/common/modals/KeeperInputsModal'
import OutcomeCollectionModal from '@cambrian/app/ui/common/modals/OutcomeCollectionModal'
import RecipientsModal from '../../ui/common/modals/RecipientsModal'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { parseSecondsToDisplay } from '@cambrian/app/utils/helpers/timeParsing'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import ModalHeader from '../layout/header/ModalHeader'

interface SolverConfigInfoProps {
    solverData: SolverModel
    currentCondition: SolverContractCondition
}

const SolverConfigInfo = ({
    solverData,
    currentCondition,
}: SolverConfigInfoProps) => {
    const { currentUser } = useCurrentUser()
    const [showRecipientModal, setShowRecipientModal] = useState(false)
    const [showOutcomeModal, setShowOutcomeModal] = useState(false)
    const [showKeeperInputModal, setShowKeeperInputModal] = useState(false)
    const [currentEscrow, setCurrentEscrow] = useState<string>()

    const toggleShowOutcomeModal = () => setShowOutcomeModal(!showOutcomeModal)
    const toggleShowKeeperInputModal = () =>
        setShowKeeperInputModal(!showKeeperInputModal)
    const toggleShowRecipientModal = () =>
        setShowRecipientModal(!showRecipientModal)

    useEffect(() => {
        initEscrow()
    }, [])

    const initEscrow = async () => {
        if (solverData.numMintedTokensByCondition) {
            const numMintedTokens =
                solverData.numMintedTokensByCondition[
                    currentCondition.conditionId
                ]
            let alreadyRedeemed = BigNumber.from(0)

            if (
                currentCondition.status ===
                    ConditionStatus.ArbitrationDelivered ||
                currentCondition.status === ConditionStatus.OutcomeReported
            ) {
                if (currentUser.signer && currentUser.chainId) {
                    const ctf = new CTFContract(
                        currentUser.signer,
                        currentUser.chainId
                    )

                    const payoutRedemptionFilter =
                        ctf.contract.filters.PayoutRedemption(
                            null,
                            solverData.config.conditionBase.collateralToken,
                            currentCondition.parentCollectionId,
                            null,
                            null,
                            null
                        )

                    const logs = await ctf.contract.queryFilter(
                        payoutRedemptionFilter
                    )
                    const conditionLogs = logs.filter(
                        (l) =>
                            l.args?.conditionId == currentCondition.conditionId
                    )

                    alreadyRedeemed = conditionLogs
                        .map((l) => l.args?.payout)
                        .filter(Boolean)
                        .reduce((x, y) => {
                            return BigNumber.from(x).add(BigNumber.from(y))
                        }, BigNumber.from(0))
                }
            }

            const totalEscrow = numMintedTokens.sub(alreadyRedeemed)

            setCurrentEscrow(
                ethers.utils.formatUnits(
                    totalEscrow,
                    solverData.collateralToken.decimals
                )
            )
        }
    }

    return (
        <>
            <ModalHeader
                title="Solver Configuration"
                icon={<Faders />}
                metaInfo={solverData.solverTag?.title}
                description={solverData.solverTag?.description}
            />
            <Box gap="small" fill="horizontal" height={{ min: 'auto' }}>
                <BaseListItemButton
                    hideDivider
                    icon={<UsersThree />}
                    title="Recipients"
                    onClick={toggleShowRecipientModal}
                />
                <BaseListItemButton
                    hideDivider
                    icon={<TreeStructure />}
                    title="Outcomes"
                    onClick={toggleShowOutcomeModal}
                />
                <BaseListItemButton
                    hideDivider
                    icon={<ShieldCheck />}
                    title="Keeper Inputs"
                    onClick={toggleShowKeeperInputModal}
                />
                <BaseListItemButton
                    info={
                        solverData.slotTags
                            ? solverData.slotTags['timelockSeconds']
                                  ?.description
                            : undefined
                    }
                    title="Timelock"
                    icon={<Timer />}
                    subTitle={parseSecondsToDisplay(
                        solverData.config.timelockSeconds
                    )}
                />
                <BaseListItemButton
                    title="Escrow Balance"
                    icon={<Vault />}
                    subTitle={
                        currentEscrow
                            ? `${currentEscrow}  ${
                                  solverData.collateralToken.symbol ||
                                  solverData.collateralToken.name ||
                                  ''
                              }`
                            : '0'
                    }
                />
                <BaseListItemButton
                    info={
                        solverData.slotTags
                            ? solverData.slotTags['collateralToken']
                                  ?.description
                            : undefined
                    }
                    title="Token Info"
                    icon={<TokenAvatar token={solverData.collateralToken} />}
                    subTitle={solverData.collateralToken.address}
                />
                {solverData.config.arbitrator !== '' && (
                    <BaseListItemButton
                        info={
                            solverData.slotTags
                                ? solverData.slotTags['arbitrator']?.description
                                : undefined
                        }
                        title="Arbitrator"
                        icon={<Scales />}
                        subTitle={solverData.config.arbitrator}
                    />
                )}
            </Box>
            {showRecipientModal && (
                <RecipientsModal
                    onBack={toggleShowRecipientModal}
                    recipientAddresses={getSolverRecipientSlots(
                        solverData,
                        currentCondition
                    )}
                />
            )}
            {showKeeperInputModal && (
                <KeeperInputsModal
                    onBack={toggleShowKeeperInputModal}
                    solverData={solverData}
                    currentCondition={currentCondition}
                />
            )}
            {showOutcomeModal && (
                <OutcomeCollectionModal
                    token={solverData.collateralToken}
                    onBack={toggleShowOutcomeModal}
                    outcomeCollections={
                        solverData.outcomeCollections[
                            currentCondition.conditionId
                        ]
                    }
                />
            )}
        </>
    )
}

export default SolverConfigInfo
