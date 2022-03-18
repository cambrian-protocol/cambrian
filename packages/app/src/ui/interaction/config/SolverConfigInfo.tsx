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

import BaseMenuListItem from '../../../components/buttons/BaseMenuListItem'
import { BasicSolverMethodsType } from '@cambrian/app/components/solver/Solver'
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
    solverMethods: BasicSolverMethodsType
    currentCondition: SolverContractCondition
}

// TODO Dynamic solver description
const SolverConfigInfo = ({
    solverData,
    solverMethods,
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
                    info={solverData.slotTags['timelockSeconds']?.description}
                    title="Timelock"
                    icon={<Timer />}
                    subTitle={solverData.config.timelockSeconds.toString()}
                />
                <BaseMenuListItem
                    info={solverData.slotTags['collateralToken']?.description}
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
                    recipientAddresses={solverMethods.getRecipientSlots(
                        currentCondition
                    )}
                />
            )}
            {showKeeperInputModal && (
                <KeeperInputsModal
                    onBack={toggleShowKeeperInputModal}
                    manualInputs={solverMethods.getManualInputs(
                        currentCondition
                    )}
                />
            )}
            {showOutcomeModal && (
                <OutcomeCollectionModal
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
