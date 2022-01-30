import { Box, Text } from 'grommet'
import { CaretLeft, ListPlus, StackSimple, UsersThree } from 'phosphor-react'
import { useEffect, useState } from 'react'

import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import MenuButton from '@cambrian/app/src/components/buttons/MenuButton'
import NavigationButton from '@cambrian/app/src/components/buttons/NavigationButton'
import OutcomeSelectionList from './outcomeSelection/OutcomeSelectionList'
import RecipientAmountList from './recipientAmount/RecipientAmountList'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'

export type OutcomeCollectionControllerType =
    | 'MainControl'
    | 'OutcomeSelectionControl'
    | 'RecipientAmountControl'

/* TODO 
- Warn if two collections with the same outcomes are attached to the Solver 
*/
const OutcomeCollectionControl = () => {
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
            case 'RecipientAmountControl':
                return <RecipientAmountList />
            default:
                return <></>
        }
    }

    return (
        <Box gap="small" fill pad="small">
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
                <StackSimple size="24" />
                <Box>
                    <Text weight="bold" size="small">
                        {currentSolver?.title}
                    </Text>
                    <Text color="dark-5" size="small">
                        Outcome Collection
                    </Text>
                </Box>
            </Box>
            {controller === 'MainControl' ? (
                <Box gap="medium">
                    <HeaderTextSection
                        title="Outcome Collection"
                        subTitle="Fine tune your Outcome Collection"
                        paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. "
                    />
                    <Box gap="small">
                        <MenuButton
                            icon={<ListPlus />}
                            label={'Outcome selection'}
                            onClick={() =>
                                setController('OutcomeSelectionControl')
                            }
                        />
                        <MenuButton
                            icon={<UsersThree />}
                            label={'Allocation'}
                            onClick={() =>
                                setController('RecipientAmountControl')
                            }
                        />
                    </Box>
                </Box>
            ) : (
                renderControl()
            )}
        </Box>
    )
}

export default OutcomeCollectionControl
