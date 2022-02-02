import { Box, Layer, Text } from 'grommet'
import { CaretLeft, IconContext, X } from 'phosphor-react'

import { PropsWithChildren } from 'react'

type BaseLayerModalProps = PropsWithChildren<{}> & {
    title?: string
} & (
        | { onBack: () => void; onClose?: never }
        | { onClose: () => void; onBack?: never }
    )

const BaseLayerModal = ({
    children,
    title,
    onBack,
    onClose,
}: BaseLayerModalProps) => (
    <Layer
        responsive
        onEsc={onBack || onClose}
        onClickOutside={onBack || onClose}
        full="vertical"
        position="bottom"
        margin={{ top: 'small' }}
        background="background"
    >
        <Box align="center" fill>
            <Box
                width="100%"
                direction="row"
                round="full"
                justify={onClose !== undefined ? 'end' : 'start'}
            >
                <IconContext.Provider value={{ size: '24' }}>
                    <Box
                        pad="medium"
                        onClick={onBack || onClose}
                        focusIndicator={false}
                    >
                        {onClose !== undefined ? <X /> : <CaretLeft />}
                    </Box>
                </IconContext.Provider>
                <Text>{title}</Text>
            </Box>
            <Box
                pad="medium"
                fill="vertical"
                align="center"
                height={{ min: 'auto' }}
            >
                {children}
            </Box>
        </Box>
    </Layer>
)

export default BaseLayerModal
