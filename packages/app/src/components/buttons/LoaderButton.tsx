import { useEffect, useRef, useState } from 'react'

import BaseSkeletonBox from '../skeletons/BaseSkeletonBox'
import { Box } from 'grommet'
import { Button } from 'grommet'
import { ButtonExtendedProps } from 'grommet'
import { Spinner } from 'grommet'
import { Text } from 'grommet'
import { useWindowSize } from '@cambrian/app/hooks/useWindowSize'

export type LoaderButtonProps = ButtonExtendedProps & {
    isLoading?: boolean
    isInitializing?: boolean
}

const LoaderButton = ({
    children,
    isLoading,
    label,
    icon,
    isInitializing,
    size,
    ...props
}: LoaderButtonProps) => {
    const windowSize = useWindowSize()
    const [showLoader, setShowLoader] = useState(false)
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null)

    useEffect(() => {
        initSize()
    }, [children, windowSize, props.disabled, isLoading])

    const initSize = () => {
        if (ref.current && ref.current.getBoundingClientRect().width) {
            setWidth(ref.current.getBoundingClientRect().width)
        }
        if (ref.current && ref.current.getBoundingClientRect().height) {
            setHeight(ref.current.getBoundingClientRect().height)
        }
    }

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
        <Box style={{ position: 'relative' }}>
            {isInitializing ? (
                <BaseSkeletonBox height={'3.5em'} width={'100%'} />
            ) : (
                <Button
                    {...props}
                    ref={ref}
                    style={
                        showLoader
                            ? {
                                  width: `${width}px`,
                                  height: `${height}px`,
                                  maxWidth: '100%',
                              }
                            : {}
                    }
                    disabled={showLoader || props.disabled}
                    label={
                        label && (
                            <Box justify="center" align="center">
                                {!showLoader ? (
                                    <Box animation="fadeIn">
                                        <Text size={size}>{label}</Text>
                                    </Box>
                                ) : (
                                    <Box
                                        animation="fadeIn"
                                        align="center"
                                        style={{
                                            position: 'absolute',
                                            width: '100%',
                                            left: 0,
                                            right: 0,
                                            marginLeft: 'auto',
                                            marginRight: 'auto',
                                        }}
                                    >
                                        <Spinner
                                            color={'dark-4'}
                                            size="xsmall"
                                        />
                                    </Box>
                                )}
                            </Box>
                        )
                    }
                    icon={
                        showLoader ? (
                            !label ? (
                                <Spinner color={'dark-4'} size="xsmall" />
                            ) : undefined
                        ) : (
                            icon
                        )
                    }
                />
            )}
        </Box>
    )
}

export default LoaderButton
