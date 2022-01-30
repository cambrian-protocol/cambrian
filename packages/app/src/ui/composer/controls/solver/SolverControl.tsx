import {
    ArrowSquareIn,
    CaretLeft,
    Gear,
    PuzzlePiece,
    StackSimple,
    TreeStructure,
    UserList,
} from 'phosphor-react'
import { Box, Text } from 'grommet'
import { useEffect, useState } from 'react'

import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import MenuButton from '@cambrian/app/components/buttons/MenuButton'
import NavigationButton from '@cambrian/app/components/buttons/NavigationButton'
import OutcomeList from './outcomeList/OutcomeList'
import RecipientList from './recipientList/RecipientList'
import RoundButtonWithLabel from '@cambrian/app/components/buttons/RoundButtonWithLabel'
import SlotList from './slotList/SlotList'
import SolverSettingsControl from './general/SolverSettingsControl'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'

export type SolverControllerType =
    | 'MainControl'
    | 'SolverSettingsControl'
    | 'SlotControl'
    | 'RecipientListControl'
    | 'OutcomeListControl'
    | 'TimingControl'

/* TODO
- Node Position
*/
export const SolverControl = () => {
    const { dispatch, currentSolver } = useComposerContext()

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
            case 'SolverSettingsControl':
                return <SolverSettingsControl />
            case 'RecipientListControl':
                return <RecipientList />
            case 'OutcomeListControl':
                return <OutcomeList />
            case 'SlotControl':
                return <SlotList />
            default:
                return <></>
        }
    }

    if (currentSolver === undefined) return null

    return (
        <Box fill gap="small" pad="small">
            <Box
                align="center"
                direction="row"
                gap="small"
                height={{ min: 'xsmall' }}
            >
                <Box width={{ min: 'xxsmall' }}>
                    {controller !== 'MainControl' && (
                        <NavigationButton
                            icon={<CaretLeft size="24" />}
                            onClick={() => setController('MainControl')}
                        />
                    )}
                </Box>
                <PuzzlePiece size="24" />
                <Box>
                    <Text weight="bold" size="small">
                        {currentSolver?.title}
                    </Text>
                </Box>
            </Box>
            {controller === 'MainControl' ? (
                <>
                    <Box gap="small" fill overflow={{ vertical: 'auto' }}>
                        <HeaderTextSection
                            title="Solver"
                            subTitle="Fine tune your Solver"
                            paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. "
                        />
                        <Box gap="small">
                            <MenuButton
                                icon={<Gear />}
                                label="Settings"
                                onClick={() =>
                                    setController('SolverSettingsControl')
                                }
                            />
                            <MenuButton
                                icon={<TreeStructure />}
                                label="Outcome list"
                                onClick={() =>
                                    setController('OutcomeListControl')
                                }
                            />
                            <MenuButton
                                icon={<UserList />}
                                label={'Recipient list'}
                                onClick={() =>
                                    setController('RecipientListControl')
                                }
                            />
                            <MenuButton
                                icon={<ArrowSquareIn />}
                                label={'Slot list'}
                                onClick={() => setController('SlotControl')}
                            />
                        </Box>
                    </Box>
                    <Box pad="small">
                        <RoundButtonWithLabel
                            onClick={handleAttachOutcomeCollection}
                            label="Attach Outcome collection"
                            icon={<StackSimple size="24" />}
                        />
                    </Box>
                </>
            ) : (
                <Box fill>{renderControl()}</Box>
            )}
        </Box>
    )
}
