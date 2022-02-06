import { Box } from 'grommet'
import InteractionSidebar from '@cambrian/app/ui/interaction/sidebar/InteractionSidebar'
import { Layout } from '@cambrian/app/src/components/layout/Layout'
import { useCurrentSolver } from '@cambrian/app/src/hooks/useCurrentSolver'
import { useCurrentUserOrSigner } from '@cambrian/app/src/hooks/useCurrentUserOrSigner'
import { useEffect } from 'react'

export default function InteractionPage() {
    const { currentUser, setCurrentUserRole } = useCurrentUserOrSigner()
    const { currentSolverConfig } = useCurrentSolver()

    useEffect(() => {
        // Set role
        /*         switch (currentUser?.address) {
            case currentSolverConfig?.keeper:
                setCurrentUserRole('Keeper')
                break
            case currentSolverConfig?.arbitrator:
                setCurrentUserRole('Arbitrator')
                break
            default:
                setCurrentUserRole('Public')
        }
 */
        // TODO Keeper must pick a writer and fill in the address - Then the solve will be executed
        // Keeper might have some manual slots to fill. Everybody else show a 'In progress, wait until Keeper has kicked off' - screen.
        // The screen for the Keeper should include all manual slots he needs to input ( MVP writer address) and then a button with executSolve()
    }, [])

    return (
        <Layout contextTitle="Interact" sidebar={<InteractionSidebar />}>
            <Box>Interaction UI</Box>
        </Layout>
    )
}
