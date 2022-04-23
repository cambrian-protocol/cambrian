import { Box, Select } from 'grommet'

import { FormField } from 'grommet'
import { Text } from 'grommet'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import _ from 'lodash'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useState } from 'react'

interface TokenInputProps {
    name: string
    denominationToken: TokenModel
    preferredTokens: TokenModel[]
    disabled?: boolean
}

const TokenInput = ({
    name,
    disabled,
    preferredTokens,
    denominationToken,
}: TokenInputProps) => {
    const { currentUser } = useCurrentUser()
    const [options, setOptions] = useState<TokenModel[]>(
        denominationToken
            ? preferredTokens.concat(denominationToken)
            : preferredTokens
    )

    const onChangeTokenAddress = async (address: string) => {
        const token = await fetchTokenInfo(address, currentUser.web3Provider)
        if (token) {
            const includesToken = options.find(
                (option) => option.address === address
            )
            if (!includesToken) {
                const updatedOptions = [...options]
                updatedOptions.push(token)
                setOptions(updatedOptions)
            }
        }
    }

    return (
        <Box direction="row" fill gap="small" align="start">
            <Box basis="1/4">
                <FormField label="Token Symbol">
                    <Select
                        name={name}
                        options={options}
                        labelKey="symbol"
                        valueKey={{ key: 'address', reduce: true }}
                    />
                </FormField>
            </Box>
            <Box flex>
                <FormField
                    name={name}
                    onChange={(event) =>
                        onChangeTokenAddress(event.target.value)
                    }
                    disabled={disabled}
                    label="Token Address"
                />
                {!disabled && (
                    <Text size="xsmall" color="dark-4">
                        You can insert any ERC20 token address you want to pay
                        with
                    </Text>
                )}
            </Box>
        </Box>
    )
}

export default TokenInput
