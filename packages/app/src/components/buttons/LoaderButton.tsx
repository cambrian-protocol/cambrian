import { useEffect, useRef, useState } from 'react'

import { Box } from 'grommet'
import { Button } from 'grommet'
import { ButtonExtendedProps } from 'grommet'
import { IconContext } from 'phosphor-react'
import { Spinner } from 'grommet'
import { Text } from 'grommet'
import { useWindowSize } from '@cambrian/app/hooks/useWindowSize'

export type LoaderButtonProps = ButtonExtendedProps & {
    isLoading: boolean
}

const LoaderButton = ({
    children,
    isLoading,
    label,
    icon,
    ...props
}: LoaderButtonProps) => {
    const windowSize = useWindowSize()
    const [showLoader, setShowLoader] = useState(false)
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null)

    useEffect(() => {
        if (ref.current && ref.current.getBoundingClientRect().width) {
            setWidth(ref.current.getBoundingClientRect().width)
        }
        if (ref.current && ref.current.getBoundingClientRect().height) {
            setHeight(ref.current.getBoundingClientRect().height)
        }
    }, [children, windowSize])

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
            {...props}
            ref={ref}
            style={
                showLoader
                    ? {
                          width: `${width}px`,
                          height: `${height}px`,
                      }
                    : {}
            }
            disabled={showLoader || props.disabled}
            label={
                label && (
                    <Box justify="center" align="center">
                        {!showLoader ? (
                            <Box animation="fadeIn">
                                <Text size="small">{label}</Text>
                            </Box>
                        ) : (
                            <Box animation="fadeIn">
                                <Spinner color={'white'} />
                            </Box>
                        )}
                    </Box>
                )
            }
            icon={
                icon && !label ? (
                    <Box justify="center" align="center">
                        {!showLoader ? (
                            <IconContext.Provider value={{ size: '24' }}>
                                <Box align="center" animation="fadeIn">
                                    {icon}
                                </Box>
                            </IconContext.Provider>
                        ) : (
                            <Box animation="fadeIn">
                                <Spinner color={'white'} size="xsmall" />
                            </Box>
                        )}
                    </Box>
                ) : !showLoader ? (
                    icon
                ) : undefined
            }
        />
    )
}

export default LoaderButton
