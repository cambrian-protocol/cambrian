import {
    ArrowSquareIn,
    Coin,
    Coins,
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
import PlainSectionDivider from '../../../components/sections/PlainSectionDivider'
import RecipientsModal from '../../../components/modals/RecipientsModal'
import { SolverContractData } from '@cambrian/app/models/SolverModel'
import { useCurrentSolver } from '@cambrian/app/hooks/useCurrentSolver'

interface SolverConfigInfoProps {
    solverData: SolverContractData
    solverMethods: BasicSolverMethodsType
}

const SolverConfigInfo = ({
    solverData,
    solverMethods,
}: SolverConfigInfoProps) => {
    const { currentCondition } = useCurrentSolver()

    // TODO Error handling
    if (!currentCondition) return null

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
                title="Solver configuration"
                subTitle="Details about the"
                paragraph="Configuration Description. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
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
                    title="Timelock"
                    icon={<Timer />}
                    subTitle={solverData.config.timelockSeconds.toString()}
                />
                <BaseMenuListItem
                    title="Token address"
                    icon={<Coin />}
                    subTitle={solverData.config.conditionBase.collateralToken}
                />
                <BaseMenuListItem
                    title="Balance"
                    icon={<Coins />}
                    subTitle={''}
                />
            </Box>
            {showRecipientModal && (
                <RecipientsModal
                    onBack={toggleShowRecipientModal}
                    recipientAddresses={solverMethods.getRecipientAddresses(
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
                    allocations={
                        solverData.allocationsHistory[
                            currentCondition.conditionId
                        ]
                    }
                    outcomeCollections={solverData.outcomeCollections}
                />
            )}
        </>
    )
}

export default SolverConfigInfo
