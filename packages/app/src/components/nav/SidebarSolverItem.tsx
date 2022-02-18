import { Anchor, Box, ResponsiveContext } from 'grommet'

import { PuzzlePiece } from 'phosphor-react'

interface SidebarSolverItemProps {
    isActive?: boolean
    solverAddress: string
}

const SidebarSolverItem = ({
    isActive,
    solverAddress,
}: SidebarSolverItemProps) => {
    return (
        <ResponsiveContext.Consumer>
            {(screenSize) => (
                <Anchor href={`/solvers/${solverAddress}`}>
                    <Box direction="row">
                        <Box
                            width="3px"
                            background={isActive ? 'white' : 'transparent'}
                            round="small"
                        />
                        <Box
                            pad={screenSize === 'small' ? 'medium' : 'small'}
                            margin={{ horizontal: 'small' }}
                            background="brand"
                            round="small"
                        >
                            <PuzzlePiece size="24" color="white" />
                        </Box>
                    </Box>
                </Anchor>
            )}
        </ResponsiveContext.Consumer>
    )
}

export default SidebarSolverItem
