import { GenericMethods } from '@cambrian/app/components/solver/Solver'
import { MetadataModel } from '@cambrian/app/models/MetadataModel'
import { SolverContractCondition } from '@cambrian/app/models/ConditionModel'
import { SolverModel } from '@cambrian/app/models/SolverModel'
import SubmissionContainer from './components/SubmissionContainer'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { useCurrentUser } from '@cambrian/app/hooks/useCurrentUser'
import { useEffect } from 'react'

interface ContentMarketingSolverProps {
    currentUser: UserType
    solverContract: ethers.Contract
    solverData: SolverModel
    solverMethods: GenericMethods
    currentCondition: SolverContractCondition
    metadata?: MetadataModel
}

const ContentMarketingCustomUI = ({
    solverContract,
    currentUser,
    solverMethods,
    solverData,
    currentCondition,
    metadata,
}: ContentMarketingSolverProps) => {
    const { addPermission } = useCurrentUser()

    useEffect(() => {
        if (currentUser) {
            initPermissions()
        }
    }, [currentUser])

    const initPermissions = async () => {
        const writerAddress = await solverContract.writer()
        const buyerAddress = await solverContract.buyer()

        if (currentUser.address === writerAddress) addPermission('Writer')
        if (currentUser.address === buyerAddress) addPermission('Buyer')
    }

    return (
        <SubmissionContainer
            solverMethods={solverMethods}
            solverContract={solverContract}
            currentUser={currentUser}
            solverData={solverData}
            currentCondition={currentCondition}
            metadata={metadata}
        />
    )
}

export default ContentMarketingCustomUI
