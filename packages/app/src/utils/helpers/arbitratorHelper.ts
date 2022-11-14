import { BASIC_ARBITRATOR_IFACE } from 'packages/app/config/ContractInterfaces'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'

export const getArbitratorAddressOrOwner = async (
    solverData: SolverModel,
    currentUser: UserType
) => {
    const arbitratorCode = await currentUser.signer.provider?.getCode(
        solverData.config.arbitrator
    )
    const isContract = arbitratorCode !== '0x'

    if (isContract) {
        const arbitratorContract = new ethers.Contract(
            solverData.config.arbitrator,
            BASIC_ARBITRATOR_IFACE,
            currentUser.signer
        )
        return await arbitratorContract.owner()
    }
    return solverData.config.arbitrator
}
