import { ListPlus, UsersThree } from 'phosphor-react'
import { useEffect, useState } from 'react'

import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import { Box } from 'grommet'
import Breadcrump from '@cambrian/app/components/nav/Breadcrump'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import OutcomeSelectionList from './outcomeSelection/OutcomeSelectionList'
import RecipientAllocationList from './recipientAmount/RecipientAllocationList'
import SidebarCard from '@cambrian/app/components/cards/SidebarCard'
import SidebarCardBody from '@cambrian/app/components/cards/SidebarCardBody'
import SidebarCardHeader from '@cambrian/app/components/cards/SidebarCardHeader'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'

export type OutcomeCollectionControllerType =
    | 'MainControl'
    | 'OutcomeSelectionControl'
    | 'RecipientAllocationControl'

/* TODO 
- Warn if two collections with the same outcomes are attached to the Solver 
*/
const ComposerOutcomeCollectionControl = () => {
    const { currentSolver, currentIdPath } = useComposerContext()
    const [controller, setController] =
        useState<OutcomeCollectionControllerType>('MainControl')

    useEffect(() => {
        setController('MainControl')
    }, [currentSolver])

    // TODO Error handling
    if (currentIdPath === undefined || currentIdPath.ocId === undefined) {
        return null
    }

    function renderControl() {
        switch (controller) {
            case 'OutcomeSelectionControl':
                return <OutcomeSelectionList />
            case 'RecipientAllocationControl':
                return <RecipientAllocationList />
            default:
                return <></>
        }
    }

    return (
        <SidebarCard>
            <SidebarCardHeader title={'Outcome Collection'} />
            <Breadcrump
                onBack={
                    controller !== 'MainControl'
                        ? () => setController('MainControl')
                        : undefined
                }
            />
            <SidebarCardBody>
                {controller === 'MainControl' ? (
                    <Box gap="medium">
                        <HeaderTextSection
                            title="Outcome collection"
                            subTitle="Fine tune your Outcome Collection"
                            paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. "
                        />
                        <Box gap="small">
                            <BaseMenuListItem
                                icon={<ListPlus />}
                                title={'Outcome selection'}
                                onClick={() =>
                                    setController('OutcomeSelectionControl')
                                }
                            />
                            <BaseMenuListItem
                                icon={<UsersThree />}
                                title={'Allocation'}
                                onClick={() =>
                                    setController('RecipientAllocationControl')
                                }
                            />
                        </Box>
                    </Box>
                ) : (
                    <>{renderControl()}</>
                )}
            </SidebarCardBody>
        </SidebarCard>
    )
}

export default ComposerOutcomeCollectionControl
