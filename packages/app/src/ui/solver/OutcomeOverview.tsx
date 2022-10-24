import {
    Accordion,
    AccordionPanel,
    Box,
    Button,
    Heading,
    ResponsiveContext,
    Text,
} from 'grommet'

import OutcomeChart from '@cambrian/app/charts/OutcomeChart'
import { OutcomeCollectionInfoType } from '@cambrian/app/components/info/solver/BaseSolverInfo'
import OutcomeInfoModal from '../common/modals/OutcomeInfoModal'
import { OutcomeModel } from '@cambrian/app/models/OutcomeModel'
import PlainSectionDivider from '@cambrian/app/components/sections/PlainSectionDivider'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { useState } from 'react'

interface OutcomeOverviewProps {
    outcomeCollectionInfos: OutcomeCollectionInfoType[]
    collateralToken?: TokenModel
}

const OutcomeOverview = ({
    outcomeCollectionInfos,
    collateralToken,
}: OutcomeOverviewProps) => {
    const [activeOutcomeCollection, setActiveOutcomeCollection] =
        useState<number>(0)
    const [showOutcomeDetailModal, setShowOutcomeDetailModal] =
        useState<OutcomeModel>()

    return (
        <>
            <ResponsiveContext.Consumer>
                {(screenSize) => {
                    return (
                        <Box direction="row">
                            <Box
                                width={'medium'}
                                pad={{ right: 'small' }}
                                overflow={{ vertical: 'auto' }}
                            >
                                <Accordion
                                    height={{ min: 'auto' }}
                                    gap="medium"
                                    activeIndex={activeOutcomeCollection}
                                >
                                    {outcomeCollectionInfos.map(
                                        (outcomeCollection, idx) => {
                                            return (
                                                <Box
                                                    key={idx}
                                                    border={
                                                        idx ===
                                                        activeOutcomeCollection
                                                            ? { color: 'brand' }
                                                            : false
                                                    }
                                                    round="xsmall"
                                                    background="background-popup"
                                                    onClick={() =>
                                                        setActiveOutcomeCollection(
                                                            idx
                                                        )
                                                    }
                                                    focusIndicator={false}
                                                    overflow={'hidden'}
                                                >
                                                    <AccordionPanel
                                                        label={
                                                            <Box
                                                                pad="small"
                                                                round="xsmall"
                                                            >
                                                                <Heading level="4">
                                                                    {outcomeCollection.outcomes.map(
                                                                        (
                                                                            outcome,
                                                                            idx
                                                                        ) => {
                                                                            return `${
                                                                                outcome.title
                                                                            }${
                                                                                outcomeCollection
                                                                                    .outcomes
                                                                                    .length -
                                                                                    1 >
                                                                                idx
                                                                                    ? ' & '
                                                                                    : ''
                                                                            }`
                                                                        }
                                                                    )}
                                                                </Heading>
                                                            </Box>
                                                        }
                                                    >
                                                        {screenSize ===
                                                            'small' && (
                                                            <Box flex></Box>
                                                        )}
                                                        {outcomeCollection.outcomes.map(
                                                            (outcome, idx) => {
                                                                return (
                                                                    <Box
                                                                        key={
                                                                            outcome.id
                                                                        }
                                                                        pad="small"
                                                                        background="background-front"
                                                                        gap="medium"
                                                                    >
                                                                        <Box
                                                                            direction="row"
                                                                            justify="between"
                                                                            align="end"
                                                                        >
                                                                            <Box>
                                                                                <Text
                                                                                    size="small"
                                                                                    truncate
                                                                                >
                                                                                    {
                                                                                        outcome.title
                                                                                    }
                                                                                </Text>
                                                                                <Text
                                                                                    size="xsmall"
                                                                                    color={
                                                                                        'dark-4'
                                                                                    }
                                                                                >
                                                                                    {outcome.description.substring(
                                                                                        0,
                                                                                        80
                                                                                    )}
                                                                                    ...
                                                                                </Text>
                                                                            </Box>
                                                                            <Button
                                                                                size="xsmall"
                                                                                secondary
                                                                                label={
                                                                                    'More...'
                                                                                }
                                                                                onClick={() =>
                                                                                    setShowOutcomeDetailModal(
                                                                                        outcome
                                                                                    )
                                                                                }
                                                                            />
                                                                        </Box>
                                                                        {outcomeCollection
                                                                            .outcomes
                                                                            .length -
                                                                            1 >
                                                                            idx && (
                                                                            <PlainSectionDivider />
                                                                        )}
                                                                    </Box>
                                                                )
                                                            }
                                                        )}
                                                    </AccordionPanel>
                                                </Box>
                                            )
                                        }
                                    )}
                                    <Box pad="small" />
                                </Accordion>
                            </Box>
                            {screenSize !== 'small' && (
                                <Box pad={{ left: 'small' }} flex>
                                    <OutcomeChart
                                        outcomeCollection={
                                            outcomeCollectionInfos[
                                                activeOutcomeCollection
                                            ]
                                        }
                                        collateralToken={collateralToken}
                                    />
                                </Box>
                            )}
                        </Box>
                    )
                }}
            </ResponsiveContext.Consumer>
            {showOutcomeDetailModal && (
                <OutcomeInfoModal
                    outcome={showOutcomeDetailModal}
                    onClose={() => setShowOutcomeDetailModal(undefined)}
                />
            )}
        </>
    )
}

export default OutcomeOverview
