import {
    ArrowSquareIn,
    Cube,
    Gear,
    StackSimple,
    TreeStructure,
    UserList,
} from 'phosphor-react'
import { useEffect, useState } from 'react'

import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import { Box } from 'grommet'
import Breadcrump from '@cambrian/app/components/nav/Breadcrump'
import ComposerModuleList from './moduleList/ComposerModuleList'
import ComposerOutcomeList from './outcomeList/ComposerOutcomeList'
import ComposerRecipientList from './recipientList/ComposerRecipientList'
import ComposerSlotList from './slotList/ComposerSlotList'
import FloatingActionButton from '@cambrian/app/components/buttons/FloatingActionButton'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import SidebarCard from '@cambrian/app/components/cards/SidebarCard'
import SidebarCardBody from '@cambrian/app/components/cards/SidebarCardBody'
import SidebarCardFooter from '@cambrian/app/components/cards/SidebarCardFooter'
import SidebarCardHeader from '@cambrian/app/components/cards/SidebarCardHeader'
import SolverSettingsModal from './general/modals/SolverSettingsModal'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'

export type SolverControllerType =
    | 'MainControl'
    | 'SlotControl'
    | 'RecipientListControl'
    | 'OutcomeListControl'
    | 'TimingControl'
    | 'Modules'

export const ComposerSolverControl = () => {
    const { dispatch, currentSolver } = useComposerContext()

    const [showSolverSettingsModal, setShowSolverSettingsModal] =
        useState(false)

    const toggleShowSolverSettingsModal = () =>
        setShowSolverSettingsModal(!showSolverSettingsModal)

    const [controller, setController] =
        useState<SolverControllerType>('MainControl')

    useEffect(() => {
        setController('MainControl')
    }, [currentSolver])

    const handleAttachOutcomeCollection = () => {
        dispatch({
            type: 'ATTACH_NEW_OUTCOME_COLLECTION',
        })
    }

    function renderControl() {
        switch (controller) {
            case 'RecipientListControl':
                return <ComposerRecipientList />
            case 'OutcomeListControl':
                return <ComposerOutcomeList />
            case 'SlotControl':
                return <ComposerSlotList />
            case 'Modules':
                return <ComposerModuleList />
            default:
                return <></>
        }
    }

    return (
        <>
            <SidebarCard>
                <SidebarCardHeader title={currentSolver?.solverTag.title} />
                <Breadcrump
                    onBack={
                        controller !== 'MainControl'
                            ? () => setController('MainControl')
                            : undefined
                    }
                />
                <SidebarCardBody>
                    {controller === 'MainControl' ? (
                        <>
                            <Box
                                gap="small"
                                fill
                                overflow={{ vertical: 'auto' }}
                            >
                                <HeaderTextSection
                                    title="Solver"
                                    subTitle="Fine tune your Solver"
                                    paragraph="Directly edit settings and data. Or, add flags for later editing in templates and proposals."
                                />
                                <Box gap="small">
                                    <BaseMenuListItem
                                        icon={<Gear />}
                                        title="Settings"
                                        onClick={toggleShowSolverSettingsModal}
                                    />
                                    <BaseMenuListItem
                                        icon={<TreeStructure />}
                                        title="Outcome list"
                                        onClick={() =>
                                            setController('OutcomeListControl')
                                        }
                                    />
                                    <BaseMenuListItem
                                        icon={<UserList />}
                                        title={'Recipient list'}
                                        onClick={() =>
                                            setController(
                                                'RecipientListControl'
                                            )
                                        }
                                    />
                                    <BaseMenuListItem
                                        icon={<ArrowSquareIn />}
                                        title={'Slot list'}
                                        onClick={() =>
                                            setController('SlotControl')
                                        }
                                    />
                                    <BaseMenuListItem
                                        icon={<Cube />}
                                        title={'Modules'}
                                        onClick={() => setController('Modules')}
                                    />
                                    <Box pad="medium" />
                                </Box>
                            </Box>
                            <SidebarCardFooter>
                                <FloatingActionButton
                                    onClick={handleAttachOutcomeCollection}
                                    label="Attach Outcome collection"
                                    icon={<StackSimple size="24" />}
                                />
                            </SidebarCardFooter>
                        </>
                    ) : (
                        <>{renderControl()}</>
                    )}
                </SidebarCardBody>
            </SidebarCard>
            {showSolverSettingsModal && currentSolver && (
                <SolverSettingsModal
                    onClose={toggleShowSolverSettingsModal}
                    solver={currentSolver}
                />
            )}
        </>
    )
}
