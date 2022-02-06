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
import { Box } from 'grommet'
import HeaderTextSection from '../../../components/sections/HeaderTextSection'
import KeeperInputsModal from '../../../components/modals/KeeperInputsModal'
import OutcomeCollectionModal from '../../../components/modals/OutcomeCollectionModal'
import PlainSectionDivider from '../../../components/sections/PlainSectionDivider'
import RecipientsModal from '../../../components/modals/RecipientsModal'

const SolverConfigInfo = () => {
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
                    subTitle="4 Days - 12 hours"
                />
                <BaseMenuListItem
                    title="Token address"
                    icon={<Coin />}
                    subTitle="0x0917901850928y92857921875928759827b9287b592875b92"
                />
                <BaseMenuListItem
                    title="Balance"
                    icon={<Coins />}
                    subTitle="1000"
                />
            </Box>
            {showRecipientModal && (
                <RecipientsModal onBack={toggleShowRecipientModal} />
            )}
            {showKeeperInputModal && (
                <KeeperInputsModal onBack={toggleShowKeeperInputModal} />
            )}
            {showOutcomeModal && (
                <OutcomeCollectionModal onBack={toggleShowOutcomeModal} />
            )}
        </>
    )
}

export default SolverConfigInfo
