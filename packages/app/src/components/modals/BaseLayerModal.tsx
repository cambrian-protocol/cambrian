import { Box, Layer, LayerProps, Text } from 'grommet'
import { CaretLeft, IconContext, X } from 'phosphor-react'

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
        onClickOutside={onBack || onClose}
        full="vertical"
        position="bottom"
        margin={{ top: 'small' }}
        background="background-popup"
    >
        <Box align="center" flex width="large">
            <Box
                width="100%"
                direction="row"
                justify="start"
                align="center"
                pad="medium"
                elevation="small"
                height={{ max: 'xxsmall' }}
            >
                <IconContext.Provider value={{ size: '24' }}>
                    {onClose && (
                        <Text size="small" weight="bold">
                            {title}
                        </Text>
                    )}
                    <Box onClick={onBack || onClose} focusIndicator={false}>
                        {onClose !== undefined ? <X /> : <CaretLeft />}
                    </Box>
                    {onBack && (
                        <Text size="small" weight="bold">
                            {title}
                        </Text>
                    )}
                </IconContext.Provider>
            </Box>
            <Box
                pad="medium"
                fill
                align="center"
                height={{ min: 'auto' }}
                overflow={{ vertical: 'auto' }}
            >
                {children}
            </Box>
            <Box pad={'medium'} />
        </Box>
    </Layer>
)

export default BaseLayerModal
