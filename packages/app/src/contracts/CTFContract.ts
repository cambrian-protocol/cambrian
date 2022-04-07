import { ethers } from 'ethers'

const CTF_ABI =
    require('@artifacts/contracts/ConditionalTokens.sol/ConditionalTokens.json').abi

export default class CTFContract {
    contract: ethers.Contract
    signer: ethers.Signer

    constructor(signer: ethers.Signer) {
        if (!process.env.NEXT_PUBLIC_CTF_ADDRESS)
            throw new Error('No ctf contract address defined!')

        this.signer = signer
        this.contract = new ethers.Contract(
            process.env.NEXT_PUBLIC_CTF_ADDRESS,
            new ethers.utils.Interface(CTF_ABI),
            signer
        )
    }
}
