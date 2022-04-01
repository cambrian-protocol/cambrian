import { useEffect, useState } from 'react'

import BaseFormContainer from '@cambrian/app/components/containers/BaseFormContainer'
import { Button } from 'grommet'
import HeaderTextSection from '@cambrian/app/components/sections/HeaderTextSection'
import { LOADING_MESSAGE } from '@cambrian/app/constants/LoadingMessages'
import LoadingScreen from '@cambrian/app/components/info/LoadingScreen'
import { useIPFSSolutionsHub } from '@cambrian/app/hooks/useIPFSSolutionsHub'

interface VisitProposalCTAProps {
    solutionId: string
}

const VisitProposalCTA = ({ solutionId }: VisitProposalCTAProps) => {
    const { IPFSSolutionsHubContract, getSolvers } = useIPFSSolutionsHub()
    const [solverAddress, setSolverAddress] = useState<string>()

    useEffect(() => {
        initSolverAddress()
    }, [IPFSSolutionsHubContract])

    const initSolverAddress = async () => {
        if (IPFSSolutionsHubContract) {
            const solvers = await getSolvers(solutionId)
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
                        label="Visit first Solver"
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
