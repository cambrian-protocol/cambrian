import { AccordionPanel, Box, Heading, ResponsiveContext, Text } from 'grommet'

import OutcomeChart from '@cambrian/app/components/charts/OutcomeChart'
import { OutcomeCollectionModel } from '@cambrian/app/models/OutcomeCollectionModel'
import OutcomeDetailItem from '../solver/OutcomeDetailItem'
import { PropsWithChildren } from 'react'
import { TokenModel } from '@cambrian/app/models/TokenModel'

interface OutcomeCollectionAccordionPanelProps extends PropsWithChildren<{}> {
    outcomeCollection: OutcomeCollectionModel
    collateralToken?: TokenModel
    isActive: boolean
    label?: string
}

const OutcomeCollectionAccordionPanel = ({
    outcomeCollection,
    collateralToken,
    isActive,
    label,
    children,
}: OutcomeCollectionAccordionPanelProps) => {
    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => {
                return (
                    <>
                        {label && (
                            <Box pad={{ bottom: 'small' }}>
                                <Text size="small">{label}</Text>
                            </Box>
                        )}
                        <Box
                            border={isActive ? { color: 'brand' } : false}
                            round="xsmall"
                            background="background-popup"
                            focusIndicator={false}
                            overflow={'hidden'}
                        >
                            <AccordionPanel
                                label={
                                    <Box pad="small" round="xsmall">
                                        <Heading level="4">
                                            {outcomeCollection.outcomes.map(
                                                (outcome, idx) => {
                                                    return `${outcome.title}${
                                                        outcomeCollection
                                                            .outcomes.length -
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
                                {screenSize === 'small' && (
                                    <Box flex>
                                        <OutcomeChart
                                            outcomeCollection={
                                                outcomeCollection
                                            }
                                            collateralToken={collateralToken}
                                        />
                                    </Box>
                                )}
                                <OutcomeDetailItem
                                    outcomeCollection={outcomeCollection}
                                />
                                {children}
                            </AccordionPanel>
                        </Box>
                    </>
                )
            }}
        </ResponsiveContext.Consumer>
    )
}

export default OutcomeCollectionAccordionPanel
