import {
    ArrowSquareIn,
    Coin,
    Coins,
    Handshake,
    Timer,
    TreeStructure,
    UsersThree,
} from 'phosphor-react'
import React, { useState } from 'react'
import {
    getManualInputs,
    getSolverRecipientSlots,
} from '@cambrian/app/components/solver/SolverHelpers'

import BaseMenuListItem from '../../../components/buttons/BaseMenuListItem'
import { Box } from 'grommet'
import HeaderTextSection from '../../../components/sections/HeaderTextSection'
import KeeperInputsModal from '../../../components/modals/KeeperInputsModal'
import OutcomeCollectionModal from '../../../components/modals/OutcomeCollectionModal'
import RecipientsModal from '../../../components/modals/RecipientsModal'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { formatDecimals } from '@cambrian/app/utils/helpers/tokens'

interface SolverConfigInfoProps {
    solverData: SolverModel
    currentCondition: SolverContractCondition
}

const SolverConfigInfo = ({
    solverData,
    currentCondition,
}: SolverConfigInfoProps) => {
    const [showRecipientModal, setShowRecipientModal] = useState(false)
    const [showOutcomeModal, setShowOutcomeModal] = useState(false)
    const [showKeeperInputModal, setShowKeeperInputModal] = useState(false)

    const toggleShowOutcomeModal = () => setShowOutcomeModal(!showOutcomeModal)
    const toggleShowKeeperInputModal = () =>
        setShowKeeperInputModal(!showKeeperInputModal)
    const toggleShowRecipientModal = () =>
        setShowRecipientModal(!showRecipientModal)

    return (
        <>
            <HeaderTextSection
                title={solverData.solverTag?.title || 'No Solver title set'}
                subTitle="Solver configuration"
                paragraph={
                    solverData.solverTag?.description ||
                    'No Solver description set'
                }
            />
            <Box gap="small" fill="horizontal">
                <BaseMenuListItem
                    icon={<UsersThree />}
                    title="Recipients"
                    onClick={toggleShowRecipientModal}
                />
                <BaseMenuListItem
                    icon={<TreeStructure />}
                    title="Outcomes"
                    onClick={toggleShowOutcomeModal}
                />
                <BaseMenuListItem
                    icon={<ArrowSquareIn />}
                    title="Keeper Inputs"
                    onClick={toggleShowKeeperInputModal}
                />
                <BaseMenuListItem
                    info={
                        solverData.slotTags
                            ? solverData.slotTags['timelockSeconds']
                                  ?.description
                            : undefined
                    }
                    title="Timelock"
                    icon={<Timer />}
                    subTitle={solverData.config.timelockSeconds.toString()}
                />
                <BaseMenuListItem
                    info={
                        solverData.slotTags
                            ? solverData.slotTags['collateralToken']
                                  ?.description
                            : undefined
                    }
                    title="Token"
                    icon={<Coin />}
                    subTitle={`${solverData.collateralToken.address} ${
                        solverData.collateralToken.symbol ||
                        solverData.collateralToken.name ||
                        ''
                    }`}
                />
                <BaseMenuListItem
                    title="Collateral Balance"
                    icon={<Coins />}
                    subTitle={`${formatDecimals(
                        solverData.collateralToken,
                        solverData.collateralBalance
                    ).toString()}`}
                />
                <BaseMenuListItem
                    title="Escrow Balance"
                    icon={<Handshake />}
                    subTitle={
                        solverData.numMintedTokensByCondition
                            ? `${formatDecimals(
                                  solverData.collateralToken,
                                  solverData.numMintedTokensByCondition[
                                      currentCondition.conditionId
                                  ]
                              ).toString()}`
                            : '0'
                    }
                />
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
                    manualInputs={getManualInputs(solverData, currentCondition)}
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
