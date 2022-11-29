import { Box, BoxProps } from 'grommet'
import styled, { keyframes } from 'styled-components'

import { PropsWithChildren } from 'react'

const BaseSkeletonBox = ({
    height,
    width,
    children,
}: BoxProps & PropsWithChildren<{}>) => {
    return (
        <SkeletonBox
            height={height}
            width={width}
            round="xsmall"
            justify="center"
            align="center"
        >
            {children}
        </SkeletonBox>
    )
}

const shine = keyframes`
    to {
        background-position: right -1000px top 0;
    }

`
const SkeletonBox = styled(Box)`
    background-image: linear-gradient(
        80deg,
        rgba(120, 120, 120, 0),
        rgba(120, 120, 120, 0.149),
        rgba(120, 120, 120, 0)
    );
    background-size: 1000px 100%;
    background-repeat: no-repeat;
    background-color: #80808026;
    background-position: left -1000px top 0;
    animation: ${shine} 2s linear infinite;
`

export default BaseSkeletonBox
