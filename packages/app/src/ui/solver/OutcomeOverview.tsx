import {
    Accordion,
    AccordionPanel,
    Box,
    Heading,
    ResponsiveContext,
    Text,
} from 'grommet'

import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import OutcomeChart from '@cambrian/app/charts/OutcomeChart'
import { OutcomeCollectionInfoType } from '@cambrian/app/components/info/solver/BaseSolverInfo'
import OutcomeDetailItem from './OutcomeDetailItem'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { useState } from 'react'

interface OutcomeOverviewProps {
    outcomeCollectionInfos: OutcomeCollectionInfoType[]
    collateralToken?: TokenModel
    onProposeOutcome?: (indexSet: number) => Promise<void>
    proposedIndexSet?: number
}

const OutcomeOverview = ({
    outcomeCollectionInfos,
    collateralToken,
    onProposeOutcome,
    proposedIndexSet,
}: OutcomeOverviewProps) => {
    const [activeOutcomeCollection, setActiveOutcomeCollection] = useState([0])

    return (
        <>
            <ResponsiveContext.Consumer>
                {(screenSize) => {
                    return (
                        <Box direction="row" justify="center">
                            <Box
                                flex
                                width={
                                    screenSize !== 'small'
                                        ? 'medium'
                                        : undefined
                                }
                                pad={
                                    screenSize !== 'small'
                                        ? { right: 'small' }
                                        : undefined
                                }
                                overflow={{ vertical: 'auto' }}
                            >
                                <Accordion
                                    height={{ min: 'auto' }}
                                    gap="medium"
                                    activeIndex={activeOutcomeCollection}
                                    onActive={(newActiveIndex) =>
                                        setActiveOutcomeCollection(
                                            newActiveIndex
                                        )
                                    }
                                >
                                    {outcomeCollectionInfos.map(
                                        (outcomeCollection, idx) => {
                                            return (
                                                <Box
                                                    key={idx}
                                                    border={
                                                        activeOutcomeCollection.includes(
                                                            idx
                                                        )
                                                            ? { color: 'brand' }
                                                            : false
                                                    }
                                                    round="xsmall"
                                                    background="background-popup"
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
                                                            <Box flex>
                                                                <OutcomeChart
                                                                    outcomeCollection={
                                                                        outcomeCollectionInfos[
                                                                            activeOutcomeCollection[0]
                                                                        ]
                                                                    }
                                                                    collateralToken={
                                                                        collateralToken
                                                                    }
                                                                />
                                                            </Box>
                                                        )}
                                                        <OutcomeDetailItem
                                                            outcomeCollection={
                                                                outcomeCollection
                                                            }
                                                        />
                                                        {onProposeOutcome && (
                                                            <Box pad="small">
                                                                <LoaderButton
                                                                    isLoading={
                                                                        outcomeCollection.indexSet ===
                                                                        proposedIndexSet
                                                                    }
                                                                    disabled={
                                                                        proposedIndexSet !==
                                                                        undefined
                                                                    }
                                                                    label="Propose outcome"
                                                                    primary
                                                                    onClick={() => {
                                                                        if (
                                                                            outcomeCollection.indexSet
                                                                        ) {
                                                                            onProposeOutcome(
                                                                                outcomeCollection.indexSet
                                                                            )
                                                                        }
                                                                    }}
                                                                />
                                                            </Box>
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
                                                activeOutcomeCollection[0]
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
        </>
    )
}

export default OutcomeOverview
