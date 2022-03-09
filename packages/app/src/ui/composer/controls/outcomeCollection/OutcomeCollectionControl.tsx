import { Box, Card, CardBody, CardHeader, Text } from 'grommet'
import { CaretLeft, ListPlus, UsersThree } from 'phosphor-react'
import { useEffect, useState } from 'react'

import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import HeaderTextSection from '@cambrian/app/src/components/sections/HeaderTextSection'
import OutcomeSelectionList from './outcomeSelection/OutcomeSelectionList'
import RecipientAllocationList from './recipientAmount/RecipientAllocationList'
import { useComposerContext } from '@cambrian/app/src/store/composer/composer.context'

export type OutcomeCollectionControllerType =
    | 'MainControl'
    | 'OutcomeSelectionControl'
    | 'RecipientAllocationControl'

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
            case 'RecipientAllocationControl':
                return <RecipientAllocationList />
            default:
                return <></>
        }
    }

    return (
        <Card background="background-front" fill margin={{ right: 'small' }}>
            <CardHeader pad={'medium'} elevation="small" height={'5em'}>
                <Box width={'2em'}>
                    {controller !== 'MainControl' && (
                        <Box
                            onClick={() => setController('MainControl')}
                            focusIndicator={false}
                        >
                            <CaretLeft size="24" />
                        </Box>
                    )}
                </Box>
                <Box flex>
                    <Text weight="bold" size="small">
                        {currentSolver?.solverTag.title}
                    </Text>
                    <Text color="light-2" size="small">
                        Outcome Collection
                    </Text>
                </Box>
            </CardHeader>
            {controller === 'MainControl' ? (
                <CardBody pad="medium">
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
                </CardBody>
            ) : (
                <CardBody pad="medium">{renderControl()}</CardBody>
            )}
        </Card>
    )
}

export default OutcomeCollectionControl
