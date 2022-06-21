import { Box, Tab, Tabs, Text } from 'grommet'
import { useEffect, useState } from 'react'

import CeramicStagehand from '@cambrian/app/classes/CeramicStagehand'
import DashboardLayout from '@cambrian/app/components/layout/DashboardLayout'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { SelfID } from '@self.id/framework'
import { StageNames } from '@cambrian/app/classes/Stagehand'
import { ellipseAddress } from '@cambrian/app/utils/helpers/ellipseAddress'

interface DashboardUIProps {
    walletAddress: string
    selfID: SelfID
}

// TODO WIP
// TODO Mock Dashboard UI
// TODO Shallow routed sidebar tabs
const DashboardUI = ({ walletAddress, selfID }: DashboardUIProps) => {
    const ceramicStagehand = new CeramicStagehand(selfID)

    const [templates, setTemplates] = useState()
    const [proposals, setProposals] = useState()
    const [compositions, setCompositions] =
        useState<{ [key: string]: string }>()

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        const compositions = (await ceramicStagehand.loadStages(
            StageNames.composition
        )) as { [key: string]: string }
        setCompositions(compositions)

        const templates = (await ceramicStagehand.loadStages(
            StageNames.template
        )) as { [key: string]: string }
    }

    return (
        <DashboardLayout contextTitle="Dashboard">
            <Box direction="row" fill pad={'large'}>
                <Box
                    width={'small'}
                    border={{ side: 'right' }}
                    justify="around"
                >
                    <Text>{ellipseAddress(walletAddress)}</Text>
                    <Text>User data</Text>
                    <Text>Email</Text>
                    <Text>Webhook</Text>
                    <Text>Team</Text>
                </Box>
                <Tabs>
                    <Tab title="Solvers"></Tab>
                    <Tab title="Active Proposals"></Tab>
                    <Tab title="Proposal Drafts"></Tab>
                    <Tab title="Templates"></Tab>
                    <Tab title="Compositions">
                        {compositions && Object.keys(compositions).length > 0 && (
                            <Box fill="horizontal" pad="small" gap="small">
                                <Text>Compositions</Text>
                                <PlainSectionDivider />
                                <Box direction="row" gap="small">
                                    {Object.keys(compositions).map(
                                        (compositionKey) => (
                                            <TempDashboardTile
                                                key={
                                                    compositions[compositionKey]
                                                }
                                                title={compositionKey}
                                                id={
                                                    compositions[compositionKey]
                                                }
                                            />
                                        )
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Tab>
                </Tabs>
            </Box>
        </DashboardLayout>
    )
}

export default DashboardUI

const TempDashboardTile = ({ title, id }: { title: string; id: string }) => {
    return (
        <Box
            height="xsmall"
            width={'small'}
            background="background-contrast"
            round="xsmall"
            justify="center"
            align="center"
        >
            {title}
        </Box>
    )
}
