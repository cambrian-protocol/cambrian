import { useEffect, useState } from 'react'

import SideNav from './SideNav'
import SidebarSolverItem from './SidebarSolverItem'
import { UserType } from '@cambrian/app/store/UserContext'
import { ethers } from 'ethers'
import { getSolverChain } from '../solver/SolverGetters'

interface SolutionSideNavProps {
    activeSolverAddress: string
    solverContract: ethers.Contract
    currentUser: UserType
}

const SolutionSideNav = ({
    activeSolverAddress,
    solverContract,
    currentUser,
}: SolutionSideNavProps) => {
    const [solverAddressChain, setSolverAddessChain] = useState<string[]>([])

    useEffect(() => {
        initSolverChain()
    }, [])

    const initSolverChain = async () => {
        const fetchedSolverChain = await getSolverChain(
            currentUser,
            solverContract
        )
        setSolverAddessChain(fetchedSolverChain)
    }

    return (
        <SideNav>
            {solverAddressChain.map((solverAddress) => (
                <SidebarSolverItem
                    key={solverAddress}
                    solverAddress={solverAddress}
                    isActive={solverAddress === activeSolverAddress}
                />
            ))}
        </SideNav>
    )
}

export default SolutionSideNav
