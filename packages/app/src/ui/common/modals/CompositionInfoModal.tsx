import { Box, Button } from 'grommet'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import { PriceModel } from '@cambrian/app/components/bars/actionbars/proposal/ProposalReviewActionbar'
import SolverInfoModal from './SolverInfoModal'
import { useState } from 'react'

interface CompositionInfoModalProps {
    onClose: () => void
    composition: CompositionModel
    price: PriceModel
}

const CompositionInfoModal = ({
    onClose,
    composition,
    price,
}: CompositionInfoModalProps) => {
    const [showSolverConfigModal, setShowSolverConfigModal] = useState<number>() // Solver Index
    return (
        <>
            {composition.solvers.length === 1 ? (
                <SolverInfoModal
                    onClose={onClose}
                    composition={composition}
                    composerSolver={composition.solvers[0]}
                    price={price}
                />
            ) : (
                <Box gap="small">
                    {composition.solvers.map((solver, idx) => (
                        <Button
                            key={idx}
                            label={solver.solverTag.title}
                            onClick={() => setShowSolverConfigModal(idx)}
                        />
                    ))}
                </Box>
            )}
            {showSolverConfigModal && (
                <SolverInfoModal
                    onClose={() => setShowSolverConfigModal(undefined)}
                    composition={composition}
                    composerSolver={composition.solvers[showSolverConfigModal]}
                    price={price}
                />
            )}
        </>
    )
}

export default CompositionInfoModal
