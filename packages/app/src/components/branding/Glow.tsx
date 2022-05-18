import { Box } from 'grommet'
import { BoxExtendedProps } from 'grommet'

interface GlowProps {
    left?: string
    bottom?: string
    top?: string
}

const Glow = ({
    height,
    width,
    left,
    bottom,
    top,
    ...rest
}: GlowProps & BoxExtendedProps) => {
    return (
        <Box
            style={{
                position: 'absolute',
                overflow: 'hidden',
                left: left || 0,
                bottom: bottom || 0,
                top: top || undefined,
                maxWidth: '100vw',
            }}
            height={height}
            width={width}
        >
            <Box
                style={{
                    position: 'absolute',
                    opacity: 0.18,
                    right: 0,
                    bottom: 0,
                }}
                width="100%"
                height="100%"
                background="radial-gradient(closest-side, #4e94bd 10%, transparent 100%)"
                {...rest}
            />
        </Box>
    )
}

export default Glow
