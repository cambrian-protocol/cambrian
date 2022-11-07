import { Box, Layer } from 'grommet'

import { PropsWithChildren } from 'react'
import { X } from 'phosphor-react'

type BasePopupModalProps = PropsWithChildren<{}> & {
    onClose: () => void
}

const BasePopupModal = ({ onClose, children }: BasePopupModalProps) => {
    return (
        <Layer
            onEsc={onClose}
            background={'background-contrast'}
            responsive={false}
        >
            <Box width="medium" border round="xsmall">
                <Box direction="row" elevation="small">
                    <Box onClick={onClose} pad="small" focusIndicator={false}>
                        <X size={'24'} />
                    </Box>
                    <Box flex />
                </Box>
                <Box pad="medium" gap="small" align="center" justify="center">
                    {children}
                </Box>
            </Box>
        </Layer>
    )
}

export default BasePopupModal
