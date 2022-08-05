import { Box, Select } from 'grommet'
import { SetStateAction, useEffect, useState } from 'react'
import { isAddress, isRequired } from '@cambrian/app/utils/helpers/validation'

import { CeramicProposalModel } from '@cambrian/app/models/ProposalModel'
import { CeramicTemplateModel } from '@cambrian/app/models/TemplateModel'
import { FormField } from 'grommet'
import { Text } from 'grommet'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import _ from 'lodash'
import { fetchTokenInfo } from '@cambrian/app/utils/helpers/tokens'
import { useCurrentUserContext } from '@cambrian/app/hooks/useCurrentUserContext'

interface TokenInputProps {
    denominationToken: TokenModel
    proposalInput: CeramicProposalModel
    setProposalInput: React.Dispatch<
        SetStateAction<CeramicProposalModel | undefined>
    >
    template: CeramicTemplateModel
}

const TokenInput = ({
    denominationToken,
    proposalInput,
    template,
    setProposalInput,
}: TokenInputProps) => {
    const { currentUser } = useCurrentUserContext()
    const [options, setOptions] = useState<TokenModel[]>(
        template.price.preferredTokens
            ? template.price.preferredTokens.concat(denominationToken)
            : [denominationToken]
    )

    useEffect(() => {
        if (
            !options.find(
                (option) => option.address === proposalInput.price.tokenAddress
            )
        ) {
            onChangeTokenAddress(proposalInput.price.tokenAddress)
        }
    }, [])

    const onChangeTokenAddress = async (address: string) => {
        if (currentUser && address.length === 42) {
            const token = await fetchTokenInfo(
                address,
                currentUser.web3Provider
            )
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
    }

    return (
        <Box fill>
            <Box direction="row" gap="small">
                <Box basis="1/4" width={{ min: 'xsmall' }}>
                    <FormField label="Token">
                        <Select
                            options={options}
                            labelKey="symbol"
                            valueKey={{ key: 'address', reduce: true }}
                            value={proposalInput.price.tokenAddress}
                            onChange={({ option }) => {
                                setProposalInput({
                                    ...proposalInput,
                                    price: {
                                        ...proposalInput.price,
                                        tokenAddress: option.address,
                                    },
                                })
                            }}
                        />
                    </FormField>
                </Box>
                <Box flex>
                    <FormField
                        onChange={(event) => {
                            onChangeTokenAddress(event.target.value)
                            setProposalInput({
                                ...proposalInput,
                                price: {
                                    ...proposalInput.price,
                                    tokenAddress: event.target.value,
                                },
                            })
                        }}
                        disabled={!template.price.allowAnyPaymentToken}
                        value={proposalInput.price.tokenAddress}
                        label="Token Address"
                        name="collateralTokenAddress"
                        validate={[
                            () => isRequired(proposalInput.price.tokenAddress),
                            () => {
                                if (
                                    !isAddress(proposalInput.price.tokenAddress)
                                ) {
                                    return 'Invalid Address'
                                }
                            },
                        ]}
                    />
                </Box>
            </Box>
            {template.price.allowAnyPaymentToken && (
                <Text size="xsmall" color="dark-4">
                    You can insert any ERC20 token address you want to pay with
                </Text>
            )}
        </Box>
    )
}

export default TokenInput
