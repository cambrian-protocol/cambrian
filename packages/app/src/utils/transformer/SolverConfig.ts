import { useCurrentSolver } from '../../hooks/useCurrentSolver'

export const SolverConfig = {
    getRecipients: () => {
        const { currentSolverConfig } = useCurrentSolver()
        if (currentSolverConfig) {
            // TODO get recipient Addresses from solverconfig
        }
    },
    getRecipientAmounts: () => {
        // TODO get recipient Addresses with amounts
    },
    // ...
}
