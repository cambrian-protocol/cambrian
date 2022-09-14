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
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { UserType } from '@cambrian/app/store/UserContext'
import { loadStagesLib } from '@cambrian/app/services/ceramic/CeramicUtils'

interface DashboardUIProps {
    currentUser: UserType
}

const DashboardUI = ({ currentUser }: DashboardUIProps) => {
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>()
    const [stagesLibDoc, setStagesLibDoc] =
        useState<TileDocument<CambrianStagesLibType>>()

    useEffect(() => {
        initStagesLib()
    }, [])

    /* TODO init Doc-Listeners     
    useEffect(() => {
        if (stagesLibDoc) {
            const stagesLibSub = stagesLibDoc.subscribe(async () => {
                initStagesLib()
            })
            return () => {
                stagesLibSub.unsubscribe()
            }
        }
    }, [stagesLibDoc]) */

    const initStagesLib = async () => {
        const stagesLib = await loadStagesLib(currentUser)
        setStagesLibDoc(stagesLib)
    }

    return (
        <>
            <PageLayout contextTitle="Proposals">
                <Box pad="large" gap="medium">
                    <Heading>Cambrian Dashboard</Heading>
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
                                    templatesLib={
                                        stagesLibDoc?.content.templates
                                    }
                                />
                            </Tab>
                            <Tab title="Proposals" icon={<ClipboardText />}>
                                <ProposalsDashboardUI
                                    currentUser={currentUser}
                                />
                            </Tab>
                            <Tab title="Compositions" icon={<TreeStructure />}>
                                <CompositionsDashboardUI
                                    currentUser={currentUser}
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
