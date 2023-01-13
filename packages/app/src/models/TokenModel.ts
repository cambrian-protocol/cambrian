export interface TokenModel {
    readonly chainId: number
    readonly address: string
    readonly name: string
    readonly decimals: number
    readonly symbol: string
    readonly logoURI?: string
    readonly tags?: string[]
}
