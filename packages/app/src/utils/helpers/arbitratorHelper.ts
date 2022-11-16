import { BASIC_ARBITRATOR_IFACE } from 'packages/app/config/ContractInterfaces'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'

export const getArbitratorAddressOrOwner = async (
    arbitrator: string,
    currentUser: UserType
) => {
    const arbitratorCode = await currentUser.signer.provider?.getCode(
        arbitrator
    )
    const isContract = arbitratorCode !== '0x'

    if (isContract) {
        const arbitratorContract = new ethers.Contract(
            arbitrator,
            BASIC_ARBITRATOR_IFACE,
            currentUser.signer
        )
        return await arbitratorContract.owner()
    }
    return arbitrator
}
