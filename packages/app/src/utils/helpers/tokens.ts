import { TokenModel } from '@cambrian/app/models/TokenModel'

export const formatDecimals = (
    token: TokenModel | undefined,
    amount: number
) => {
    if (token?.decimals) {
        return amount / Math.pow(10, token.decimals)
    } else {
        return amount
    }
}
