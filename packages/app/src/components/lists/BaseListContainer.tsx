import { Box } from 'grommet'
import { PropsWithChildren } from 'react'

const BaseListContainer = ({ children }: PropsWithChildren<{}>) => (
    <Box gap="medium" fill>
        {children}
    </Box>
)

export default BaseListContainer
