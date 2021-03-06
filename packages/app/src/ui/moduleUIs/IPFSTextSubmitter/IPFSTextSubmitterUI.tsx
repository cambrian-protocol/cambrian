import { useEffect, useState } from 'react'

import { IPFS_TEXT_SUBMITTER_IFACE } from 'packages/app/config/ContractInterfaces'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import ModuleRegistryAPI from '@cambrian/app/services/api/ModuleRegistry'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import SubmissionContainer from './components/SubmissionContainer'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'

interface IPFSTextSubmitterUIProps {
    solverAddress: string
    currentCondition: SolverContractCondition
    currentUser: UserType
}

export const IPFS_TEXT_SUBMITTER_MODULE_KEY = 'ipfsTextSubmitter'

const IPFSTextSubmitterUI = ({
    solverAddress,
    currentCondition,
    currentUser,
}: IPFSTextSubmitterUIProps) => {
    const { addPermission } = useCurrentUser()
    const [moduleContract, setModuleContract] = useState<ethers.Contract>()

    useEffect(() => {
        const moduleContract = new ethers.Contract(
            ModuleRegistryAPI.module(
                IPFS_TEXT_SUBMITTER_MODULE_KEY
            ).deployments[currentUser.chainId],
            IPFS_TEXT_SUBMITTER_IFACE,
            currentUser.signer
        )

        initPermissions(moduleContract)
        setModuleContract(moduleContract)
    }, [])

    const initPermissions = async (moduleContract: ethers.Contract) => {
        const submitterAddress = await moduleContract.submitter(solverAddress)
        if (currentUser.address === submitterAddress) addPermission('Submitter')
    }

    return (
        <>
            {moduleContract ? (
                <SubmissionContainer
                    moduleContract={moduleContract}
                    solverAddress={solverAddress}
                    currentUser={currentUser}
                    currentCondition={currentCondition}
                />
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['MODULE']} />
            )}
        </>
    )
}

export default IPFSTextSubmitterUI
