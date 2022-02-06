import {
    ArrowSquareIn,
    CaretLeft,
    Gear,
    StackSimple,
    TreeStructure,
    UserList,
} from 'phosphor-react'
import { Box, Card, CardBody, CardFooter, CardHeader, Text } from 'grommet'
import { useEffect, useState } from 'react'

import BaseMenuListItem from '@cambrian/app/components/buttons/BaseMenuListItem'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import OutcomeList from './outcomeList/OutcomeList'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
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
        <Card background="background-front" fill>
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
                        {currentSolver?.title}
                    </Text>
                </Box>
            </CardHeader>
            {controller === 'MainControl' ? (
                <>
                    <CardBody pad="small">
                        <Box gap="small" fill overflow={{ vertical: 'auto' }}>
                            <HeaderTextSection
                                title="Solver"
                                subTitle="Fine tune your Solver"
                                paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel erat et enim blandit pharetra. "
                            />
                            <Box gap="small">
                                <BaseMenuListItem
                                    icon={<Gear />}
                                    title="Settings"
                                    onClick={() =>
                                        setController('SolverSettingsControl')
                                    }
                                />
                                <PlainSectionDivider />
                                <BaseMenuListItem
                                    icon={<TreeStructure />}
                                    title="Outcome list"
                                    onClick={() =>
                                        setController('OutcomeListControl')
                                    }
                                />
                                <PlainSectionDivider />
                                <BaseMenuListItem
                                    icon={<UserList />}
                                    title={'Recipient list'}
                                    onClick={() =>
                                        setController('RecipientListControl')
                                    }
                                />
                                <PlainSectionDivider />
                                <BaseMenuListItem
                                    icon={<ArrowSquareIn />}
                                    title={'Slot list'}
                                    onClick={() => setController('SlotControl')}
                                />
                            </Box>
                        </Box>
                        <CardFooter justify="end">
                            <RoundButtonWithLabel
                                onClick={handleAttachOutcomeCollection}
                                label="Attach Outcome collection"
                                icon={<StackSimple size="24" />}
                            />
                        </CardFooter>
                    </CardBody>
                </>
            ) : (
                <CardBody pad="small">{renderControl()}</CardBody>
            )}
        </Card>
    )
}
