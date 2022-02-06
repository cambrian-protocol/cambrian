import { Box, ResponsiveContext } from 'grommet'

import { PuzzlePiece } from 'phosphor-react'

interface SidebarSolverItemProps {
    active: boolean
    onClick: () => void
}

const SidebarSolverItem = ({ onClick, active }: SidebarSolverItemProps) => (
    <ResponsiveContext.Consumer>
        {(screenSize) => (
            <Box direction="row" onClick={onClick} focusIndicator={false}>
                <Box
                    width="3px"
                    background={active ? 'white' : 'transparent'}
                    round="small"
                />
                <Box
                    pad={screenSize === 'small' ? 'medium' : 'small'}
                    margin={{ horizontal: 'small' }}
                    background="primary-gradient"
                    round="small"
                >
                    <PuzzlePiece size="24" />
                </Box>
            </Box>
        )}
    </ResponsiveContext.Consumer>
)

export default SidebarSolverItem
