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

import PlainMenuListItem from '../buttons/PlainMenuListItem'
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
                    width={
                        screenSize === 'small'
                            ? { min: '90vw', max: '90vw' }
                            : { min: '30vw', max: '30vw' }
                    }
                >
                    <Box
                        background="secondaryGradient"
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
                        background="itemHighlight"
                    >
                        <CardHeader pad="medium" elevation="small">
                            <Text>Solver Title</Text>
                            <Text size="small" color="dark-3">
                                v1.0
                            </Text>
                        </CardHeader>
                        <CardBody pad="medium" gap="large">
                            <Box gap="medium">
                                <Box direction="row" gap="small">
                                    <SpinnerGap size="24" />
                                    <Text>Current</Text>
                                </Box>
                                <Text size="small" color="dark-6">
                                    Current solver version description text,
                                    Lorem ipsum dolor sit amet, consectetur
                                    adipiscing elit. Suspendisse vel erat et
                                    enim blandit pharetra. Nam nec justo
                                    ultricies, tristique justo ege.
                                </Text>
                                <PlainMenuListItem
                                    label="Executed"
                                    icon={<Rocket />}
                                    onClick={() => {}}
                                    isActive
                                />
                            </Box>
                            <Box gap="medium">
                                <PlainSectionDivider />
                                <Box direction="row" gap="small">
                                    <ClockCounterClockwise size="24" />
                                    <Text>History</Text>
                                </Box>
                                <Text size="small" color="dark-6">
                                    History solver version description text,
                                    Lorem ipsum dolor sit amet, consectetur
                                    adipiscing elit. Suspendisse vel erat et
                                    enim blandit pharetra.
                                </Text>
                                <PlainMenuListItem
                                    label="Outcome reported"
                                    icon={<Handshake />}
                                    onClick={() => {}}
                                />
                                <PlainMenuListItem
                                    label="Outcome reported"
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
