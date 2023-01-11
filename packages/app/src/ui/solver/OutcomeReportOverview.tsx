import { Accordion, Box, ResponsiveContext } from 'grommet'

import OutcomeChart from '@cambrian/app/components/charts/OutcomeChart'
import OutcomeCollectionAccordionPanel from '../outcome/OutcomeCollectionAccordionPanel'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import _ from 'lodash'
import { useState } from 'react'

interface OutcomeReportOverviewProps {
    proposedOutcome: OutcomeCollectionModel
    collateralToken: TokenModel
    confirmedOutcome?: OutcomeCollectionModel
}

const OutcomeReportOverview = ({
    proposedOutcome,
    collateralToken,
    confirmedOutcome,
}: OutcomeReportOverviewProps) => {
    const [activeOutcomeCollection, setActiveOutcomeCollection] = useState([0])

    const outcomeCollections = confirmedOutcome
        ? [confirmedOutcome, proposedOutcome]
        : [proposedOutcome]

    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => {
                return (
                    <Box direction="row" justify="center">
                        <Box
                            flex
                            width={
                                screenSize !== 'small' ? 'medium' : undefined
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
                                onActive={(newActiveIndex) => {
                                    console.log(newActiveIndex)
                                    setActiveOutcomeCollection(newActiveIndex)
                                }}
                            >
                                {outcomeCollections.map(
                                    (outcomeCollection, idx) => (
                                        <OutcomeCollectionAccordionPanel
                                            collateralToken={collateralToken}
                                            isActive={activeOutcomeCollection.includes(
                                                idx
                                            )}
                                            outcomeCollection={
                                                outcomeCollection
                                            }
                                            label={
                                                idx === 0
                                                    ? confirmedOutcome
                                                        ? 'Confirmed Outcome'
                                                        : 'Keepers proposed Outcome'
                                                    : 'Keepers proposed Outcome'
                                            }
                                        />
                                    )
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
    )
}

export default OutcomeReportOverview
