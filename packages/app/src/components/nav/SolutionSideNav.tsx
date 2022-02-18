import SideNav from './SideNav'
import SidebarSolverItem from './SidebarSolverItem'

interface SolutionSideNavProps {
    solverAddressChain: string[]
    activeSolverAddress: string
}

const SolutionSideNav = ({
    solverAddressChain,
    activeSolverAddress,
}: SolutionSideNavProps) => {
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
