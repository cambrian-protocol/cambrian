import { Box, Text } from 'grommet'
import { FilmScript, ListNumbers } from 'phosphor-react'
import React, { useState } from 'react'

import { CompositionModel } from '@cambrian/app/models/CompositionModel'
import DropButtonListItem from '../list/DropButtonListItem'
import ResponsiveButton from './ResponsiveButton'
import SolverInfoModal from '@cambrian/app/ui/common/modals/SolverInfoModal'
import { TokenModel } from '@cambrian/app/models/TokenModel'
import { cpTheme } from '@cambrian/app/theme/theme'

interface ISolverConfigInfoButton {
    composition: CompositionModel
    price: { amount: number | ''; token: TokenModel }
}

const SolverConfigInfoButton = ({
    composition,
    price,
}: ISolverConfigInfoButton) => {
    const [showSolverConfigInfoIndex, setShowSolverConfigInfoIndex] =
        useState<number>()

    return (
        <>
            <ResponsiveButton
                label="Solver Configurations"
                icon={<ListNumbers color={cpTheme.global.colors['dark-4']} />}
                dropContent={
                    <Box>
                        {composition.solvers.map((solver, idx) => (
                            <DropButtonListItem
                                key={idx}
                                label={
                                    <Box width="medium">
                                        <Text>{solver.solverTag.title}</Text>
                                        <Text
                                            size="xsmall"
                                            color="dark-4"
                                            truncate
                                        >
                                            {solver.solverTag.description}
                                        </Text>
                                    </Box>
                                }
                                icon={<FilmScript />}
                                onClick={() =>
                                    setShowSolverConfigInfoIndex(idx)
                                }
                            />
                        ))}
                    </Box>
                }
                dropAlign={{
                    top: 'bottom',
                    right: 'right',
                }}
                dropProps={{
                    round: {
                        corner: 'bottom',
                        size: 'xsmall',
                    },
                }}
            />
            {showSolverConfigInfoIndex !== undefined && (
                <SolverInfoModal
                    onClose={() => setShowSolverConfigInfoIndex(undefined)}
                    composition={composition}
                    composerSolver={
                        composition.solvers[showSolverConfigInfoIndex]
                    }
                    price={price}
                />
            )}
        </>
    )
}

export default SolverConfigInfoButton
