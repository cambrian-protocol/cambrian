import SideNav from './SideNav'
import SidebarSolverItem from './SidebarSolverItem'

interface SolutionSideNavProps {
    activeSolverAddress: string
    solverChainAddresses: string[]
}

const SolutionSideNav = ({
    activeSolverAddress,
    solverChainAddresses,
}: SolutionSideNavProps) => {
    return (
        <SideNav>
            {solverChainAddresses.map((solverAddress) => (
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
