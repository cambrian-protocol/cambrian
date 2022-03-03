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
    SolverContractCondition,
    SolverModel,
} from '@cambrian/app/models/SolverModel'

import BaseMenuListItem from '../../../components/buttons/BaseMenuListItem'
import { BasicSolverMethodsType } from '@cambrian/app/components/solver/Solver'
import { Box } from 'grommet'
import HeaderTextSection from '../../../components/sections/HeaderTextSection'
import KeeperInputsModal from '../../../components/modals/KeeperInputsModal'
import OutcomeCollectionModal from '../../../components/modals/OutcomeCollectionModal'
import PlainSectionDivider from '../../../components/sections/PlainSectionDivider'
import RecipientsModal from '../../../components/modals/RecipientsModal'
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
                title={solverData.metaData[0]?.title}
                subTitle="Solver configuration"
                paragraph="This Solver is designed for a buyer to source articles for the purposes of content marketing. "
            />
            <Box gap="small" fill="horizontal">
                <BaseMenuListItem
                    icon={<UsersThree />}
                    title="Recipients"
                    onClick={toggleShowRecipientModal}
                />
                <PlainSectionDivider />
                <BaseMenuListItem
                    icon={<TreeStructure />}
                    title="Outcomes"
                    onClick={toggleShowOutcomeModal}
                />
                <PlainSectionDivider />
                <BaseMenuListItem
                    icon={<ArrowSquareIn />}
                    title="Keeper Inputs"
                    onClick={toggleShowKeeperInputModal}
                />
                <PlainSectionDivider />
                <BaseMenuListItem
                    info={solverData.metaData[0]?.tags['timelockSeconds']?.text}
                    title="Timelock"
                    icon={<Timer />}
                    subTitle={solverData.config.timelockSeconds.toString()}
                />
                <BaseMenuListItem
                    info={solverData.metaData[0]?.tags['collateralToken']?.text}
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
