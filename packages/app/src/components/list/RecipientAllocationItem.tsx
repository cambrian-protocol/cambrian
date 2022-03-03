import BaseSlotInputItem, { BaseSlotInputItemProps } from './BaseSlotInputItem'
import { Box, Text } from 'grommet'
import {
    SolverContractCondition,
    SolverDataModel,
} from '@cambrian/app/models/SolverModel'

import { BigNumber } from 'ethers'
import { formatDecimals } from '@cambrian/app/utils/helpers/tokens'

type RecipientAllocationItemProps = BaseSlotInputItemProps & {
    amount: string
    solverData: SolverDataModel
    currentCondition?: SolverContractCondition
}

// TODO Calculate actual amount
const RecipientAllocationItem = ({
    amount,
    title,
    subTitle,
    solverData,
    currentCondition,
}: RecipientAllocationItemProps) => {
    const amountPercentage = BigNumber.from(amount).div(100)

    return (
        <BaseSlotInputItem title={title} subTitle={subTitle}>
            <Box align="end">
                <Text>{amountPercentage.toString()}%</Text>
                <Text size="small" color="dark-6">
                    {currentCondition &&
                    solverData.numMintedTokensByCondition &&
                    solverData.numMintedTokensByCondition[
                        currentCondition.conditionId
                    ] != 0
                        ? formatDecimals(
                              solverData.collateralToken,
                              amountPercentage
                                  .mul(
                                      solverData.numMintedTokensByCondition[
                                          currentCondition.conditionId
                                      ]
                                  )
                                  .div(100)
                          )
                        : ''}
                </Text>
            </Box>
        </BaseSlotInputItem>
    )
}

export default RecipientAllocationItem
