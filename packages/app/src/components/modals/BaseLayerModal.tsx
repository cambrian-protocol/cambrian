import { Box, Layer, LayerProps, Text } from 'grommet'
import { CaretLeft, IconContext, X } from 'phosphor-react'

import Glow from '../branding/Glow'
import { PropsWithChildren } from 'react'

export type BaseLayerModalProps = PropsWithChildren<{}> &
    LayerProps & {
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
    ...props
}: BaseLayerModalProps) => (
    <Layer
        {...props}
        responsive
        onEsc={onBack || onClose}
        full="vertical"
        position="bottom"
        background="background-back"
    >
        <Box
            width="large"
            style={{ position: 'relative' }}
            overflow="hidden"
            height={{ min: '100vh' }}
        >
            <Glow height="800px" width="1000px" left={'5%'} top={'-200px'} />
            <Box
                width="100%"
                direction="row"
                justify="start"
                align="center"
                pad="medium"
                elevation="small"
                height={{ max: 'xxsmall', min: 'xxsmall' }}
                style={{ position: 'relative' }}
            >
                <IconContext.Provider value={{ size: '24' }}>
                    <Box onClick={onBack || onClose} focusIndicator={false}>
                        {onClose !== undefined ? <X /> : <CaretLeft />}
                    </Box>
                </IconContext.Provider>
                <Text size="small" weight="bold">
                    {title}
                </Text>
            </Box>
            <Box
                style={{ position: 'relative' }}
                height={{ min: 'auto' }}
                overflow={{ vertical: 'auto' }}
                pad={{ vertical: 'large', horizontal: 'medium' }}
            >
                {children}
            </Box>
        </Box>
    </Layer>
)

export default BaseLayerModal
