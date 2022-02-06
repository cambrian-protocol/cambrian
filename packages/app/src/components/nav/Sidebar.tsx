import {
    Box,
    Card,
    CardBody,
    CardHeader,
    ResponsiveContext,
    Text,
} from 'grommet'
import {
    ClockCounterClockwise,
    Handshake,
    Rocket,
    SpinnerGap,
} from 'phosphor-react'

import BaseMenuListItem from '../buttons/BaseMenuListItem'
import PlainSectionDivider from '../sections/PlainSectionDivider'
import React from 'react'
import SidebarSolverItem from './SidebarSolverItem'
import UserMenu from './UserMenu'

interface SidebarProps {}

const Sidebar = ({}: SidebarProps) => {
    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => (
                <Box
                    flex
                    elevation="small"
                    direction="row"
                    height={{ min: 'auto' }}
                    width={
                        screenSize === 'small'
                            ? { min: '90vw', max: '90vw' }
                            : { min: '30vw', max: '30vw' }
                    }
                >
                    <Box
                        background="secondary-gradient"
                        fill="vertical"
                        pad={{ vertical: 'large' }}
                        justify="between"
                        width={{ min: 'auto' }}
                        round={{ corner: 'right', size: 'small' }}
                    >
                        <Box gap="large">
                            <SidebarSolverItem active onClick={() => {}} />
                            <SidebarSolverItem
                                active={false}
                                onClick={() => {}}
                            />
                        </Box>
                        <Box>
                            <PlainSectionDivider margin="medium" />
                            <UserMenu />
                        </Box>
                    </Box>
                    <Card
                        fill
                        round="small"
                        margin={{ horizontal: 'small' }}
                        background="background-front"
                        height={{ min: 'auto' }}
                    >
                        <CardHeader pad="medium" elevation="small">
                            <Text>Solver Title {screenSize}</Text>
                            <Text size="small" color="dark-3">
                                v1.0
                            </Text>
                        </CardHeader>
                        <CardBody pad="medium" gap="large">
                            <Box gap="medium">
                                <Box direction="row" gap="small">
                                    <Box>
                                        <SpinnerGap size="24" />
                                    </Box>
                                    <Text>Current</Text>
                                </Box>
                                <Text size="small" color="dark-6">
                                    Current solver version description text,
                                    Lorem ipsum dolor sit amet, consectetur
                                    adipiscing elit. Suspendisse vel erat et
                                    enim blandit pharetra. Nam nec justo
                                    ultricies, tristique justo ege.
                                </Text>
                                <BaseMenuListItem
                                    title="Executed"
                                    icon={<Rocket />}
                                    onClick={() => {}}
                                    isActive
                                />
                            </Box>
                            <Box gap="medium">
                                <PlainSectionDivider />
                                <Box direction="row" gap="small">
                                    <Box>
                                        <ClockCounterClockwise size="24" />
                                    </Box>
                                    <Text>History</Text>
                                </Box>
                                <Text size="small" color="dark-6">
                                    History solver version description text,
                                    Lorem ipsum dolor sit amet, consectetur
                                    adipiscing elit. Suspendisse vel erat et
                                    enim blandit pharetra.
                                </Text>
                                <BaseMenuListItem
                                    title="Outcome reported"
                                    icon={<Handshake />}
                                    onClick={() => {}}
                                />
                                <BaseMenuListItem
                                    title="Outcome reported"
                                    icon={<Handshake />}
                                    onClick={() => {}}
                                />
                            </Box>
                        </CardBody>
                    </Card>
                </Box>
            )}
        </ResponsiveContext.Consumer>
    )
}

export default Sidebar
