import {
    ArrowSquareIn,
    Scales,
    Timer,
    TreeStructure,
    UsersThree,
    Vault,
} from 'phosphor-react'
import React, { useState } from 'react'
import {
    getManualInputs,
    getSolverRecipientSlots,
} from '@cambrian/app/components/solver/SolverHelpers'

import BaseMenuListItem from '../buttons/BaseMenuListItem'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import KeeperInputsModal from '../modals/KeeperInputsModal'
import OutcomeCollectionModal from '../modals/OutcomeCollectionModal'
import RecipientsModal from '../modals/RecipientsModal'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import TokenAvatar from '@cambrian/app/components/avatars/TokenAvatar'
import { ethers } from 'ethers'
import { parseSecondsToDisplay } from '@cambrian/app/utils/helpers/timeParsing'

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
                    subTitle={parseSecondsToDisplay(
                        solverData.config.timelockSeconds
                    )}
                />
                <BaseMenuListItem
                    title="Escrow Balance"
                    icon={<Vault />}
                    subTitle={
                        solverData.numMintedTokensByCondition
                            ? `${ethers.utils.formatUnits(
                                  solverData.numMintedTokensByCondition[
                                      currentCondition.conditionId
                                  ],
                                  solverData.collateralToken.decimals
                              )}  ${
                                  solverData.collateralToken.symbol ||
                                  solverData.collateralToken.name ||
                                  ''
                              }`
                            : '0'
                    }
                />
                <BaseMenuListItem
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
                    <BaseMenuListItem
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
