import {
    Accordion,
    AccordionPanel,
    Box,
    Heading,
    ResponsiveContext,
} from 'grommet'

import LoaderButton from '@cambrian/app/components/buttons/LoaderButton'
import OutcomeChart from '@cambrian/app/components/charts/OutcomeChart'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import OutcomeDetailItem from './OutcomeDetailItem'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { useState } from 'react'

type OutcomeOverviewProps = {
    outcomeCollections: OutcomeCollectionModel[]
    collateralToken?: TokenModel
    reportProps?: {
        reportLabel: string
        onReport: (indexSet: number) => Promise<void>
        reportedIndexSet?: number
        useChoiceIndex?: boolean // For arbitrate contract we report the choice-index instead of the indexSet
    }
}

const OutcomeOverview = ({
    outcomeCollections,
    collateralToken,
    reportProps,
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
                                    {outcomeCollections.map(
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
                                                                        outcomeCollections[
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
                                                        {reportProps && (
                                                            <Box pad="small">
                                                                <LoaderButton
                                                                    isLoading={
                                                                        outcomeCollection.indexSet ===
                                                                        reportProps.reportedIndexSet
                                                                    }
                                                                    disabled={
                                                                        reportProps.reportedIndexSet !==
                                                                        undefined
                                                                    }
                                                                    label={
                                                                        reportProps.reportLabel
                                                                    }
                                                                    primary
                                                                    onClick={() => {
                                                                        if (
                                                                            reportProps.useChoiceIndex
                                                                        ) {
                                                                            reportProps.onReport(
                                                                                idx
                                                                            )
                                                                        } else if (
                                                                            outcomeCollection.indexSet
                                                                        ) {
                                                                            reportProps.onReport(
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
                                            outcomeCollections[
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
