import { GenericMethods } from '@cambrian/app/components/solver/Solver'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import SubmissionContainer from './components/SubmissionContainer'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useEffect } from 'react'
import { IPFS_TEXT_SUBMITTER_IFACE } from 'packages/app/config/ContractInterfaces'

interface IPFSTextSubmitterUIProps {
    currentUser: UserType
    solverData: SolverModel
    solverContract: ethers.Contract
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
    metadata?: MetadataModel
    moduleAddress: string
}

const IPFSTextSubmitterUI = ({
    currentUser,
    solverMethods,
    solverData,
    solverContract,
    currentCondition,
    metadata,
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
        const submitterAddress = await moduleContract.submitter(
            solverContract.address
        )

        if (currentUser.address === submitterAddress) addPermission('Submitter')
    }

    return (
        <SubmissionContainer
            solverMethods={solverMethods}
            moduleContract={moduleContract}
            solverContract={solverContract}
            currentUser={currentUser}
            solverData={solverData}
            currentCondition={currentCondition}
            metadata={metadata}
        />
    )
}

export default IPFSTextSubmitterUI
