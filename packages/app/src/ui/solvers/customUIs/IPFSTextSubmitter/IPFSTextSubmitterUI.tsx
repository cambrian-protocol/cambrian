import { IPFS_TEXT_SUBMITTER_IFACE } from 'packages/app/config/ContractInterfaces'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import SubmissionContainer from './components/SubmissionContainer'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useEffect } from 'react'

interface IPFSTextSubmitterUIProps {
    currentUser: UserType
    solverAddress: string
    currentCondition: SolverContractCondition
    moduleAddress: string
}

const IPFSTextSubmitterUI = ({
    currentUser,
    solverAddress,
    currentCondition,
    moduleAddress,
}: IPFSTextSubmitterUIProps) => {
    const { addPermission } = useCurrentUser()
    const moduleContract = new ethers.Contract(
        moduleAddress,
        IPFS_TEXT_SUBMITTER_IFACE,
        currentUser.signer
    )

    useEffect(() => {
        if (currentUser) {
            initPermissions()
        }
    }, [currentUser])

    const initPermissions = async () => {
        const submitterAddress = await moduleContract.submitter(solverAddress)

        if (currentUser.address === submitterAddress) addPermission('Submitter')
    }

    return (
        <SubmissionContainer
            moduleContract={moduleContract}
            solverAddress={solverAddress}
            currentUser={currentUser}
            currentCondition={currentCondition}
        />
    )
}

export default IPFSTextSubmitterUI
