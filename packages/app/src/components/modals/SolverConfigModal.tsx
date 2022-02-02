import { Coin, Coins, Timer, UsersThree } from 'phosphor-react'

import BaseLayerModal from './BaseLayerModal'
import { Box } from 'grommet'
import HeaderTextSection from '../sections/HeaderTextSection'
import PlainListInfoItem from '../list/PlainListInfoItem'
import PlainMenuListItem from '../buttons/PlainMenuListItem'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import React from 'react'

interface SolverConfigModalProps {
    onClose: () => void
}

const SolverConfigModal = ({ onClose }: SolverConfigModalProps) => {
    return (
        <BaseLayerModal onClose={onClose}>
            <Box gap="medium">
                <HeaderTextSection
                    title="Solver configuration"
                    paragraph="Configuration Description. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. Nam nec justo ultricies, tristique justo eget, dignissim turpis. "
                />
                <Box gap="small" height={{ min: 'auto' }}>
                    <PlainMenuListItem
                        icon={<UsersThree />}
                        label="Recipients"
                        onClick={() => {}}
                    />
                    <PlainSectionDivider />
                    <PlainMenuListItem
                        icon={<UsersThree />}
                        label="Outcomes"
                        onClick={() => {}}
                    />
                    <PlainSectionDivider />
                    <PlainMenuListItem
                        icon={<UsersThree />}
                        label="Keeper Inputs"
                        onClick={() => {}}
                    />
                    <PlainSectionDivider />
                </Box>
                <Box gap="medium">
                    <PlainListInfoItem
                        label="Timelock"
                        icon={<Timer />}
                        info="4 Days - 12 hours"
                    />
                    <PlainListInfoItem
                        label="Token address"
                        icon={<Coin />}
                        showTip
                        info="0x0917901850928y92857921875928759827b9287b592875b92"
                    />
                    <PlainListInfoItem
                        label="Balance"
                        icon={<Coins />}
                        info="1000"
                    />
                </Box>
            </Box>
        </BaseLayerModal>
    )
}

export default SolverConfigModal
