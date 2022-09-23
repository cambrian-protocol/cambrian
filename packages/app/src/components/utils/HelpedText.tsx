import { Box, Text } from 'grommet'
import React from 'react'
import { ActionbarInfoType } from '../bars/actionbars/BaseActionbar'
import HelpedTextDropButton from '../buttons/HelpedTextDropButton'
import { HelpedTextDropContainerProps } from '../containers/HelpedTextDropContainer'

export const HelpedText = ({
    children,
    info,
}: {
    children: React.ReactElement
    info: HelpedTextDropContainerProps
}) => {
    return (
        <Box gap="xxsmall" direction="row" alignContent="center">
            {children}
            <HelpedTextDropButton info={info} />
        </Box>
    )
}
