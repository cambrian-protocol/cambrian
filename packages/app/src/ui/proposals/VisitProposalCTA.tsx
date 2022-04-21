import { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import { Button } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import IPFSSolutionsHub from '@cambrian/app/hubs/IPFSSolutionsHub'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { UserType } from '@cambrian/app/store/UserContext'

interface VisitProposalCTAProps {
    solutionId: string
    currentUser: UserType
}

const VisitProposalCTA = ({
    solutionId,
    currentUser,
}: VisitProposalCTAProps) => {
    const [solverAddress, setSolverAddress] = useState<string>()

    useEffect(() => {
        initSolverAddress()
    }, [currentUser])

    const initSolverAddress = async () => {
        if (currentUser.chainId && currentUser.signer) {
            const ipfsSolutionsHub = new IPFSSolutionsHub(
                currentUser.signer,
                currentUser.chainId
            )
            const solvers = await ipfsSolutionsHub.getSolvers(solutionId)
            if (solvers) {
                setSolverAddress(solvers[0])
            }
        }
    }

    return (
        <>
            {solverAddress ? (
                <BaseFormContainer>
                    <HeaderTextSection
                        title="This proposal is executed"
                        subTitle="In progress"
                        paragraph="It has been successfully funded and is currently running"
                    />
                    <Button
                        primary
                        label="Visit Solver"
                        href={`/solvers/${solverAddress}`}
                    />
                </BaseFormContainer>
            ) : (
                <LoadingScreen context={LOADING_MESSAGE['SOLUTION']} />
            )}
        </>
    )
}

export default VisitProposalCTA
