import { TokenModel } from '../../../models/TokenModel'
import { get } from '@cambrian/app/config/api/axios.config'

type ERC20TokenTransferEventResultType = {
    tokenName: string
    tokenSymbol: string
}

type ERC20TokenTransferEventResponseType = {
    result: ERC20TokenTransferEventResultType[]
}

//TODO Etherscan api key
export const fetchTokenModelFromAddress = async (
    tokenAdress: string
): Promise<TokenModel> => {
    const response = await get<ERC20TokenTransferEventResponseType>(
        `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${tokenAdress}&address=0x4e83362442b8d1bec281594cea3050c8eb01311c&page=1&offset=100&sort=asc&apikey=YourApiKeyToken`
    )
    return {
        tokenName: response.data.result[0].tokenName,
        tokenSymbol: response.data.result[0].tokenSymbol,
        address: tokenAdress,
    }
}
