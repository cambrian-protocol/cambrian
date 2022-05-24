import { Box } from 'grommet'
import DesktopFooter from './DesktopFooter'
import Glow from '../../branding/Glow'
import MobileFooter from './MobileFooter'
import { ResponsiveContext } from 'grommet'
import { WorldMap } from 'grommet'

const BaseFooter = () => (
    <ResponsiveContext.Consumer>
        {(screenSize) => {
            return (
                <Box height={{ min: 'auto' }}>
                    <Box style={{ position: 'relative', overflow: 'hidden' }}>
                        <WorldMap
                            color="brand"
                            style={{
                                position: 'absolute',
                                top: '20%',
                                left: '40%',
                                opacity: 0.1,
                            }}
                        />
                        <Glow
                            height="800px"
                            width="1000px"
                            left={'-10%'}
                            bottom="-200px"
                        />
                        <Box style={{ position: 'relative' }}>
                            {screenSize !== 'small' ? (
                                <DesktopFooter />
                            ) : (
                                <MobileFooter />
                            )}
                        </Box>
                    </Box>
                </Box>
            )
        }}
    </ResponsiveContext.Consumer>
)

export default BaseFooter
