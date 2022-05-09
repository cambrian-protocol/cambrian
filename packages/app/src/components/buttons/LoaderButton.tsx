import { animated, useSpring } from 'react-spring'
import { useEffect, useRef, useState } from 'react'

import { Box } from 'grommet'
import { Button } from 'grommet'
import { ButtonExtendedProps } from 'grommet'
import { Spinner } from 'grommet'
import { Text } from 'grommet'

type LoaderButtonProps = ButtonExtendedProps & {
    isLoading: boolean
}

const LoaderButton = ({
    children,
    isLoading,
    label,
    ...props
}: LoaderButtonProps) => {
    const [showLoader, setShowLoader] = useState(false)
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null)

    const fadeOutProps = useSpring({ opacity: showLoader ? 1 : 0 })
    const fadeInProps = useSpring({ opacity: showLoader ? 0 : 1 })

    useEffect(() => {
        if (ref.current && ref.current.getBoundingClientRect().width) {
            setWidth(ref.current.getBoundingClientRect().width)
        }
        if (ref.current && ref.current.getBoundingClientRect().height) {
            setHeight(ref.current.getBoundingClientRect().height)
        }
    }, [children])

    useEffect(() => {
        if (isLoading) {
            setShowLoader(true)
        }
        // Show loader a bits longer to avoid loading flash
        if (!isLoading && showLoader) {
            const timeout = setTimeout(() => {
                setShowLoader(false)
            }, 400)

            return () => {
                clearTimeout(timeout)
            }
        }
    }, [isLoading, showLoader])
    return (
        <Button
            ref={ref}
            style={
                showLoader
                    ? {
                          width: `${width}px`,
                          height: `${height}px`,
                      }
                    : {}
            }
            disabled={showLoader}
            label={
                <Box justify="center" align="center">
                    {!showLoader ? (
                        <animated.div style={fadeInProps}>
                            <Text size="small">{label}</Text>
                        </animated.div>
                    ) : (
                        <animated.div style={fadeOutProps}>
                            <Spinner color={'white'} />
                        </animated.div>
                    )}
                </Box>
            }
            {...props}
        />
    )
}

export default LoaderButton
