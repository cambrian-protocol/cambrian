export const getDIDfromAddress = (address: string, chainId: number) => {
    return `did:pkh:eip155:${chainId}:${address}`
}

export const getAddressFromDID = (did: string) => {
    return did.slice(-42)
}
