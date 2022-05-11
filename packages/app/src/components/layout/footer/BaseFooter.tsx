import { Box } from 'grommet'
import DesktopFooter from './DesktopFooter'
import Glow from '../../branding/Glow'
import MobileFooter from './MobileFooter'
import { ResponsiveContext } from 'grommet'
import { WorldMap } from 'grommet'
import styled from 'styled-components'

const RelativeBox = styled(Box)`
    position: relative;
    overflow: hidden;
`

const StyledWorldMap = styled(WorldMap)`
    position: absolute;
    top: 20%;
    left: 40%;
    opacity: 0.05;
`

const BaseFooter = () => (
    <ResponsiveContext.Consumer>
        {(screenSize) => {
            return (
                <Box background="background-back">
                    <RelativeBox>
                        <StyledWorldMap />
                        <Glow />
                        <RelativeBox>
                            {screenSize !== 'small' ? (
                                <DesktopFooter />
                            ) : (
                                <MobileFooter />
                            )}
                        </RelativeBox>
                    </RelativeBox>
                </Box>
            )
        }}
    </ResponsiveContext.Consumer>
)

export default BaseFooter
