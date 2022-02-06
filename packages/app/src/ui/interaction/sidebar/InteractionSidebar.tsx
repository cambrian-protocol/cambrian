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

import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import SideNav from '@cambrian/app/components/nav/SideNav'
import SidebarSolverItem from '@cambrian/app/components/nav/SidebarSolverItem'

interface InteractionSidebarProps {}

const InteractionSidebar = ({}: InteractionSidebarProps) => {
    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => (
                <Box
                    flex
                    direction="row"
                    height="100vh"
                    width={
                        screenSize === 'small'
                            ? { min: '90vw', max: '90vw' }
                            : { min: '50vw', max: '50vw' }
                    }
                >
                    <SideNav>
                        <SidebarSolverItem active onClick={() => {}} />
                        <SidebarSolverItem active={false} onClick={() => {}} />
                    </SideNav>
                    <Card
                        fill
                        round="small"
                        margin={{ right: 'small' }}
                        background="background-front"
                    >
                        <CardHeader pad="medium" elevation="small">
                            <Text>Solver Title {screenSize}</Text>
                            <Text size="small" color="dark-3">
                                v1.0
                            </Text>
                        </CardHeader>
                        <CardBody
                            pad="medium"
                            gap="small"
                            overflow={{ vertical: 'scroll' }}
                        >
                            <Box gap="medium" height={{ min: 'auto' }}>
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
                            <Box gap="medium" height={{ min: 'auto' }}>
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

export default InteractionSidebar
