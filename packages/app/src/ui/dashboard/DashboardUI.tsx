import { Box, Heading, Tab, Tabs, Text } from 'grommet'
import {
    ClipboardText,
    File,
    IconContext,
    Scales,
    TreeStructure,
    UserCircle,
} from 'phosphor-react'
import { useEffect, useState } from 'react'

import ArbitrationDashboardUI from './ArbitrationDashboardUI'
import { CambrianStagesLibType } from '@cambrian/app/models/StageModel'
import CompositionsDashboardUI from './CompositionsDashboardUI'
import { ErrorMessageType } from '@cambrian/app/constants/ErrorMessages'
import ErrorPopupModal from '@cambrian/app/components/modals/ErrorPopupModal'
import PageLayout from '@cambrian/app/components/layout/PageLayout'
import ProfileDashboardUI from './ProfileDashboardUI'
import ProposalsDashboardUI from './ProposalsDashboardUI'
import TemplatesDashboardUI from './TemplatesDashboardUI'
import { UserType } from '@cambrian/app/store/UserContext'
import { cpLogger } from '@cambrian/app/services/api/Logger.api'
import { loadStagesLib } from '@cambrian/app/services/ceramic/CeramicUtils'

interface DashboardUIProps {
    currentUser: UserType
}

const DashboardUI = ({ currentUser }: DashboardUIProps) => {
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [stagesLib, setStagesLib] = useState<CambrianStagesLibType>()
    const [isFetching, setIsFetching] = useState(false)

    useEffect(() => {
        initDocSubsciption()
    }, [])

    const initDocSubsciption = async () => {
        const stagesLib = await loadStagesLib(currentUser)
        const sub = stagesLib.subscribe(() => {
            initStagesLib()
        })
        return () => {
            sub.unsubscribe()
        }
    }

    const initStagesLib = async () => {
        setIsFetching(true)
        try {
            setStagesLib((await loadStagesLib(currentUser)).content)
        } catch (e) {
            setErrorMessage(await cpLogger.push(e))
        }
        setIsFetching(false)
    }

    return (
        <>
            <PageLayout contextTitle="Proposals">
                <Box pad="large" gap="medium">
                    <Heading>Dashboard</Heading>
                    <Text color="dark-4">
                        Welcome back,{' '}
                        {currentUser.cambrianProfileDoc.content.name}!
                    </Text>
                    <IconContext.Provider
                        value={{ size: '24', color: 'white' }}
                    >
                        <Tabs alignControls="start">
                            <Tab title="Templates" icon={<File />}>
                                <TemplatesDashboardUI
                                    currentUser={currentUser}
                                    templatesLib={stagesLib?.templates}
                                />
                            </Tab>
                            <Tab title="Proposals" icon={<ClipboardText />}>
                                <ProposalsDashboardUI
                                    currentUser={currentUser}
                                    proposalsLib={stagesLib?.proposals}
                                />
                            </Tab>
                            <Tab title="Compositions" icon={<TreeStructure />}>
                                <CompositionsDashboardUI
                                    isFetching={isFetching}
                                    currentUser={currentUser}
                                    compositionsLib={stagesLib?.compositions}
                                />
                            </Tab>
                            <Tab title="Arbitration" icon={<Scales />}>
                                <ArbitrationDashboardUI
                                    currentUser={currentUser}
                                />
                            </Tab>
                            <Tab title="Profile" icon={<UserCircle />}>
                                <ProfileDashboardUI currentUser={currentUser} />
                            </Tab>
                        </Tabs>
                    </IconContext.Provider>
                </Box>
            </PageLayout>
            {errorMessage && (
                <ErrorPopupModal
                    errorMessage={errorMessage}
                    onClose={() => setErrorMessage(undefined)}
                />
            )}
        </>
    )
}

export default DashboardUI