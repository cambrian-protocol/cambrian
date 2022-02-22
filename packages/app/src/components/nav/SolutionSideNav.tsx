import SideNav from './SideNav'
import SidebarSolverItem from './SidebarSolverItem'

interface SolutionSideNavProps {
    activeSolverAddress: string
    solverChain: string[]
}

const SolutionSideNav = ({
    solverChain,
    activeSolverAddress,
}: SolutionSideNavProps) => {
    return (
        <SideNav>
            {solverChain.map((solverAddress) => (
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
