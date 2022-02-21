import { useEffect, useState } from 'react'

import ChatFAB from '@cambrian/app/components/chat/ChatFAB'
import ConditionVersionSidebar from '../interaction/bars/ConditionVersionSidebar'
import { DefaultSolverUIProps } from './DefaultSolverUI'
import { Layout } from '@cambrian/app/components/layout/Layout'
import SolutionSideNav from '@cambrian/app/components/nav/SolutionSideNav'
import SolverConfigInfo from '../interaction/config/SolverConfigInfo'
import { SolverContractCondition } from '@cambrian/app/models/SolverModel'
import { useCurrentSolver } from '@cambrian/app/hooks/useCurrentSolver'

const WriterSolverUI = ({
    solverContract,
    solverData,
    solverMethods,
}: DefaultSolverUIProps) => {
    const [solverAddressChain, setSolverAddressChain] = useState<string[]>([])
    const { currentCondition, setCurrentCondition } = useCurrentSolver()

    //TODO  Fetch solution and solver tags
    useEffect(() => {
        setSolverAddressChain([solverContract.address])
        if (solverData.conditions.length > 0) {
            // Default to newest condition
            setCurrentCondition(
                solverData.conditions[solverData.conditions.length - 1]
            )
        }
    }, [])

    const updateCondition = (updatedCondition: SolverContractCondition) => {
        setCurrentCondition(updatedCondition)
    }

    return (
        <Layout
            contextTitle="Writer Solver interaction"
            config={
                <SolverConfigInfo
                    solverData={solverData}
                    solverMethods={solverMethods}
                />
            }
            sidebar={
                <ConditionVersionSidebar
                    solverTitle="TODO Solver Tag - Title"
                    currentCondition={currentCondition}
                    updateCondition={updateCondition}
                    solverConditions={solverData.conditions}
                />
            }
            sideNav={
                <SolutionSideNav
                    solverAddressChain={solverAddressChain}
                    activeSolverAddress={solverContract.address}
                />
            }
            floatingActionButton={
                <ChatFAB solverAddress={solverContract.address} />
            }
        ></Layout>
    )
}

export default WriterSolverUI
