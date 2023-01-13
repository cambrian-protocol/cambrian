import { Box, Text } from 'grommet'
import { useEffect, useState } from 'react'

import { Cursor } from 'phosphor-react'
import OutcomeChartRecipientLegendItem from './OutcomeChartLegendItem'
import { OutcomeCollectionModel } from '../models/OutcomeCollectionModel'
import ReactSvgPieChart from 'react-svg-piechart'
import { TokenModel } from '../models/TokenModel'
import { cpTheme } from '../theme/theme'
import { ethers } from 'ethers'

interface OutcomeChartProps {
    outcomeCollection?: OutcomeCollectionModel
    collateralToken?: TokenModel
}

const COLORS = [
    cpTheme.global.colors['brand'].dark,
    cpTheme.global.colors['status-reported'],
    cpTheme.global.colors['accent-1'],
    cpTheme.global.colors['status-executed'],
    cpTheme.global.colors['accent-2'],
    cpTheme.global.colors['status-arbitration'],
]

const OutcomeChart = ({
    outcomeCollection,
    collateralToken,
}: OutcomeChartProps) => {
    const [currentHoverIndex, setCurrentHoverIndex] = useState<number>()
    const [pieData, setPieData] = useState<
        {
            title: string
            value: number
            color: string
        }[]
    >()

    useEffect(() => {
        const activePieData = outcomeCollection?.allocations.map(
            (allocation, idx) => {
                return {
                    title: `${allocation.addressSlot.tag.label} (${allocation.amountPercentage}%)`,
                    value: Number(
                        ethers.utils.formatUnits(
                            allocation.amount || 0,
                            collateralToken?.decimals
                        )
                    ),
                    color: COLORS[idx],
                }
            }
        )
        setPieData(activePieData)
    }, [outcomeCollection])

    return (
        <Box flex align="center" gap="medium">
            <Box height="small" width={'small'}>
                {outcomeCollection ? (
                    <ReactSvgPieChart
                        data={pieData}
                        expandOnHover={
                            currentHoverIndex !== undefined
                                ? !outcomeCollection?.allocations[
                                      currentHoverIndex
                                  ].amount?.isZero()
                                : true
                        }
                        expandedIndex={currentHoverIndex}
                        strokeWidth={0.5}
                        expandSize={5}
                        shrinkOnTouchEnd={false}
                        strokeColor={cpTheme.global.colors['brand'].dark}
                        strokeLinejoin="round"
                        onSectorHover={(d: any, i: number) => {
                            if (d) {
                                setCurrentHoverIndex(i)
                            } else {
                                setCurrentHoverIndex(undefined)
                            }
                        }}
                    />
                ) : (
                    <Box
                        height="small"
                        width="small"
                        background="background-contrast"
                        round="full"
                    />
                )}
            </Box>
            <Box gap="xsmall" pad={{ horizontal: 'small', bottom: 'large' }}>
                {outcomeCollection ? (
                    outcomeCollection.allocations.map((allocation, idx) => {
                        return (
                            <Box
                                onMouseEnter={() => setCurrentHoverIndex(idx)}
                                key={idx}
                            >
                                <OutcomeChartRecipientLegendItem
                                    color={COLORS[idx]}
                                    allocation={allocation}
                                    active={currentHoverIndex === idx}
                                    collateralToken={collateralToken}
                                />
                            </Box>
                        )
                    })
                ) : (
                    <Box direction="row" align="center" gap="small">
                        <Cursor />
                        <Text size="xsmall" color="dark-4">
                            Please select an outcome
                        </Text>
                    </Box>
                )}
            </Box>
        </Box>
    )
}

export default OutcomeChart
