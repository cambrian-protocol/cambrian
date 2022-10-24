import { useEffect, useState } from 'react'

import { Box } from 'grommet'
import OutcomeChartRecipientLegendItem from './OutcomeChartLegendItem'
import { OutcomeCollectionInfoType } from '../components/info/solver/BaseSolverInfo'
import ReactSvgPieChart from 'react-svg-piechart'
import { TokenModel } from '../models/TokenModel'
import { cpTheme } from '../theme/theme'

interface OutcomeChartProps {
    outcomeCollection: OutcomeCollectionInfoType
    collateralToken?: TokenModel
}

const COLORS = [
    cpTheme.global.colors['brand'].dark,
    cpTheme.global.colors['background-front'].dark,
    cpTheme.global.colors['background-contrast'].dark,
    cpTheme.global.colors['status-proposed'],
    cpTheme.global.colors['status-warning'],
]

const OutcomeChart = ({
    outcomeCollection,
    collateralToken,
}: OutcomeChartProps) => {
    const [pieData, setPieData] = useState<
        {
            title: string
            value: number
            color: string
        }[]
    >()

    const [currentHoverIndex, setCurrentHoverIndex] = useState<number>()

    useEffect(() => {
        const activePieData = outcomeCollection.recipientAllocations.map(
            (rc, idx) => {
                return {
                    title: `${rc.recipient.slotTag.label} (${rc.allocation.percentage}%)`,
                    value: rc.allocation.amount,
                    color: COLORS[idx],
                }
            }
        )
        setPieData(activePieData)
    }, [outcomeCollection])

    return (
        <Box flex gap="medium" align="center">
            <Box height="small" width={'small'}>
                <ReactSvgPieChart
                    data={pieData}
                    expandOnHover
                    strokeWidth={0.5}
                    expandSize={5}
                    shrinkOnTouchEnd={false}
                    strokeColor={'#2d7dac'}
                    strokeLinejoin="round"
                    onSectorHover={(d: any, i: number) => {
                        if (d) {
                            setCurrentHoverIndex(i)
                        } else {
                            setCurrentHoverIndex(undefined)
                        }
                    }}
                />
            </Box>
            <Box gap="xsmall">
                {outcomeCollection.recipientAllocations.map((rc, idx) => {
                    return (
                        <OutcomeChartRecipientLegendItem
                            recipientAllocation={rc}
                            active={currentHoverIndex === idx}
                        />
                    )
                })}
            </Box>
        </Box>
    )
}

export default OutcomeChart
