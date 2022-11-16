import { Box, Heading, Meter, Stack, Text } from 'grommet'

import { BigNumber } from '@ethersproject/bignumber'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { ethers } from 'ethers'

interface FundingProgressMeterProps {
    fundingGoal: BigNumber
    funding: BigNumber
    token: TokenModel
    userFunding: BigNumber
}

const FundingProgressMeter = ({
    fundingGoal,
    funding,
    token,
    userFunding,
}: FundingProgressMeterProps) => {
    const formattedFunding = ethers.utils.formatUnits(funding, token.decimals)
    const formattedFundingGoal = ethers.utils.formatUnits(
        fundingGoal,
        token.decimals
    )
    const formattedUserFunding = ethers.utils.formatUnits(
        userFunding,
        token.decimals
    )
    const percentageValue =
        funding.toString() !== '0' && fundingGoal.toString() !== '0'
            ? funding.mul(BigNumber.from(100)).div(fundingGoal)
            : BigNumber.from(0)

    return (
        <Box gap="small" pad={{ vertical: 'medium' }}>
            <Box align="center">
                <Stack anchor="center">
                    <Meter
                        type="circle"
                        values={[{ value: Number(percentageValue) }]}
                        size="xsmall"
                        thickness="small"
                    />
                    <Box
                        direction="row"
                        align="center"
                        pad={{ bottom: 'small' }}
                    >
                        <Text size="xlarge">
                            {Number(percentageValue).toFixed()}
                        </Text>
                        <Text size="small">%</Text>
                    </Box>
                </Stack>
            </Box>
            <>
                <Heading level="2" textAlign="center">
                    {formattedFunding} {token.name}
                </Heading>
                <Text color="dark-4" textAlign="center">
                    pledged of {formattedFundingGoal} {token.name} goal
                </Text>
            </>
            <>
                <Text size="small" color="dark-4" textAlign="center">
                    Remaining:{' '}
                    {Number(formattedFundingGoal) - Number(formattedFunding)}
                </Text>
                <Text size="small" color="dark-4" textAlign="center">
                    Your pledge: {Number(formattedUserFunding)}
                </Text>
            </>
        </Box>
    )
}

export default FundingProgressMeter
